import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq, or, and, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { urls } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";

const bodySchema = z.object({
  originalUrl: z
    .string()
    .min(1)
    .max(2048)
    .refine((value) => {
      try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    }, "Invalid URL"),
  customAlias: z
    .string()
    .regex(/^[a-zA-Z0-9]+$/)
    .min(3)
    .max(20)
    .optional(),
});

function generateShortCode(): string {
  return nanoid(7);
}

function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { originalUrl, customAlias } = parsed.data;

    const { userId } = await auth();
    const ip = getClientIp(req.headers);
    const requesterId = userId ?? `anon:${sha256(ip)}`;

    if (customAlias) {
      const existing = await db
        .select({ id: urls.id })
        .from(urls)
        .where(or(eq(urls.customAlias, customAlias), eq(urls.shortCode, customAlias)))
        .limit(1);
      if (existing.length > 0) {
        return NextResponse.json({ error: "Alias already in use" }, { status: 409 });
      }
    }

    let shortCode = customAlias ?? generateShortCode();

    if (!customAlias) {
      for (let i = 0; i < 5; i++) {
        const conflict = await db
          .select({ id: urls.id })
          .from(urls)
          .where(eq(urls.shortCode, shortCode))
          .limit(1);
        if (conflict.length === 0) break;
        shortCode = generateShortCode();
      }
    }

    const now = new Date();
    const [created] = await db
      .insert(urls)
      .values({
        userId: requesterId,
        originalUrl,
        shortCode,
        customAlias: customAlias ?? null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: urls.id, shortCode: urls.shortCode, originalUrl: urls.originalUrl });

    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const normalized = base.endsWith("/") ? base.slice(0, -1) : base;
    const shortUrl = `${normalized}/${created.shortCode}`;

    return NextResponse.json(
      { id: created.id, shortCode: created.shortCode, shortUrl, originalUrl: created.originalUrl },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const urlObj = new URL(req.url);
  const page = Math.max(1, parseInt(urlObj.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(urlObj.searchParams.get("limit") || "10", 10)));
  const search = (urlObj.searchParams.get("search") || "").trim();
  const sortBy = urlObj.searchParams.get("sortBy") || "created_desc"; // created_desc | created_asc | clicks_desc | clicks_asc

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const offset = (page - 1) * limit;

  const whereParts = [sql`u.user_id = ${userId}`];
  if (search) {
    const pattern = `%${search.toLowerCase()}%`;
    whereParts.push(
      sql`(lower(u.original_url) like ${pattern} or lower(u.short_code) like ${pattern} or lower(u.custom_alias) like ${pattern})`
    );
  }

  const orderByExpr =
    sortBy === "created_asc"
      ? sql`u.created_at asc`
      : sortBy === "clicks_desc"
      ? sql`click_count desc`
      : sortBy === "clicks_asc"
      ? sql`click_count asc`
      : sql`u.created_at desc`;

  const rows = await db.execute(
    sql`
      select u.id, u.original_url as "originalUrl", u.short_code as "shortCode", u.custom_alias as "customAlias",
             u.is_active as "isActive", u.created_at as "createdAt", u.updated_at as "updatedAt",
             coalesce(c.cnt, 0) as "clickCount"
      from ${urls} as u
      left join (
        select url_id, count(*) as cnt
        from clicks
        group by url_id
      ) c on c.url_id = u.id
      where ${and(...whereParts)}
      order by ${orderByExpr}
      limit ${limit} offset ${offset}
    `
  );

  const totalRes = await db.execute(
    sql`
      select count(*)::int as count
      from ${urls} as u
      where ${and(...whereParts)}
    `
  );

  const totalResult = totalRes as { rows?: Array<{ count: number }> };
  const rowsResult = rows as { rows?: Array<unknown> };
  
  const total = (Array.isArray(totalResult.rows) ? totalResult.rows[0]?.count : (totalRes as unknown as Array<{ count: number }>)[0]?.count) || 0;
  const items = rowsResult.rows ?? rows;

  return NextResponse.json({ page, limit, total, items }, { status: 200 });
}

 

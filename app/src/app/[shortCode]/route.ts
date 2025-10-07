import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { urls, clicks } from "@/db/schema";
import crypto from "crypto";

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

export async function GET(
  req: Request,
  ctx: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode: code } = await ctx.params;
  if (!code) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const found = await db
    .select({
      id: urls.id,
      originalUrl: urls.originalUrl,
      isActive: urls.isActive,
    })
    .from(urls)
    .where(eq(urls.shortCode, code))
    .limit(1);

  if (found.length === 0) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const target = found[0];
  if (!target.isActive) {
    return NextResponse.json({ error: "Link is inactive" }, { status: 410 });
  }

  try {
    const ipHash = sha256(getClientIp(req.headers));
    await db.insert(clicks).values({ urlId: target.id, ipHash });
    console.log(`[CLICK RECORDED] URL ID: ${target.id}, IP Hash: ${ipHash.substring(0, 8)}...`);
  } catch (err) {
    console.error(`[CLICK ERROR] Failed to record click for URL ID ${target.id}:`, err);
  }

  return NextResponse.redirect(target.originalUrl, { status: 302 });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/db/client";
import { urls } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const rows = await db
    .select({
      id: urls.id,
      originalUrl: urls.originalUrl,
      shortCode: urls.shortCode,
      customAlias: urls.customAlias,
      isActive: urls.isActive,
      createdAt: urls.createdAt,
      updatedAt: urls.updatedAt,
      userId: urls.userId,
    })
    .from(urls)
    .where(eq(urls.id, id))
    .limit(1);

  if (rows.length === 0) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  const item = rows[0];
  if (item.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(item, { status: 200 });
}

const patchSchema = z.object({
  customAlias: z
    .string()
    .regex(/^[a-zA-Z0-9]+$/)
    .min(3)
    .max(20)
    .optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const current = await db
    .select({ id: urls.id, userId: urls.userId })
    .from(urls)
    .where(eq(urls.id, id))
    .limit(1);
  if (current.length === 0) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  if (current[0]!.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { customAlias, isActive } = parsed.data;

  if (customAlias) {
    const existing = await db
      .select({ id: urls.id })
      .from(urls)
      .where(and(eq(urls.userId, userId), or(eq(urls.customAlias, customAlias), eq(urls.shortCode, customAlias))))
      .limit(1);
    if (existing.length > 0 && existing[0]!.id !== id) {
      return NextResponse.json({ error: "Alias already in use" }, { status: 409 });
    }
  }

  const [updated] = await db
    .update(urls)
    .set({
      customAlias: customAlias ?? undefined,
      isActive: typeof isActive === "boolean" ? isActive : undefined,
      updatedAt: new Date(),
    })
    .where(eq(urls.id, id))
    .returning({
      id: urls.id,
      originalUrl: urls.originalUrl,
      shortCode: urls.shortCode,
      customAlias: urls.customAlias,
      isActive: urls.isActive,
      updatedAt: urls.updatedAt,
    });

  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const existing = await db
    .select({ id: urls.id, userId: urls.userId })
    .from(urls)
    .where(eq(urls.id, id))
    .limit(1);

  if (existing.length === 0) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  if (existing[0]!.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(urls).where(eq(urls.id, id));
  return NextResponse.json({ ok: true }, { status: 200 });
}

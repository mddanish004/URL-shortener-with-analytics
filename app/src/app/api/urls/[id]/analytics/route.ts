import { NextResponse } from "next/server";
import { and, between, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { urls } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const requestUrl = new URL(req.url);
  const startDateParam = requestUrl.searchParams.get("startDate");
  const endDateParam = requestUrl.searchParams.get("endDate");

  const urlRow = await db.execute(sql`
    select id, user_id, original_url, short_code, is_active
    from ${urls}
    where id = ${id}
  `);
  
  const urlData = (urlRow as { rows?: Array<{ id: string; user_id: string; original_url: string; short_code: string; is_active: boolean }> }).rows?.[0];
  if (!urlData) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  if (urlData.user_id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const startDate = startDateParam ? new Date(startDateParam) : undefined;
  const endDate = endDateParam ? new Date(endDateParam) : undefined;

  const whereParts: ReturnType<typeof sql>[] = [sql`url_id = ${id}`];
  if (startDate && endDate) whereParts.push(between(sql`clicked_at`, startDate, endDate));
  else if (startDate) whereParts.push(gte(sql`clicked_at`, startDate));
  else if (endDate) whereParts.push(lte(sql`clicked_at`, endDate));

  const totals = await db.execute(sql`
    select count(*)::int as total
    from clicks
    where ${and(...whereParts)}
  `);

  const series = await db.execute(sql`
    select date_trunc('day', clicked_at) as day, count(*)::int as count
    from clicks
    where ${and(...whereParts)}
    group by 1
    order by day asc
  `);

  const totalsResult = totals as { rows?: Array<{ total: number }> };
  const seriesResult = series as { rows?: Array<{ day: string; count: number }> };
  
  return NextResponse.json({
    total: totalsResult.rows ? totalsResult.rows[0]?.total : (totals as unknown as Array<{ total: number }>)[0]?.total,
    series: seriesResult.rows ?? series,
  });
}

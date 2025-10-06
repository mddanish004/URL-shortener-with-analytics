import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { urls } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const totalRes = await db.execute(sql`select count(*)::int as count from ${urls} where ${eq(urls.userId, userId)}`);
  const totalResult = totalRes as { rows?: Array<{ count: number }> };
  const count = totalResult.rows?.[0]?.count ?? 0;

  const recentRes = await db.execute(sql`
    select u.id, u.original_url as "originalUrl", u.short_code as "shortCode", coalesce(c.cnt,0) as "clickCount", u.created_at as "createdAt"
    from ${urls} u
    left join (
      select url_id, count(*) as cnt from clicks group by url_id
    ) c on c.url_id = u.id
    where u.user_id = ${userId}
    order by u.created_at desc
    limit 5
  `);
  const recentResult = recentRes as { rows?: Array<{ id: string; originalUrl: string; shortCode: string; clickCount: number; createdAt: string }> };
  const recent = recentResult.rows ?? [];

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <h2>Overview</h2>
        <div>Total Links: {count}</div>
      </div>
      <div>
        <h3>Recent Links</h3>
        <ul>
          {recent.map((r) => (
            <li key={r.id}>
              <a href={`/dashboard/links/${r.id}`}>{r.shortCode}</a> — {r.originalUrl} — {r.clickCount} clicks
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

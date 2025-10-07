import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;

  const cookie = h.get("cookie") ?? "";

  const [overviewRes, recentRes] = await Promise.all([
    fetch(`${baseUrl}/api/urls?page=1&limit=1`, { cache: "no-store", headers: { cookie } }),
    fetch(`${baseUrl}/api/urls?page=1&limit=5`, { cache: "no-store", headers: { cookie } }),
  ]);

  let count = 0;
  let recent: Array<{ id: string; originalUrl: string; shortCode: string; clickCount: number; createdAt: string }> = [];

  if (overviewRes.ok) {
    const data = await overviewRes.json();
    count = data.total ?? 0;
  }
  if (recentRes.ok) {
    const data = await recentRes.json();
    recent = data.items ?? [];
  }

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

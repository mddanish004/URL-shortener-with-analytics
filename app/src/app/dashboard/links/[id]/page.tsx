import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return null;
  const { id } = await params;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;
  const cookie = h.get("cookie") ?? "";

  const [detailRes, analyticsRes] = await Promise.all([
    fetch(`${baseUrl}/api/urls/${id}`, { cache: "no-store", headers: { cookie } }),
    fetch(`${baseUrl}/api/urls/${id}/analytics`, { cache: "no-store", headers: { cookie } }),
  ]);

  if (!detailRes.ok) {
    return <div>Unable to load link.</div>;
  }

  const detail = await detailRes.json();
  const analytics = analyticsRes.ok ? await analyticsRes.json() : { total: 0, series: [] };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>Link Details</h2>
      <div>
        <div>
          <strong>Short Code:</strong> {detail.shortCode}
        </div>
        <div>
          <strong>Short URL:</strong> <a href={`/${detail.shortCode}`} target="_blank" rel="noreferrer">/{detail.shortCode}</a>
        </div>
        <div>
          <strong>Original URL:</strong> {detail.originalUrl}
        </div>
        <div>
          <strong>Status:</strong> {detail.isActive ? "Active" : "Inactive"}
        </div>
      </div>
      <div>
        <h3>Clicks Over Time</h3>
        <div style={{ marginBottom: 8 }}>
          <Link href={"/dashboard/links/" + id}>Refresh</Link>
        </div>
        <ul>
          {analytics.series.map((pt: { day: string; count: number }) => (
            <li key={pt.day}>{new Date(pt.day).toLocaleDateString()}: {pt.count}</li>
          ))}
        </ul>
        <div>Total clicks: {analytics.total ?? 0}</div>
      </div>
    </div>
  );
}

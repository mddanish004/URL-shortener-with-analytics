import { auth } from "@clerk/nextjs/server";

export default async function LinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return null;
  const { id } = await params;

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const [detailRes, analyticsRes] = await Promise.all([
    fetch(`${base}/api/urls/${id}`, { cache: "no-store" }),
    fetch(`${base}/api/urls/${id}/analytics`, { cache: "no-store" }),
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
          <strong>Original URL:</strong> {detail.originalUrl}
        </div>
        <div>
          <strong>Status:</strong> {detail.isActive ? "Active" : "Inactive"}
        </div>
      </div>
      <div>
        <h3>Clicks Over Time</h3>
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

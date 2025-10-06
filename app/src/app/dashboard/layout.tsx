import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "100vh" }}>
      <aside style={{ padding: 16, borderRight: "1px solid #eee" }}>
        <h3>Dashboard</h3>
        <nav style={{ display: "grid", gap: 8 }}>
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/links">My Links</Link>
        </nav>
      </aside>
      <section style={{ padding: 24 }}>{children}</section>
    </div>
  );
}

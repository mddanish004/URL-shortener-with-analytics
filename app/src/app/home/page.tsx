"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import UrlShortenForm from "@/components/UrlShortenForm";

interface RecentLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  clickCount: number;
  createdAt: string;
}

export default function HomeCombinedPage() {
  const { user, isLoaded } = useUser();
  const [count, setCount] = useState(0);
  const [recent, setRecent] = useState<RecentLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      const [overviewRes, recentRes] = await Promise.all([
        fetch("/api/urls?page=1&limit=1"),
        fetch("/api/urls?page=1&limit=5")
      ]);

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setCount(overviewData.total || 0);
      }

      if (recentRes.ok) {
        const recentData = await recentRes.json();
        setRecent(recentData.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
  }, [isLoaded, user, fetchData]);

  const handleUrlCreated = () => {
    fetchData();
  };

  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  return (
    <main style={{ padding: 24, display: "grid", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SignOutButton>
          <button style={{ padding: 8 }}>Log out</button>
        </SignOutButton>
      </div>
      <section>
        <h2>Quick Shorten</h2>
        <UrlShortenForm onSuccess={handleUrlCreated} />
      </section>
      <section>
        <h2>Overview</h2>
        <div>Total Links: {loading ? "Loading..." : count}</div>
      </section>
      <section>
        <h3>Recent Links</h3>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul>
            {recent.map((r) => (
              <li key={r.id}>
                <a href={`/dashboard/links/${r.id}`}>{r.shortCode}</a> — {r.originalUrl} — {r.clickCount} clicks
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

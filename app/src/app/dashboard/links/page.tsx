"use client";
import { useEffect, useMemo, useState } from "react";

interface LinkItem {
  id: string;
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  clickCount: number;
}

export default function LinksListPage() {
  const [items, setItems] = useState<LinkItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_desc");
  const [loading, setLoading] = useState(false);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy });
        if (search) params.set("search", search);
        const res = await fetch(`/api/urls?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          if (res.ok) {
            setItems(data.items);
            setTotal(data.total);
          } else {
            setItems([]);
            setTotal(0);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, limit, search, sortBy]);

  async function handleCopy(it: LinkItem) {
    const base = window.location.origin;
    const shortUrl = `${base.replace(/\/$/, "")}/${it.shortCode}`;
    await navigator.clipboard.writeText(shortUrl);
    alert("Copied: " + shortUrl);
  }

  async function handleEdit(it: LinkItem) {
    const current = it.customAlias || "";
    const next = prompt("Enter new custom alias (3-20 alphanumeric)", current);
    if (next === null) return;
    const trimmed = next.trim();
    if (trimmed && !/^[A-Za-z0-9]{3,20}$/.test(trimmed)) {
      alert("Alias must be 3-20 alphanumeric characters");
      return;
    }
    const res = await fetch(`/api/urls/${it.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customAlias: trimmed || undefined }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to update");
      return;
    }
    const updated = await res.json();
    setItems((prev) => prev.map((row) => (row.id === it.id ? { ...row, customAlias: updated.customAlias } : row)));
  }

  async function handleDelete(it: LinkItem) {
    if (!confirm("Delete this URL? This action cannot be undone.")) return;
    const res = await fetch(`/api/urls/${it.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to delete");
      return;
    }
    setItems((prev) => prev.filter((row) => row.id !== it.id));
    setTotal((t) => Math.max(0, t - 1));
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2>My Links</h2>
      <div style={{ display: "flex", gap: 8 }}>
        <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="created_desc">Newest</option>
          <option value="created_asc">Oldest</option>
          <option value="clicks_desc">Most Clicked</option>
          <option value="clicks_asc">Least Clicked</option>
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Short Code</th>
              <th align="left">Original URL</th>
              <th align="left">Clicks</th>
              <th align="left">Created</th>
              <th align="left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.shortCode}</td>
                <td style={{ maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.originalUrl}</td>
                <td>{it.clickCount}</td>
                <td>{new Date(it.createdAt).toLocaleString()}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => handleCopy(it)}>Copy</button>
                    <button type="button" onClick={() => handleEdit(it)}>Edit</button>
                    <button type="button" onClick={() => handleDelete(it)} style={{ color: "#b00020" }}>Delete</button>
                    <a href={`/dashboard/links/${it.id}`}>View</a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
          Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

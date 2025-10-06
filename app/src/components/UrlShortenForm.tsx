"use client";

import { useState } from "react";

interface UrlShortenFormProps {
  onSuccess?: () => void;
}

export default function UrlShortenForm({ onSuccess }: UrlShortenFormProps) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl: url, customAlias: alias || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Failed to shorten URL");
      } else {
        setResult(data.shortUrl);
        onSuccess?.(); // Call the success callback to refresh data
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 560 }}>
      <input
        type="url"
        placeholder="https://your-long-url.com/path"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        style={{ padding: 8 }}
      />
      <input
        type="text"
        placeholder="Custom alias (optional)"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        pattern="[A-Za-z0-9]{3,20}"
        title="3-20 alphanumeric characters"
        style={{ padding: 8 }}
      />
      <button type="submit" disabled={loading} style={{ padding: 8 }}>
        {loading ? "Shortening..." : "Shorten URL"}
      </button>
      {result && (
        <div>
          <strong>Short URL:</strong>{" "}
          <a href={result} target="_blank" rel="noreferrer">
            {result}
          </a>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(result)}
            style={{ marginLeft: 8 }}
          >
            Copy
          </button>
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}



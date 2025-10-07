import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/home");
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#ffffff",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        maxWidth: "800px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "32px"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: "700",
            margin: "0",
            lineHeight: "1.2"
          }}>
            URL Shortener
          </h1>
          <p style={{
            fontSize: "20px",
            opacity: "0.95",
            margin: "0",
            lineHeight: "1.6"
          }}>
            Shorten your links, track your analytics
          </p>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          padding: "32px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
            <div>
              <h3 style={{ fontSize: "18px", margin: "0 0 8px 0", fontWeight: "600" }}>✨ Easy URL Shortening</h3>
              <p style={{ margin: "0", opacity: "0.9", fontSize: "16px" }}>
                Transform long URLs into short, shareable links in seconds
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: "18px", margin: "0 0 8px 0", fontWeight: "600" }}>📊 Analytics Dashboard</h3>
              <p style={{ margin: "0", opacity: "0.9", fontSize: "16px" }}>
                Track clicks, monitor performance, and gain insights from your links
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: "18px", margin: "0 0 8px 0", fontWeight: "600" }}>🎯 Custom Aliases</h3>
              <p style={{ margin: "0", opacity: "0.9", fontSize: "16px" }}>
                Create memorable, branded short links with custom aliases
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: "18px", margin: "0 0 8px 0", fontWeight: "600" }}>🔐 Secure & Reliable</h3>
              <p style={{ margin: "0", opacity: "0.9", fontSize: "16px" }}>
                Your data is safe with enterprise-grade security and authentication
              </p>
            </div>
          </div>
        </div>

        <Link href="/sign-in" style={{
          display: "inline-block",
          padding: "16px 48px",
          fontSize: "18px",
          fontWeight: "600",
          color: "#667eea",
          background: "#ffffff",
          borderRadius: "50px",
          textDecoration: "none",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.2s, box-shadow 0.2s",
          border: "none",
          cursor: "pointer"
        }}>
          Get Started
        </Link>

        <p style={{ fontSize: "14px", opacity: "0.8", margin: "0" }}>
          Start shortening your URLs and tracking analytics for free
        </p>
      </div>
    </main>
  );
}

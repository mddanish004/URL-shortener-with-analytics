import { auth } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/home");
  }
  return (
    <main style={{ padding: 24, display: "grid", gap: 24, placeItems: "center" }}>
      <div style={{ display: "grid", gap: 16, maxWidth: 420, width: "100%" }}>
        <h1 style={{ textAlign: "center" }}>Welcome</h1>
        <SignIn routing="hash" />
      </div>
    </main>
  );
}

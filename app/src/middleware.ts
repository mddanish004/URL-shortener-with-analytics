import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/api/health", "/:shortCode"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  if (isPublicRoute(req)) {
    if (req.nextUrl.pathname === "/" && userId) {
      return NextResponse.redirect(new URL("/home", req.url));
    }
    return NextResponse.next();
  }
  
  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
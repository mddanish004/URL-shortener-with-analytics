# Pages Summary - Quick Reference

## All Page Files to Design

| Route | File Path | Type | Description |
|-------|-----------|------|-------------|
| `/` | `app/src/app/page.tsx` | Public | Landing page |
| `/sign-in` | `app/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` | Public | Login (Clerk) |
| `/sign-up` | `app/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` | Public | Registration (Clerk) |
| `/home` | `app/src/app/home/page.tsx` | Protected | Quick shorten + overview |
| `/dashboard` | `app/src/app/dashboard/page.tsx` | Protected | Dashboard overview |
| `/dashboard/links` | `app/src/app/dashboard/links/page.tsx` | Protected | All links list |
| `/dashboard/links/:id` | `app/src/app/dashboard/links/[id]/page.tsx` | Protected | Link detail + analytics |

## Layout Files

| Route Pattern | File Path | Description |
|---------------|-----------|-------------|
| All routes | `app/src/app/layout.tsx` | Root layout |
| `/dashboard/*` | `app/src/app/dashboard/layout.tsx` | Dashboard sidebar layout |

## Shared Components

| Component | File Path | Used In |
|-----------|-----------|---------|
| UrlShortenForm | `app/src/components/UrlShortenForm.tsx` | `/home` |

## API Routes (Route Handlers - No UI)

| Method | Route | File Path |
|--------|-------|-----------|
| GET | `/api/health` | `app/src/app/api/health/route.ts` |
| POST | `/api/urls` | `app/src/app/api/urls/route.ts` |
| GET | `/api/urls` | `app/src/app/api/urls/route.ts` |
| GET | `/api/urls/:id` | `app/src/app/api/urls/[id]/route.ts` |
| PATCH | `/api/urls/:id` | `app/src/app/api/urls/[id]/route.ts` |
| DELETE | `/api/urls/:id` | `app/src/app/api/urls/[id]/route.ts` |
| GET | `/api/urls/:id/analytics` | `app/src/app/api/urls/[id]/analytics/route.ts` |
| GET | `/:shortCode` | `app/src/app/[shortCode]/route.ts` |

## File Count
- **7 pages** to design (UI)
- **2 layouts** to style
- **1 shared component**
- **8 API routes** (no UI needed)

---

See `ROUTES_REFERENCE.md` for detailed information about each route.


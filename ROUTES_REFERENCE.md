# Routes Reference for Frontend Developer

This document lists all routes in the URL Shortener application with their corresponding file locations and purposes.

## Public Routes

### 1. Landing Page
- **Route:** `/`
- **File:** `app/src/app/page.tsx`
- **Purpose:** Marketing landing page for unauthenticated users
- **Features:**
  - Hero section with gradient background
  - 4 key features showcase (URL Shortening, Analytics, Custom Aliases, Security)
  - "Get Started" CTA button
- **Redirect:** 
  - If signed in → redirects to `/home`
  - If not signed in → "Get Started" button goes to `/sign-in`
- **Component Type:** Server Component
- **Design:** Purple gradient background with glass-morphism card

### 2. Sign In
- **Route:** `/sign-in`
- **File:** `app/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- **Purpose:** User authentication/login page (Clerk)

### 3. Sign Up
- **Route:** `/sign-up`
- **File:** `app/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- **Purpose:** User registration page (Clerk)

### 4. Short URL Redirect
- **Route:** `/:shortCode` (e.g., `/abc123`, `/mylink`)
- **File:** `app/src/app/[shortCode]/route.ts`
- **Purpose:** Redirects short URLs to original URLs and tracks clicks
- **Type:** Route handler (not a page)

---

## Protected Routes (Require Authentication)

### 5. Home Page (Quick Shorten)
- **Route:** `/home`
- **File:** `app/src/app/home/page.tsx`
- **Purpose:** Main dashboard with quick URL shortening form and overview
- **Features:**
  - URL shortening form
  - Total links count
  - Recent 5 links
- **Component Type:** Client Component

### 6. Dashboard Overview
- **Route:** `/dashboard`
- **File:** `app/src/app/dashboard/page.tsx`
- **Layout:** `app/src/app/dashboard/layout.tsx`
- **Purpose:** Dashboard overview showing statistics
- **Features:**
  - Total links count
  - Recent 5 links
- **Component Type:** Server Component

### 7. My Links (All Links List)
- **Route:** `/dashboard/links`
- **File:** `app/src/app/dashboard/links/page.tsx`
- **Purpose:** Paginated list of all user's shortened URLs
- **Features:**
  - Search functionality
  - Sorting (newest, oldest, most clicked, least clicked)
  - Pagination
  - Actions: Copy, Edit, Delete, View
- **Component Type:** Client Component

### 8. Link Detail & Analytics
- **Route:** `/dashboard/links/:id` (e.g., `/dashboard/links/5ca7d0be-1db0-46c2-bc01-b0ee15c764fa`)
- **File:** `app/src/app/dashboard/links/[id]/page.tsx`
- **Purpose:** Detailed view of a specific link with analytics
- **Features:**
  - Short code display
  - Short URL (clickable)
  - Original URL
  - Link status (Active/Inactive)
  - Clicks over time (daily breakdown)
  - Total clicks
  - Refresh button
- **Component Type:** Server Component

---

## API Routes (Backend Endpoints)

### 9. Health Check
- **Route:** `GET /api/health`
- **File:** `app/src/app/api/health/route.ts`
- **Purpose:** Health check endpoint
- **Auth:** Public

### 10. Create URL (Shorten)
- **Route:** `POST /api/urls`
- **File:** `app/src/app/api/urls/route.ts`
- **Purpose:** Create a new shortened URL
- **Auth:** Optional (anonymous or authenticated)
- **Body:**
  ```json
  {
    "originalUrl": "https://example.com",
    "customAlias": "mylink" // optional
  }
  ```

### 11. Get URLs List
- **Route:** `GET /api/urls?page=1&limit=10&search=&sortBy=created_desc`
- **File:** `app/src/app/api/urls/route.ts`
- **Purpose:** Get paginated list of user's URLs
- **Auth:** Required
- **Query Params:**
  - `page` (default: 1)
  - `limit` (default: 10, max: 100)
  - `search` (optional)
  - `sortBy`: `created_desc` | `created_asc` | `clicks_desc` | `clicks_asc`

### 12. Get Single URL
- **Route:** `GET /api/urls/:id`
- **File:** `app/src/app/api/urls/[id]/route.ts`
- **Purpose:** Get details of a specific URL
- **Auth:** Required (must be owner)

### 13. Update URL
- **Route:** `PATCH /api/urls/:id`
- **File:** `app/src/app/api/urls/[id]/route.ts`
- **Purpose:** Update URL (custom alias or active status)
- **Auth:** Required (must be owner)
- **Body:**
  ```json
  {
    "customAlias": "newAlias", // optional
    "isActive": true // optional
  }
  ```

### 14. Delete URL
- **Route:** `DELETE /api/urls/:id`
- **File:** `app/src/app/api/urls/[id]/route.ts`
- **Purpose:** Delete a URL
- **Auth:** Required (must be owner)

### 15. Get URL Analytics
- **Route:** `GET /api/urls/:id/analytics?startDate=&endDate=`
- **File:** `app/src/app/api/urls/[id]/analytics/route.ts`
- **Purpose:** Get click analytics for a URL
- **Auth:** Required (must be owner)
- **Query Params:**
  - `startDate` (optional, ISO date)
  - `endDate` (optional, ISO date)
- **Response:**
  ```json
  {
    "total": 10,
    "series": [
      { "day": "2025-10-06 00:00:00", "count": 5 },
      { "day": "2025-10-07 00:00:00", "count": 5 }
    ]
  }
  ```

---

## Shared Components

### URL Shortening Form
- **File:** `app/src/components/UrlShortenForm.tsx`
- **Purpose:** Reusable form component for creating shortened URLs
- **Props:**
  - `onSuccess?: () => void` - Callback fired when URL is created successfully
- **Used In:** `/home`

---

## Layout Structure

### Root Layout
- **File:** `app/src/app/layout.tsx`
- **Purpose:** Root layout with ClerkProvider and global styles
- **Applies to:** All routes

### Dashboard Layout
- **File:** `app/src/app/dashboard/layout.tsx`
- **Purpose:** Dashboard layout with sidebar navigation
- **Applies to:** `/dashboard/*` routes
- **Navigation:**
  - Overview (`/dashboard`)
  - My Links (`/dashboard/links`)

---

## Design Notes for Frontend Developer

### Pages to Design

1. **Landing Page** (`app/src/app/page.tsx`) ✅ DESIGNED
   - ✓ Hero section with gradient background
   - ✓ 4 key features in glass-morphism card
   - ✓ "Get Started" CTA button linking to sign-in
   - ✓ Responsive layout
   - **Current Design:** Purple gradient (#667eea to #764ba2) with white frosted glass card
   - **Note:** Can be enhanced with animations, better typography, or component library

2. **Home Page** (`app/src/app/home/page.tsx`)
   - Clean, focused layout
   - Prominent URL shortening form
   - Statistics cards (Total Links)
   - Recent links list

3. **Dashboard Overview** (`app/src/app/dashboard/page.tsx`)
   - Statistics dashboard
   - Recent links
   - Quick actions

4. **My Links Page** (`app/src/app/dashboard/links/page.tsx`)
   - Data table with columns:
     - Short Code
     - Original URL (truncated)
     - Clicks
     - Created date
     - Actions (Copy, Edit, Delete, View)
   - Search bar
   - Sort dropdown
   - Pagination controls

5. **Link Detail/Analytics Page** (`app/src/app/dashboard/links/[id]/page.tsx`)
   - Link information card
   - Analytics chart (clicks over time)
   - Daily breakdown table
   - Total clicks counter

### Current Styling
All pages currently use inline styles with basic layout. They need:
- Modern UI design system
- Responsive layout
- Proper color scheme
- Typography system
- Component library integration (e.g., Shadcn/ui, Material-UI, or custom)
- Charts/visualizations for analytics

### Key UX Considerations
- **Copy to clipboard** functionality for short URLs
- **Loading states** for async operations
- **Error handling** and user feedback
- **Confirmation dialogs** for destructive actions (delete)
- **Mobile responsiveness** across all pages
- **Accessibility** (WCAG compliance)

---

## Authentication Flow

- Uses **Clerk** for authentication
- Middleware: `app/src/middleware.ts`
- Public routes: `/`, `/api/health`, `/:shortCode`
- Protected routes require sign-in
- Signed-in users redirected from `/` to `/home`

---

## Database Schema

### URLs Table
```typescript
{
  id: uuid (primary key)
  userId: string (Clerk user ID or anonymous hash)
  originalUrl: string
  shortCode: string (unique)
  customAlias: string | null (unique)
  title: string | null
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Clicks Table
```typescript
{
  id: uuid (primary key)
  urlId: uuid (foreign key to urls)
  clickedAt: timestamp
  ipHash: string (hashed IP for privacy)
}
```

---

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - App base URL (for generating short URLs)
- Clerk environment variables (auto-configured)

---

## Next Steps for Frontend Developer

1. Review all page files to understand current structure
2. Choose a UI component library/design system
3. Create design mockups for each page
4. Implement responsive layouts
5. Add proper styling and theming
6. Implement data visualizations for analytics
7. Add loading states and error handling
8. Test across different devices and browsers

---

## Questions?
Contact the backend developer for any clarifications on API endpoints or data structures.


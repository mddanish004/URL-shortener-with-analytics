# Product Requirements Document (PRD)
## URL Shortener with Analytics

---

## 1. Project Overview

### 1.1 Purpose
Build a full-stack URL shortening service with analytics capabilities that allows users to create shortened URLs and track their usage metrics.

### 1.2 Target Users
- Content creators who share links across multiple platforms
- Marketing professionals tracking campaign performance
- Developers needing custom short links for projects
- General users wanting cleaner, trackable URLs

### 1.3 Tech Stack
- **Framework**: Next.js (App Router)
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Language**: JavaScript
- **Containerization**: Docker
- **Deployment**: Render

---

## 2. Core Features

### 2.1 User Authentication
**Priority**: High

**Description**: Secure user authentication and authorization system.

**Requirements**:
- Sign up with email/password
- Social login options (Google, Email) via Clerk
- Protected routes for authenticated users
- User session management
- Logout functionality

**Acceptance Criteria**:
- Users can create accounts and sign in
- Authentication state persists across sessions
- Unauthenticated users cannot access protected features
- Smooth redirect flow after authentication

---

### 2.2 URL Shortening
**Priority**: High

**Description**: Core functionality to convert long URLs into shortened versions.

**Requirements**:
- Input field for long URL submission
- URL validation (proper format, protocol check)
- Generate unique short code (6-8 characters)
- Custom alias support (optional)
- Copy-to-clipboard functionality
- Display full shortened URL (e.g., `yourdomain.com/abc123`)

**Technical Specifications**:
- Short code generation: Base62 encoding or nanoid
- Collision detection and handling
- Store mapping in database:
  - Original URL
  - Short code
  - Created timestamp
  - User ID (creator)
  - Custom alias (if provided)
  - Active status

**Validation Rules**:
- URL must be valid HTTP/HTTPS format
- URL length: 1-2048 characters
- Custom alias: 3-20 characters, alphanumeric only
- Check for duplicate custom aliases

**Acceptance Criteria**:
- Successfully shortens valid URLs
- Returns error for invalid URLs
- Custom aliases work when provided
- No duplicate short codes generated
- Shortened URL is immediately functional

---

### 2.3 URL Analytics
**Priority**: High

**Description**: Track and display metrics for shortened URLs.

**Requirements**:

**Metrics to Track**:
- Total click count
- Unique visitors (by IP)
- Click timestamps


**Dashboard Features**:
- List all user's shortened URLs
- Click count per URL
- Date range filtering
- Sort by most clicked, newest, oldest
- Search functionality
- Visual charts/graphs for click trends
- Individual URL detail page

**Data Storage**:
- Create `clicks` table with:
  - Click ID
  - Short URL ID (foreign key)
  - Timestamp
  - IP address (hashed for privacy)



**Acceptance Criteria**:
- Click events are captured accurately
- Analytics dashboard displays correct metrics
- Real-time or near-real-time updates
- Data visualization is clear and intuitive
- Export functionality for analytics data (bonus)

---

### 2.4 URL Management
**Priority**: Medium

**Description**: Allow users to manage their shortened URLs.

**Requirements**:
- View all created URLs in a dashboard
- Edit custom alias (if available)
- Delete shortened URLs
- Deactivate/reactivate URLs
- Search and filter URLs
- Pagination for large lists

**Acceptance Criteria**:
- Users can perform CRUD operations on their URLs
- Deleted URLs return 404
- Changes reflect immediately in the UI

---

### 2.5 URL Redirection
**Priority**: High

**Description**: Redirect users from short URL to original destination.

**Requirements**:
- Fast lookup and redirect (< 100ms)
- Handle non-existent short codes (404 page)
- Handle inactive URLs (custom message)
- Log click data before redirect
- HTTP 301 (permanent) or 302 (temporary) redirect

**Technical Implementation**:
- Use Next.js middleware or API route
- Database query optimization (indexing)
- Caching strategy for frequently accessed URLs

**Acceptance Criteria**:
- Redirect works reliably
- Click is logged before redirect
- Error handling for invalid codes
- Performance meets latency requirements

---

## 3. Database Schema

### 3.1 Tables

#### users (managed by Clerk)
- Clerk handles user data
- Reference users by Clerk user ID

#### urls
```
- id: UUID (primary key)
- user_id: VARCHAR (Clerk user ID)
- original_url: TEXT
- short_code: VARCHAR (unique index)
- custom_alias: VARCHAR (nullable, unique)
- title: VARCHAR (optional page title)
- is_active: BOOLEAN (default true)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### clicks
```
- id: UUID (primary key)
- url_id: UUID (foreign key -> urls.id)
- clicked_at: TIMESTAMP
- ip_hash: VARCHAR (hashed IP)

```

### 3.2 Indexes
- `urls.short_code` (unique)
- `urls.custom_alias` (unique, sparse)
- `urls.user_id`
- `clicks.url_id`
- `clicks.clicked_at`

---

## 4. API Endpoints

### 4.1 Authentication Routes
Handled by Clerk:
- `GET /sign-in`
- `GET /sign-up`
- `POST /api/auth/callback`

### 4.2 URL Routes

**POST /api/urls**
- Create shortened URL
- Body: `{ originalUrl, customAlias? }`
- Returns: `{ shortCode, shortUrl, originalUrl }`

**GET /api/urls**
- Get user's URLs (paginated)
- Query params: `page`, `limit`, `search`, `sortBy`
- Returns: Array of URL objects with click counts

**GET /api/urls/:id**
- Get specific URL details
- Returns: URL object with analytics

**PATCH /api/urls/:id**
- Update URL (custom alias, active status)
- Body: `{ customAlias?, isActive? }`

**DELETE /api/urls/:id**
- Delete URL

**GET /api/urls/:id/analytics**
- Get detailed analytics for URL
- Query params: `startDate`, `endDate`
- Returns: Analytics data

### 4.3 Redirect Route

**GET /:shortCode**
- Redirect to original URL
- Logs click data
- Returns: 301/302 redirect or 404

---

## 5. UI/UX Requirements

### 5.1 Pages

**Landing Page** (`/`)
- Hero section with value proposition
- URL shortening form (public access)
- Feature highlights
- CTA to sign up
- Testimonials/stats (optional)

**Dashboard** (`/dashboard`)
- Overview statistics
- Recent URLs list
- Quick shorten input
- Analytics summary

**My Links** (`/dashboard/links`)
- Table/card view of all URLs
- Search and filter
- Sort options
- Pagination
- Actions: Edit, Delete, Copy, View Analytics

**Link Analytics** (`/dashboard/links/:id`)
- URL details
- Click timeline chart
- Geographic distribution map
- Device/browser breakdown
- Referrer list
- Export data button

**Settings** (`/dashboard/settings`)
- User profile (via Clerk)
- Account preferences
- API key management (future feature)

### 5.2 Components
- URL input form with validation
- Copy button with success feedback
- Analytics charts (line, bar, pie)
- Data tables with sorting/filtering
- Loading states
- Error messages
- Toast notifications
- Responsive navigation

### 5.3 Design Guidelines
- Clean, modern interface
- Mobile-first responsive design
- Dark mode support
- Consistent color scheme
- Clear typography hierarchy
- Accessible (WCAG 2.1 AA)

---

## 6. Docker Configuration

### 6.1 Dockerfile
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### 6.2 docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
    depends_on:
      - db
```

### 6.3 Environment Variables
```
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_APP_URL=
```

---

## 7. Deployment on Render

### 7.1 Prerequisites
- Docker image built and tested
- Render account created
- Supabase database configured
- Clerk application set up

### 7.2 Steps
1. Connect GitHub repository to Render
2. Create new Web Service
3. Select Docker as environment
4. Configure environment variables
5. Set instance type and region
6. Deploy

### 7.3 Configuration
- **Build Command**: Docker build
- **Start Command**: `npm start`
- **Health Check**: `/api/health`
- **Auto-deploy**: On git push
- **Scaling**: Horizontal scaling ready

---

## 8. Security Considerations

### 8.1 Authentication & Authorization
- Clerk handles secure authentication
- Validate user ownership before operations
- Protected API routes with middleware

### 8.2 Data Protection
- Hash IP addresses before storage
- Sanitize user inputs
- Prevent SQL injection (Drizzle ORM parameterized queries)
- XSS protection
- CSRF protection

### 8.3 Rate Limiting
- Limit URL creation per user (10/hour)
- Limit anonymous shortening (5/day by IP)
- API rate limiting (100 requests/minute)

### 8.4 URL Validation
- Check for malicious URLs
- Blacklist known spam/phishing domains
- Validate redirects to prevent open redirects

---

## 9. Performance Requirements

### 9.1 Latency
- URL shortening: < 200ms
- Redirect: < 100ms
- Dashboard load: < 1s
- Analytics query: < 500ms

### 9.2 Scalability
- Handle 1000+ concurrent users
- Support 100K+ shortened URLs
- Track 1M+ clicks efficiently

### 9.3 Optimization Strategies
- Database indexing
- Caching (Redis for future)
- CDN for static assets
- Code splitting
- Image optimization

---

## 10. Testing Requirements

### 10.1 Unit Tests
- URL validation logic
- Short code generation
- Analytics calculations
- Utility functions

### 10.2 Integration Tests
- API endpoints
- Database operations
- Authentication flow
- Redirect functionality

### 10.3 E2E Tests
- Complete user journey
- URL creation to analytics viewing
- Authentication flows

---

## 11. Future Enhancements

### 11.1 Phase 2 Features
- QR code generation for short URLs
- Bulk URL shortening
- API access with key management
- Custom domains
- Link expiration dates
- Password-protected links

### 11.2 Phase 3 Features
- Team collaboration features
- A/B testing for URLs
- Advanced analytics (heatmaps, click fraud detection)
- Integration with marketing tools
- Browser extension

---

## 12. Success Metrics

### 12.1 Technical Metrics
- 99.9% uptime
- < 100ms average redirect time
- Zero data breaches
- < 1% error rate

### 12.2 User Metrics
- User registration rate
- Daily active users
- Average URLs per user
- Feature adoption rate

---

## 13. Timeline & Milestones

### Week 1-2: Foundation
- Project setup (Next.js, Drizzle, Supabase)
- Clerk authentication integration
- Database schema design and migration
- Basic UI components

### Week 3-4: Core Features
- URL shortening functionality
- Redirect mechanism
- Basic analytics implementation
- Dashboard UI

### Week 5-6: Analytics & Management
- Advanced analytics features
- URL management features
- Charts and visualizations
- Search and filter functionality

### Week 7: Docker & Deployment
- Dockerfile creation
- Docker testing locally
- Render deployment configuration
- Environment setup

### Week 8: Testing & Launch
- Comprehensive testing
- Bug fixes
- Documentation
- Production launch

---

## 14. Risks & Mitigation

### 14.1 Technical Risks
- **Risk**: Short code collision
- **Mitigation**: Implement collision detection with retry logic

- **Risk**: Database performance degradation
- **Mitigation**: Proper indexing, query optimization, monitoring

- **Risk**: Docker build failures on Render
- **Mitigation**: Thorough local testing, staged deployment

### 14.2 Security Risks
- **Risk**: Malicious URL shortening
- **Mitigation**: URL validation, blacklisting, rate limiting

- **Risk**: Analytics data exposure
- **Mitigation**: Proper authorization checks, data anonymization

---

## 15. Documentation Requirements

- README with setup instructions
- API documentation
- Database schema documentation
- Deployment guide
- User guide
- Contributing guidelines

---

## 16. Appendix

### 16.1 Glossary
- **Short Code**: Unique identifier for shortened URL
- **Click**: Single access to shortened URL
- **Unique Visitor**: Distinct user accessing URL
- **Custom Alias**: User-defined short code

### 16.2 References
- Next.js Documentation
- Clerk Documentation
- Supabase Documentation
- Drizzle ORM Documentation
- Docker Best Practices
- Render Deployment Guide
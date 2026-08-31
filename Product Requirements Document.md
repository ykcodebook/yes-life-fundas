# Product Requirements Document
## Modern SEO-First Article Publishing Platform

**Version:** 1.0  
**Date:** August 2026  
**Status:** Product & Technical Specification

---

# 1. Executive Summary

Build a modern, SEO-first article publishing platform focused on two equally important experiences:

1. **An exceptionally fast, responsive, and search-engine-friendly reading experience.**
2. **An exceptionally polished visual writing and publishing experience.**

The platform will allow authors to create long-form articles using a powerful visual editor, preview articles exactly as they will appear publicly, save drafts automatically, manage revisions, publish content, and manage media.

Readers can browse and read articles without authentication and can authenticate to participate in comments and discussions.

The platform will use:

- **Astro + React** for the frontend.
- **Tiptap** for the article editor.
- **Supabase** for authentication, PostgreSQL, authorization, and storage.
- **Cloudflare Workers/CDN** for application delivery and edge infrastructure.
- **Tiptap/ProseMirror JSON** as the canonical article content format.

The public website must be designed as an **SEO-first, server/static-rendered content platform**, not a client-side application.

---

# 2. Product Vision

The product should feel:

### To readers

- Fast
- Clean
- Responsive
- Professional
- Easy to navigate
- Comfortable for long-form reading
- Excellent on mobile
- Search-engine friendly

### To authors

- Powerful
- Intuitive
- Familiar
- Similar in quality to Medium/Notion-style editors
- Safe from accidental content loss
- Easy to preview
- Easy to publish

### To administrators

- Simple to operate
- Easy to moderate
- Easy to manage authors and content
- Easy to maintain

---

# 3. Core Product Principles

## Principle 1 — SEO First

SEO is a fundamental architectural requirement.

Article content must be rendered into crawlable HTML and must not depend on client-side JavaScript.

---

## Principle 2 — Mobile First and Highly Responsive

Every public page must work exceptionally well across:

- Mobile phones
- Tablets
- Laptops
- Desktop monitors
- Large displays

The mobile experience is not a reduced desktop experience.

It must be deliberately designed for mobile.

---

## Principle 3 — Excellent Editor

The editor is a primary product feature.

It should provide a polished writing experience comparable to modern publishing tools rather than a basic rich-text form.

---

## Principle 4 — Performance

Public pages should be extremely lightweight.

Interactive JavaScript should only be loaded where necessary.

---

## Principle 5 — Simple Infrastructure

Avoid unnecessary services.

Supabase should provide most backend functionality.

Cloudflare should provide hosting, CDN, edge execution, and caching.

---

# 4. Target Users

## Reader

Can:

- Browse articles
- Search
- Read
- Browse categories
- Browse tags
- View authors
- Register
- Comment
- Reply
- Edit own comments
- Delete own comments
- Report comments

---

## Author

Can additionally:

- Create articles
- Edit drafts
- Upload media
- Preview articles
- Manage article metadata
- Save drafts
- Publish articles, depending on permissions
- View revisions
- Restore revisions
- Manage author profile

---

## Editor

Can additionally:

- Edit any article
- Publish/unpublish
- Manage categories
- Manage tags
- Moderate comments
- Manage media

---

## Administrator

Can:

- Manage users
- Manage roles
- Manage all content
- Manage comments
- Manage categories/tags
- Manage system configuration
- Suspend users

---

# 5. User Journey — Reader

```text
Landing Page
     ↓
Featured / Latest Articles
     ↓
Open Article
     ↓
Read
     ↓
Related Articles
     ↓
Continue Reading
```

Authentication should not be required for reading.

For commenting:

```text
Article
   ↓
Comment
   ↓
Sign in / Register
   ↓
Return to Article
   ↓
Submit Comment
```

The user should return to the exact article after authentication.

---

# 6. User Journey — Author

```text
Dashboard
    ↓
New Article
    ↓
Title
    ↓
Cover Image
    ↓
Write
    ↓
Autosave
    ↓
SEO Configuration
    ↓
Preview
    ↓
Publish
```

The author should never need to interact directly with:

- HTML
- Markdown
- MDX
- JSON
- SQL
- APIs

---

# 7. User Journey — Editing Published Article

Editing a published article must not immediately alter the live article.

```text
Published v5
     ↓
Edit
     ↓
Draft v6
     ↓
Autosave
     ↓
Preview
     ↓
Publish
     ↓
Published v6
```

Readers continue seeing v5 until v6 is explicitly published.

---

# 8. User Journey — Revision Recovery

```text
Article
   ↓
Revision History
   ↓
Select Version
   ↓
Preview
   ↓
Restore
   ↓
Create New Revision
   ↓
Save
```

Restoring a revision must never destroy previous revisions.

---

# 9. Public Website

## 9.1 Homepage

The homepage should contain:

- Brand
- Navigation
- Featured article
- Latest articles
- Categories
- Optional popular content
- Footer

The design should prioritize articles over decorative UI.

---

# 9.2 Article Listing

Article cards should contain:

- Cover image
- Title
- Description/excerpt
- Author
- Date
- Category
- Reading time

Cards must adapt to viewport size.

Example:

```text
Desktop:

┌─────────────┐
│    Image    │
├─────────────┤
│ Title       │
│ Description │
│ Author · 8m │
└─────────────┘

Mobile:

┌───────┬───────────────────┐
│Image  │ Title             │
│       │ Description       │
│       │ Author · 8 min   │
└───────┴───────────────────┘
```

The exact layout can vary depending on design, but it must remain highly usable at all breakpoints.

---

# 10. Article Page

The article page is the primary product surface.

It should contain:

1. Breadcrumb
2. Category
3. H1 title
4. Subtitle/excerpt
5. Author
6. Publication date
7. Updated date where appropriate
8. Reading time
9. Cover image
10. Article body
11. Share controls
12. Related articles
13. Comments

---

# 11. Reading Experience

The article reading experience must prioritize:

- Typography
- Line length
- Font rendering
- Vertical rhythm
- Paragraph spacing
- Heading hierarchy
- Image presentation
- Mobile readability

The article column should have a controlled maximum width.

Long text must never stretch across the entire desktop viewport.

---

# 12. Responsive Design Requirements

Responsive behavior must be built from the beginning.

Required breakpoints should accommodate:

```text
Small mobile
Large mobile
Tablet
Laptop
Desktop
Large desktop
```

The exact breakpoints should be determined during implementation based on the design system rather than blindly relying on device-specific widths.

---

# 12.1 Mobile Requirements

On mobile:

- Navigation must be touch-friendly.
- Buttons must have adequate touch targets.
- Article typography must remain readable.
- Images must fit the viewport.
- Tables must handle horizontal overflow gracefully.
- Code blocks must scroll horizontally where necessary.
- Comments must remain easy to use.
- Editor controls must remain accessible.
- Modals must fit small screens.

No horizontal page overflow should occur.

---

# 12.2 Tablet Requirements

Tablet layouts should make effective use of available space without simply stretching the desktop layout.

Two-column layouts may be used where appropriate.

---

# 12.3 Desktop Requirements

Desktop should take advantage of available space through:

- Comfortable reading width
- Optional article sidebar
- Table of contents where appropriate
- Related content
- Editor side panels

However, the article body itself should remain constrained for readability.

---

# 13. SEO Architecture

SEO is a **mandatory architectural requirement**.

Public article content must be available in the initial HTML response.

Preferred:

```text
Request
  ↓
Cloudflare
  ↓
Astro
  ↓
Article Renderer
  ↓
HTML
```

The resulting HTML must contain:

- Article title
- Article body
- Author
- Dates
- Metadata
- Structured data
- Navigation

JavaScript must not be required to display the article.

---

# 14. SEO URL Structure

Preferred:

```text
/articles/how-to-travel-japan
```

Avoid:

```text
/article?id=123
```

URLs must be:

- lowercase
- readable
- stable
- hyphen-separated
- free from unnecessary identifiers

---

# 15. SEO Metadata

Each article supports:

```text
SEO title
SEO description
Canonical URL
Open Graph title
Open Graph description
Social image
```

If optional fields are omitted, sensible defaults should be generated.

---

# 16. Structured Data

Generate appropriate Schema.org structured data.

For article pages:

```text
Article
```

or an appropriate subtype such as:

```text
BlogPosting
NewsArticle
```

depending on content type.

Include:

- headline
- description
- image
- author
- publisher
- datePublished
- dateModified
- mainEntityOfPage

Structured data must accurately represent visible page content.

---

# 17. Breadcrumb SEO

Visible breadcrumbs should also produce appropriate structured data.

Example:

```text
Home
 >
Travel
 >
Japan Travel Guide
```

Use `BreadcrumbList` structured data.

---

# 18. Sitemap

Automatically generate:

```text
/sitemap.xml
```

Include:

- Published articles
- Public categories
- Public author pages
- Other important indexable pages

Do not include:

- Drafts
- Admin pages
- Search pages
- Preview pages
- Deleted/private content

---

# 19. Robots.txt

Generate:

```text
/robots.txt
```

Private areas such as:

```text
/dashboard
/admin
```

must not be intended for indexing.

---

# 20. RSS

Generate:

```text
/rss.xml
```

Include:

- Title
- URL
- Description
- Author
- Publication date
- Article content/excerpt

---

# 21. Canonical URLs

Every indexable page must have one canonical URL.

Tracking/query parameters must not create indexable duplicates.

---

# 22. Redirects

If a published slug changes:

```text
Old URL
   ↓
301
   ↓
New URL
```

Historical slugs must be retained.

---

# 23. 404 and HTTP Status Handling

Correct HTTP status codes are mandatory.

```text
200 → valid page
301 → permanent redirect
404 → nonexistent content
410 → intentionally removed content
401 → authentication required
403 → unauthorized
500 → server error
```

The system must not generate soft 404s.

---

# 24. Preview SEO Protection

Draft and preview URLs must never be indexed.

Preview pages should use appropriate `noindex` directives and should ideally require authenticated access.

They must not appear in:

- Sitemap
- RSS
- Public search
- Public navigation

---

# 25. Image SEO and Performance

Images must support:

- Alt text
- Caption
- Width
- Height
- Responsive sizes

Images should be:

- Optimized
- Responsive
- CDN-delivered
- Properly compressed
- Lazy-loaded when appropriate

Hero images should be optimized specifically for the initial viewport.

Explicit dimensions should be used to minimize layout shift.

---

# 26. Core Web Vitals

Performance is both a UX and SEO requirement.

The public site should target excellent:

- LCP
- INP
- CLS

The architecture should minimize:

- JavaScript
- Render-blocking resources
- Layout shifts
- Large images
- Unnecessary network requests

---

# 27. Article Editor

The editor is one of the most important components of the platform.

It should provide a modern visual editing experience.

Technology:

```text
React
   ↓
Tiptap
   ↓
ProseMirror
```

---

# 28. Editor Interface

Desktop:

```text
┌────────────────────────────────────────────────────────────┐
│ ← Articles          Saved       Preview       Publish       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Article Title                                              │
│                                                            │
│ Subtitle                                                   │
│                                                            │
│ [ Cover Image ]                                            │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ B I U S  H1 H2 H3  🔗  🖼  Quote  Code  +            │ │
│ ├────────────────────────────────────────────────────────┤ │
│ │                                                        │ │
│ │ Write your article...                                  │ │
│ │                                                        │ │
│ │                                                        │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

# 29. Editor Features

## Text

- Paragraph
- H1–H6
- Bold
- Italic
- Underline
- Strikethrough
- Highlight
- Inline code
- Links

## Lists

- Bullet
- Ordered
- Nested
- Task list

## Blocks

- Quote
- Code block
- Callout
- Divider
- Table

## Media

- Image
- Video
- Embeds

---

# 30. Slash Commands

Typing `/` should open a searchable command menu.

Example:

```text
/
───────────────

Heading
Image
Quote
Callout
Code
Table
Divider
Video
Embed
```

Commands should be keyboard accessible.

---

# 31. Markdown Shortcuts

Support common shortcuts.

Examples:

```text
# Heading
```

```text
- Item
```

```text
> Quote
```

These should transform into their respective blocks.

---

# 32. Drag and Drop

The editor should support:

- Image drag/drop
- Block movement
- Block reordering
- Clipboard image paste

---

# 33. Image Upload Workflow

```text
Editor
   ↓
Select / Drop Image
   ↓
Upload
   ↓
Supabase Storage
   ↓
Optimization / metadata
   ↓
URL
   ↓
Tiptap image node
```

---

# 34. Image Editing

Images should allow:

- Alt text
- Caption
- Alignment
- Size
- Replace
- Delete

The editor should make alt text easy to provide.

---

# 35. Autosave

Autosave should happen automatically.

Recommended:

```text
User typing
   ↓
No changes for ~1–2 seconds
   ↓
Save
```

Display:

```text
Saving...
Saved
Saved 12 seconds ago
```

Errors must be visible.

---

# 36. Local Draft Recovery

Unsaved editor state should be temporarily preserved locally.

If the network disconnects:

```text
Connection lost.

Your recent changes are stored locally.
```

When the connection returns, the system should attempt synchronization.

Conflict handling must avoid silently overwriting newer server content.

---

# 37. Editor Preview

Preview must use the exact production article renderer.

```text
Tiptap JSON
      │
      ├── Editor
      │
      └── Article Renderer
             │
             ├── Preview
             └── Production
```

Therefore:

**Preview should look exactly like the published article.**

---

# 38. Responsive Editor

The editor itself must be responsive.

Mobile:

- Sticky compact toolbar
- Slash commands
- Touch-friendly controls
- Full-width editor
- Accessible metadata panel
- Full-screen editing option

Desktop:

- Full toolbar
- Side metadata panel
- Writing statistics
- Preview controls

---

# 39. Article Metadata

Each article supports:

```text
Title
Subtitle
Slug
Excerpt
Cover image
Author
Category
Tags

SEO title
SEO description
Canonical URL
Social image

Publication date
```

---

# 40. SEO Preview

The editor should include a search preview.

Example:

```text
Google Preview
────────────────────────────

How to Travel Japan in 2026

example.com/articles/japan-travel

A complete guide to planning...
```

Warnings should be informative rather than unnecessarily restrictive.

---

# 41. Publishing Validation

Before publication:

```text
Publish Checklist

✓ Title
✓ Slug
✓ Content
✓ Author
✓ SEO title
✓ SEO description
✓ Cover image

Warnings:
⚠ No internal links detected
⚠ Some images are missing alt text
```

Critical errors may prevent publication.

Warnings should not necessarily block publishing.

---

# 42. Article Revisions

Published articles must support revision history.

Example:

```text
v1
v2
v3
v4 ← current
```

Each revision should retain:

- Content
- Title
- Metadata
- Author/editor
- Timestamp

Restoring a revision creates a new version rather than deleting history.

---

# 43. Draft System

Statuses:

```text
draft
published
archived
```

Future:

```text
scheduled
```

Dashboard filters:

```text
All
Drafts
Published
Archived
```

---

# 44. Publishing Model

An article can have:

```text
Published version
Draft version
```

Example:

```text
Published: v8
Draft:     v9
```

Readers see v8.

Author edits v9.

Publishing v9 replaces v8 as the public version.

This guarantees safe editing of live content.

---

# 45. Comments

Comments require authentication.

Users can:

- Create
- Reply
- Edit own
- Delete own
- Report

Comments support threading.

Example:

```text
Comment
 ├── Reply
 │    └── Reply
 └── Reply
```

---

# 46. Comment Moderation

Comment statuses:

```text
visible
pending
hidden
deleted
spam
```

Moderators can:

- Approve
- Hide
- Delete
- Mark spam

---

# 47. Comment Reporting

Users can report comments.

Reasons:

```text
Spam
Harassment
Abusive content
Off-topic
Other
```

Reports are visible to moderators.

---

# 48. Authentication

Supabase Auth.

Initial providers:

- Email/password
- Magic link
- Google

Authentication should be integrated without making reading content dependent on login.

---

# 49. Roles

```text
reader
author
editor
admin
```

Permissions must be enforced server-side and through database authorization.

The UI must not be the only security layer.

---

# 50. Database

Supabase PostgreSQL.

Core tables:

```text
profiles

articles
article_versions

categories
article_categories

tags
article_tags

comments
comment_reports

media
```

Potential later tables:

```text
article_views
likes
bookmarks
notifications
scheduled_articles
```

---

# 51. Article Storage Model

The canonical article content format is:

**Tiptap/ProseMirror JSON**

Example:

```text
Article
   │
   ├── Metadata
   │
   └── Content
         │
         └── Tiptap JSON
```

MDX should not be the primary storage format.

Optional MDX/Markdown import/export may be added later.

---

# 52. Why Tiptap JSON

This enables:

- Rich editor functionality
- Custom blocks
- Reliable structured content
- Exact rendering
- Revision history
- Future editor extensions
- Consistent preview
- Future export formats

The content is structured rather than being an arbitrary HTML blob.

---

# 53. Content Renderer

A dedicated article renderer should translate Tiptap JSON into semantic HTML.

Example:

```text
Heading
   ↓
<h2>

Paragraph
   ↓
<p>

Image
   ↓
<figure>
<img>
<figcaption>
</figure>

Quote
   ↓
<blockquote>
```

This renderer is shared across the platform.

---

# 54. Public Rendering Architecture

```text
                    Supabase
                       │
                       │
                  Article JSON
                       │
                       ▼
                Article Renderer
                       │
                       ▼
                    Astro
                       │
                       ▼
                Semantic HTML
                       │
                       ▼
                 Cloudflare CDN
                       │
                ┌──────┴──────┐
                ▼             ▼
             Reader       Search Engine
```

---

# 55. Cloudflare Architecture

Cloudflare should provide:

- Workers
- CDN
- Edge delivery
- Caching
- DNS
- HTTPS

Public pages should be cached aggressively where safe.

Publishing an article should trigger appropriate cache invalidation/revalidation.

---

# 56. Supabase Architecture

Supabase provides:

```text
Authentication
       +
PostgreSQL
       +
Row Level Security
       +
Storage
```

This eliminates the need for a separate traditional backend server.

---

# 57. Security Architecture

Security must be enforced at multiple levels.

## Authentication

Supabase Auth.

## Authorization

RLS + server-side checks.

## Article ownership

Authors may only modify permitted content.

## Comments

Users may only modify their own comments.

## Admin

Role-based permissions.

## Uploads

Validate:

- File type
- File size
- Dimensions

## Content

Safely render article content and comments.

Arbitrary untrusted HTML must not be allowed to execute.

---

# 58. Caching

Public article pages:

```text
Browser
   ↓
Cloudflare CDN
   ↓
Cached HTML
```

If content changes:

```text
Publish
   ↓
Cache invalidation/revalidation
   ↓
New article version
```

Private authenticated pages should not be publicly cached.

---

# 59. Search

Initial search should support:

- Title
- Description
- Content
- Tags
- Categories
- Author

Search pages should generally be `noindex`.

A dedicated search engine can be introduced only when scale requires it.

---

# 60. Internal Linking

The editor should make internal linking easy.

When selecting link:

```text
Search articles...

Japan Travel Guide
Tokyo Guide
Kyoto Guide
Best Hotels in Tokyo
```

This encourages strong internal linking without requiring authors to manually copy URLs.

---

# 61. Related Articles

Initially determine related articles using:

- Category
- Tags
- Recency

No complex recommendation system is required.

---

# 62. Accessibility

Target WCAG 2.1 AA principles.

Requirements:

- Keyboard navigation
- Accessible forms
- Screen-reader labels
- Semantic HTML
- Proper heading hierarchy
- Alt text
- Focus states
- Accessible modals
- Accessible comments
- Touch-friendly controls

---

# 63. Performance Requirements

Public pages should prioritize:

- Small HTML payloads
- Minimal JavaScript
- Optimized images
- CDN caching
- Responsive images
- Lazy loading
- Efficient fonts
- Minimal third-party scripts

The article must remain usable even if non-essential JavaScript fails.

---

# 64. Error Handling

Important states:

### Save failure

```text
Unable to save.

Retry
```

### Network disconnect

```text
You're offline.

Your recent changes are stored locally.
```

### Publish failure

```text
Unable to publish.

No changes were lost.
```

### Unauthorized

```text
You don't have permission to access this page.
```

### Missing article

Return actual HTTP 404.

---

# 65. Admin Dashboard

Sections:

```text
Dashboard
Articles
Comments
Users
Categories
Tags
Media
```

The dashboard should remain intentionally simple.

---

# 66. Media Library

The media library supports:

- Upload
- Search
- Reuse
- Delete
- Alt text
- Caption

Images should be stored in Supabase Storage initially.

Cloudflare R2 can be introduced later if storage requirements justify it.

---

# 67. SEO Dashboard — Future

Eventually provide:

```text
SEO Health

Articles
────────────────
✓ 92 ready
⚠ 4 missing descriptions
⚠ 3 missing alt text
⚠ 2 broken links
⚠ 1 redirect issue
```

This should be a future feature rather than a requirement for initial launch.

---

# 68. Analytics — Future/Optional

Initial analytics should remain lightweight.

Potential metrics:

- Article views
- Referrers
- Device
- Approximate geography
- Engagement

Avoid building a complex analytics system in the first version.

---

# 69. Future Features

Potential future capabilities:

- Scheduled publishing
- Collaborative editing
- Mentions
- Likes/reactions
- Bookmarks
- Notifications
- Newsletter
- AI writing assistance
- Advanced search
- Google Search Console integration
- Article import/export
- Markdown/MDX export
- Content recommendations
- Paid subscriptions

These should not complicate the initial architecture.

---

# 70. Recommended Technology Stack

| Layer | Technology |
|---|---|
| Public frontend | Astro |
| Interactive UI | React |
| Editor | Tiptap |
| Editor engine | ProseMirror |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend platform | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| Authorization | PostgreSQL RLS |
| Storage | Supabase Storage |
| Hosting | Cloudflare Workers |
| CDN | Cloudflare |
| Optional object storage | Cloudflare R2 |
| Validation | Zod |
| Testing | Vitest |
| E2E testing | Playwright |
| Package manager | pnpm |

---

# 71. Recommended Application Structure

```text
project/
│
├── apps/
│   │
│   ├── web/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── components/
│   │   └── article-renderer/
│   │
│   └── admin/
│       ├── editor/
│       ├── components/
│       ├── extensions/
│       └── pages/
│
├── packages/
│   ├── ui/
│   ├── article-schema/
│   ├── article-renderer/
│   ├── database/
│   └── auth/
│
└── supabase/
    ├── migrations/
    ├── functions/
    └── seed/
```

A monorepo is optional, but shared article schema and rendering logic should be maintained centrally.

---

# 72. Testing Requirements

Testing should cover:

## Editor

- Formatting
- Blocks
- Images
- Links
- Slash commands
- Autosave
- Recovery
- Preview
- Publishing
- Revisions

## Public website

- Responsive layouts
- Article rendering
- SEO metadata
- Structured data
- Sitemap
- Robots
- RSS
- Redirects
- 404s

## Authentication

- Registration
- Login
- Logout
- OAuth
- Permissions

## Comments

- Create
- Reply
- Edit
- Delete
- Report
- Moderation

## Security

- Unauthorized article access
- Unauthorized editing
- RLS
- Role permissions
- Malicious content

---

# 73. SEO Testing

Automated tests should verify that published articles contain:

```text
✓ <title>
✓ meta description
✓ canonical
✓ Open Graph
✓ structured data
✓ H1
✓ author
✓ publication date
✓ article content
```

Tests should also verify:

```text
✓ Drafts are not indexable
✓ Preview is not indexable
✓ Sitemap excludes drafts
✓ RSS excludes drafts
✓ Invalid article returns 404
✓ Changed slug returns 301
```

---

# 74. Responsive Testing

E2E tests should test at minimum:

```text
Mobile
Tablet
Laptop
Desktop
```

Test:

- Navigation
- Article pages
- Images
- Tables
- Code blocks
- Comments
- Login
- Editor
- Modals
- Overflow behavior

No important page should have unintended horizontal scrolling.

---

# 75. Definition of Done — Article

An article is ready for publication when:

```text
✓ Title
✓ Slug
✓ Content
✓ Author
✓ Category
✓ Metadata
✓ SEO title
✓ SEO description
✓ Cover image
✓ Image metadata
✓ Canonical URL
✓ Preview verified
✓ No critical validation errors
```

---

# 76. Definition of Done — SEO

A published article must:

```text
✓ Be server/static rendered
✓ Have crawlable HTML
✓ Have a canonical URL
✓ Have unique metadata
✓ Have Article structured data
✓ Have author information
✓ Have publication date
✓ Have modification date where applicable
✓ Be included in sitemap
✓ Be included in RSS
✓ Be mobile responsive
✓ Be CDN-cacheable
✓ Return HTTP 200
✓ Avoid duplicate URLs
```

---

# 77. Definition of Done — Responsive UX

The application must:

```text
✓ Work on mobile
✓ Work on tablet
✓ Work on desktop
✓ Have no unintended horizontal overflow
✓ Have touch-friendly controls
✓ Have readable typography
✓ Handle long titles
✓ Handle long images
✓ Handle tables
✓ Handle code blocks
✓ Handle comments
✓ Handle editor controls
```

---

# 78. MVP Scope

The first production release must contain:

## Public Website

- Homepage
- Article listing
- Article page
- Categories
- Tags
- Author pages
- Search
- Responsive design
- SEO
- Sitemap
- Robots.txt
- RSS
- Structured data

## Authentication

- Registration
- Login
- Logout
- Google login
- Profiles
- Roles

## Editor

- Tiptap
- Rich text
- Headings
- Lists
- Links
- Images
- Quotes
- Code
- Tables
- Callouts
- Slash commands
- Markdown shortcuts
- Drag/drop
- Autosave
- Offline draft recovery
- Preview
- SEO panel
- Publishing

## Content Management

- Drafts
- Published articles
- Revisions
- Revision restoration
- Categories
- Tags
- Media

## Comments

- Comments
- Replies
- Editing
- Deletion
- Reporting
- Moderation

## Administration

- Article management
- Comment moderation
- User management
- Categories
- Tags
- Media

---

# 79. Final Architecture

```text
                         INTERNET
                            │
                            ▼
                   ┌─────────────────┐
                   │   Cloudflare     │
                   │   CDN + Worker   │
                   └────────┬────────┘
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
      PUBLIC WEBSITE                  ADMIN APPLICATION
             │                             │
          Astro                     React + Tiptap
             │                             │
             │                             │
             └──────────────┬──────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  Supabase   │
                     ├─────────────┤
                     │ Auth        │
                     │ PostgreSQL  │
                     │ RLS         │
                     │ Storage     │
                     └─────────────┘
                            │
                            ▼
                    Tiptap JSON Content
```

---

# 80. Core Content Flow

```text
                    AUTHOR
                       │
                       ▼
                 Tiptap Editor
                       │
                       ▼
                 Tiptap JSON
                       │
                       ▼
                  Supabase DB
                       │
                   Publish
                       │
                       ▼
                Article Renderer
                       │
                       ▼
                  Semantic HTML
                       │
                       ▼
                   Astro SSR
                       │
                       ▼
                 Cloudflare CDN
                       │
              ┌────────┴────────┐
              ▼                 ▼
           READER          SEARCH ENGINE
```

---

# 81. Final Architectural Principles

The implementation team must preserve these principles throughout development:

### 1. Content is structured

Tiptap JSON is the canonical article format.

### 2. Preview equals production

The editor preview and public article use the same renderer.

### 3. SEO does not depend on JavaScript

Article content exists in the initial HTML.

### 4. Mobile is first-class

Every component must be designed responsively from the beginning.

### 5. Public pages are lightweight

Avoid unnecessary client-side JavaScript.

### 6. Drafts are safe

Autosave and recovery must prevent accidental content loss.

### 7. Publishing is explicit

Editing a published article does not immediately alter the public version.

### 8. Revisions are immutable

Restoring content creates a new revision.

### 9. Security is server-side

UI restrictions alone are never considered authorization.

### 10. Infrastructure remains simple

Use Supabase and Cloudflare rather than introducing services without a concrete need.

---

# 82. Product Success Criteria

The platform succeeds when a reader can:

> Open an article from Google on a phone, receive a fast, complete HTML page, read comfortably, navigate to related content, and participate in the discussion.

And an author can:

> Open the dashboard, create a beautifully formatted article using a powerful visual editor, see exactly how it will look, safely save their work, review SEO information, and publish it without touching code.

The resulting product should combine:

**Medium-quality writing experience + excellent technical SEO + modern responsive design + Cloudflare performance + Supabase simplicity.**
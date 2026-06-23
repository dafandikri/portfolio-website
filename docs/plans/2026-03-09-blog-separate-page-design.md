# Blog Separate Page Design

## Decision
Move blog from inline `#blog` section to dedicated `/blog` and `/blog/:id` routes using React Router v6.

## Architecture
- `/` — main portfolio (remove `#blog` section, keep Navbar link)
- `/blog` — BlogListPage: W95 window listing all post cards
- `/blog/:id` — BlogPostPage: full-page Notepad-style viewer

## File Changes
1. Install `react-router-dom`
2. `main.jsx` — wrap with `<BrowserRouter>`
3. `App.jsx` — use `<Routes>`, remove `#blog` section
4. `Navbar.jsx` — Blog link uses `<Link to="/blog">` instead of `<a href="#blog">`
5. New `src/pages/BlogList.jsx` — extracted from Blog.jsx card list
6. New `src/pages/BlogPost.jsx` — extracted Notepad viewer, full page
7. `vercel.json` — SPA rewrite for `/blog/*`

## Design Constraints
- Consistent W95 aesthetic: same background, Navbar, title bar gradient, button styles
- Post URLs shareable: `dafandikri.tech/blog/ppl-sprint1-week3`
- Back navigation: X button and "Back to Blog" both go to `/blog`
- Lazy load blog pages (code splitting)

## Google Sheets
- Write IR comments from `ir-comments-sprint1-week3.md` into Sprint 1 Week 3 cells
- Links point to `dafandikri.tech/blog/ppl-sprint1-week3`

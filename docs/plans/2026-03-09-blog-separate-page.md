# Blog Separate Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move blog from inline section to dedicated `/blog` and `/blog/:id` routes with consistent W95 design.

**Architecture:** Add React Router v6 for client-side routing. Homepage stays at `/`, blog list at `/blog`, individual posts at `/blog/:id`. Shared layout wraps all routes with Navbar + background. Vercel SPA rewrites handle refresh.

**Tech Stack:** React 19, react-router-dom v7, Framer Motion, Bootstrap 5, W95 CSS

---

### Task 1: Install react-router-dom

**Files:**
- Modify: `package.json`

**Step 1: Install dependency**

Run: `cd "/Users/dafandikri/Documents/Personal/Portfolio Website/portfolio-website" && npm install react-router-dom`

**Step 2: Verify installation**

Run: `cat package.json | grep react-router`
Expected: `"react-router-dom": "^7.x.x"`

---

### Task 2: Create shared Layout component

**Files:**
- Create: `src/components/Layout.jsx`

**Step 1: Create Layout with Navbar + background**

Extract the shared wrapper (background image, Navbar, container) from `App.jsx` into a reusable `Layout.jsx`:

```jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { getImage } from '../assets';

const Layout = () => {
    return (
        <div className="windows95-app">
            <div className="desktop-background" style={{
                backgroundImage: `url(${getImage("background")})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                backgroundAttachment: 'fixed'
            }}>
                <Navbar />
                <div className="container py-2">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default Layout;
```

---

### Task 3: Create HomePage component

**Files:**
- Create: `src/pages/HomePage.jsx`

**Step 1: Move all homepage sections from App.jsx into HomePage**

Move everything inside the `<div className="container py-2">` (Profile, KnowEachOther, Skills, Experience, Projects, Hobbies, Contact) into `HomePage.jsx`. Remove the Blog section entirely from here.

```jsx
import { useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import ProfileCard from '../components/ProfileCard';
import KnowEachOther from '../components/KnowEachOther';

const TechStackDialog = lazy(() => import('../components/TechStackDialog'));
const SkillsetsDialog = lazy(() => import('../components/SkillsetsDialog'));
const Experience = lazy(() => import('../components/Experience'));
const Project = lazy(() => import('../components/Project'));
const Hobbies = lazy(() => import('../components/Hobbies'));
const Contact = lazy(() => import('../components/Contact'));

const SectionLoader = () => (
    <div style={{
        padding: "40px", textAlign: "center",
        backgroundColor: "#C0C0C0", border: "2px solid #FFF",
        borderRightColor: "#000", borderBottomColor: "#000", color: "#000"
    }}>Loading...</div>
);

// Reusable section heading matching existing pattern
const SectionHeading = ({ children }) => (
    <motion.h2
        className="mb-3 text-white"
        style={{
            textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
            fontWeight: "bold", letterSpacing: "1px", fontSize: "1.8rem"
        }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
    >
        {children}
    </motion.h2>
);

const HomePage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        if (window.location.hash) {
            window.history.replaceState(null, null, window.location.pathname + window.location.search);
        }
        const timeoutId = setTimeout(() => window.scrollTo(0, 0), 50);
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <>
            {/* All existing sections: profile, knoweachother, skills, experience, projects, hobbies, contact */}
            {/* Copy exact JSX from current App.jsx — remove #blog section */}
        </>
    );
};

export default HomePage;
```

---

### Task 4: Create BlogListPage

**Files:**
- Create: `src/pages/BlogListPage.jsx`

**Step 1: Build blog list page**

Reuse the card design from existing `Blog.jsx` but navigate to `/blog/:id` on click instead of opening inline. Use consistent W95 card styling (matching `Experience.jsx` pattern: `card card-tertiary`, gradient title bar, card body).

Key design patterns to follow (from Experience.jsx and Contact.jsx):
- Outer `motion.div` with `initial/whileInView` animation
- `card card-tertiary` wrapper with `card-header` title bar
- Section heading above cards

The page should:
1. Fetch `/data/blog_posts.json`
2. Render each post as a W95 card
3. "Read Post" button uses `<Link to={'/blog/' + post.id}>` (react-router)
4. Wrap in same section heading style as other sections

---

### Task 5: Create BlogPostPage

**Files:**
- Create: `src/pages/BlogPostPage.jsx`

**Step 1: Build full-page Notepad viewer**

Use `useParams()` to get `:id`, fetch the matching post from `/data/blog_posts.json`. Render in the existing Notepad-style viewer (title bar, menu bar, status bar, white content area).

Key changes from inline Blog.jsx PostViewer:
- X button → `useNavigate()` to `/blog`
- Add "← Back to Blog" W95 button in the toolbar area
- Full page (no AnimatePresence needed)
- Scroll to top on mount
- Handle post not found (show W95 error dialog)

---

### Task 6: Update Navbar for routing

**Files:**
- Modify: `src/components/Navbar.jsx`

**Step 1: Import Link from react-router-dom**

**Step 2: Change Blog nav item**

Change Blog from `{ target: "#blog" }` to `{ target: "/blog" }`. For all `#section` links, keep as `<a href>` but for `/blog`, use react-router `<Link>`. Add a helper: if target starts with `/`, render `<Link>`, otherwise render `<a href>`.

Also add the same logic to mobile menu items.

---

### Task 7: Update App.jsx with routing

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`

**Step 1: Update main.jsx**

```jsx
import { BrowserRouter } from 'react-router-dom';
// wrap <App /> with <BrowserRouter>
```

**Step 2: Update App.jsx**

```jsx
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

function App() {
    return (
        <>
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<Suspense fallback={<SectionLoader />}><HomePage /></Suspense>} />
                    <Route path="/blog" element={<Suspense fallback={<SectionLoader />}><BlogListPage /></Suspense>} />
                    <Route path="/blog/:id" element={<Suspense fallback={<SectionLoader />}><BlogPostPage /></Suspense>} />
                </Route>
            </Routes>
            <SpeedInsights />
            <Analytics />
        </>
    );
}
```

---

### Task 8: Add Vercel SPA rewrites

**Files:**
- Create: `vercel.json`

**Step 1: Create vercel.json**

```json
{
    "rewrites": [
        { "source": "/(.*)", "destination": "/" }
    ]
}
```

This ensures `/blog/ppl-sprint1-week3` doesn't 404 on page refresh.

---

### Task 9: Clean up old Blog.jsx

**Files:**
- Delete or repurpose: `src/components/Blog.jsx`

Since BlogListPage and BlogPostPage now handle everything, delete `Blog.jsx` or keep it as a redirect component if needed.

---

### Task 10: Build and verify

**Step 1: Run dev server**

Run: `cd "/Users/dafandikri/Documents/Personal/Portfolio Website/portfolio-website" && npm run dev`

**Step 2: Verify routes**
- `http://localhost:5173/` — homepage loads, no Blog section, Navbar Blog link works
- `http://localhost:5173/blog` — blog list loads with post cards
- `http://localhost:5173/blog/ppl-sprint1-week3` — post viewer loads
- Refresh on `/blog/ppl-sprint1-week3` — still works (Vite dev handles this)

**Step 3: Build for production**

Run: `npm run build`
Expected: No errors, blog pages code-split into separate chunks

---

### Task 11: Write IR comments to Google Sheets via MCP

**Step 1: Read IR comments from `ir-comments-sprint1-week3.md`**
- Replace `[link ke blog post di dafandikri.tech]` with `https://dafandikri.tech/blog/ppl-sprint1-week3`

**Step 2: Use Google Sheets MCP to write comments**
- Sheet ID: `148irSMZF0w-KZejrhE5oww2PZF3tHWImhWeySZ4X9UY`
- GID: `182153663`
- Write Part A + Part B comments into the appropriate cells

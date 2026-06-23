# Blog Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the blog feature with search/tag filtering, Mermaid diagram support, per-post SEO meta, and a new SIRA architecture blog post with rich diagrams.

**Architecture:** Blog already works (BlogListPage + BlogPostPage + blog_posts.json + routes). This plan adds only the missing pieces: client-side search/filter, Mermaid rendering via `useEffect` + dynamic import, document.title/meta update per post, and a new JSON blog post entry with embedded Mermaid diagrams.

**Tech Stack:** Vite + React 19 (JSX), react-router-dom v7, framer-motion, Bootstrap 5 + Windows 95 CSS theme, `mermaid` npm package (new dependency).

**Security note:** Blog content is rendered as HTML from `blog_posts.json` — a file we fully control in our own repo. The trust model is "own static JSON", not user-generated input. This is the existing pattern in the codebase; no change to the trust model is made in this plan.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/pages/BlogListPage.jsx` | Modify | Add search input + tag filter UI and filtering logic |
| `src/pages/BlogPostPage.jsx` | Modify | Add Mermaid init via useEffect + document.title/meta update |
| `public/data/blog_posts.json` | Modify | Add new SIRA architecture blog post with Mermaid diagrams |
| `package.json` | Modify | Add `mermaid` dependency |

---

### Task 1: Install Mermaid

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install mermaid via pnpm**

```bash
cd "/Users/dafandikri/Documents/Personal/Portfolio Website/portfolio-website"
pnpm add mermaid
```

Expected output: `+ mermaid X.X.X` in the resolution output.

- [ ] **Step 2: Verify install**

```bash
node -e "import('/Users/dafandikri/Documents/Personal/Portfolio Website/portfolio-website/node_modules/mermaid/dist/mermaid.esm.mjs').then(m => console.log('mermaid ok:', typeof m.default.initialize))"
```

Expected: `mermaid ok: function`

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(blog): add mermaid dependency for diagram rendering"
```

---

### Task 2: Mermaid Rendering + Per-Post SEO in BlogPostPage

**Files:**
- Modify: `src/pages/BlogPostPage.jsx`

After React renders the HTML string from `post.content` into the DOM, Mermaid must be told to scan and process any `<div class="mermaid">` elements. This is done in a `useEffect` with a dynamic import so Mermaid only loads on blog post pages. We also update `document.title` and the meta description per post for basic SPA SEO.

- [ ] **Step 1: Add two new useEffects after the existing scroll-to-top useEffect**

In `src/pages/BlogPostPage.jsx`, after `useEffect(() => { window.scrollTo(0, 0); }, []);`, add:

```jsx
useEffect(() => {
    if (!post) return;
    const originalTitle = document.title;
    document.title = `${post.title} — Erdafa Andikri`;
    const metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc?.getAttribute('content') ?? '';
    if (metaDesc) metaDesc.setAttribute('content', post.excerpt);
    return () => {
        document.title = originalTitle;
        if (metaDesc) metaDesc.setAttribute('content', originalDesc);
    };
}, [post]);

useEffect(() => {
    if (!post) return;
    let cancelled = false;
    import('mermaid').then(({ default: mermaid }) => {
        if (cancelled) return;
        mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: {
                primaryColor: '#000080',
                primaryTextColor: '#ffffff',
                primaryBorderColor: '#000000',
                lineColor: '#808080',
                secondaryColor: '#DFDFDF',
                tertiaryColor: '#FFFFE1',
                fontFamily: '"Courier New", monospace',
                fontSize: '13px',
            },
        });
        mermaid.run({ querySelector: '.blog-content .mermaid' });
    });
    return () => { cancelled = true; };
}, [post]);
```

- [ ] **Step 2: Add `.mermaid` styling to the `<style>` block inside BlogPostPage**

Inside the existing `<style>` JSX string (the one with `.blog-content h2 { ... }` etc.), add at the end:

```css
.blog-content .mermaid {
    background-color: #1a1a2e;
    border: 2px solid #808080;
    border-right: 2px solid #fff;
    border-bottom: 2px solid #fff;
    padding: 16px;
    margin: 12px 0;
    overflow-x: auto;
    text-align: center;
}
.blog-content .mermaid svg {
    max-width: 100%;
}
```

- [ ] **Step 3: Manual smoke test**

```bash
pnpm dev
```

Navigate to any existing blog post (e.g. `/blog/ppl-payment-system-lessons`). Verify:
- No errors in DevTools Console
- Browser tab title changes to the post title
- Page loads correctly

- [ ] **Step 4: Commit**

```bash
git add src/pages/BlogPostPage.jsx
git commit -m "feat(blog): add mermaid diagram rendering and per-post document title/meta"
```

---

### Task 3: Search + Tag Filter in BlogListPage

**Files:**
- Modify: `src/pages/BlogListPage.jsx`

Currently all posts render with no filtering. We add client-side search (by title/excerpt/tags) and single-tag filter — derived state only, no new components (YAGNI).

- [ ] **Step 1: Add searchQuery and selectedTag state**

In `src/pages/BlogListPage.jsx`, after `const [loading, setLoading] = useState(true);`:

```jsx
const [searchQuery, setSearchQuery] = useState('');
const [selectedTag, setSelectedTag] = useState(null);
```

- [ ] **Step 2: Add derived filtered data**

After `const navigate = useNavigate();` and before the `useEffect` blocks:

```jsx
const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort();

const filteredPosts = posts.filter((post) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
        q === '' ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));
    const matchesTag = selectedTag === null || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
});
```

- [ ] **Step 3: Add search + filter toolbar inside the card body, before the loading ternary**

Find the `<div className="card-body">` that wraps the post list. Insert this as its first child:

```jsx
{!loading && posts.length > 0 && (
    <div className="mb-3">
        <div className="mb-2" style={{ display: 'flex', gap: '4px' }}>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                style={{
                    flex: 1,
                    fontFamily: '"Windows 95", "Courier New", monospace',
                    fontSize: '12px',
                    padding: '3px 6px',
                    border: '2px solid #808080',
                    borderRightColor: '#fff',
                    borderBottomColor: '#fff',
                    background: '#fff',
                    color: '#000',
                    outline: 'none',
                }}
            />
            {searchQuery && (
                <button
                    className="btn btn-sm btn-primary border-dark"
                    onClick={() => setSearchQuery('')}
                    style={{ fontSize: '11px' }}
                >
                    <span className="btn-text">X Clear</span>
                </button>
            )}
        </div>
        {allTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                <button
                    onClick={() => setSelectedTag(null)}
                    style={{
                        fontSize: '10px', padding: '2px 6px',
                        border: '1px solid #808080', cursor: 'pointer',
                        background: selectedTag === null ? '#000080' : '#DFDFDF',
                        color: selectedTag === null ? '#fff' : '#000',
                        fontFamily: 'inherit',
                    }}
                >
                    All
                </button>
                {allTags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        style={{
                            fontSize: '10px', padding: '2px 6px',
                            border: '1px solid #808080', cursor: 'pointer',
                            background: selectedTag === tag ? '#000080' : '#DFDFDF',
                            color: selectedTag === tag ? '#fff' : '#000',
                            fontFamily: 'inherit',
                        }}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        )}
    </div>
)}
```

- [ ] **Step 4: Replace `posts.map(...)` with `filteredPosts.map(...)`**

Find:
```jsx
posts.map((post, index) => (
    <BlogCard key={post.id} post={post} index={index} />
))
```

Replace with:
```jsx
filteredPosts.length === 0 ? (
    <div style={{ padding: '20px', textAlign: 'center', color: '#808080', fontSize: '12px' }}>
        No posts match your search.
    </div>
) : (
    filteredPosts.map((post, index) => (
        <BlogCard key={post.id} post={post} index={index} />
    ))
)
```

- [ ] **Step 5: Manual smoke test**

```bash
pnpm dev
```

Go to `/blog`. Verify:
- Search box appears above posts
- Tag buttons appear (one per unique tag, plus "All")
- Typing in search box filters posts in real time
- Clicking a tag shows only matching posts
- Clicking active tag again returns to "All"
- "No posts match" message appears when no results

- [ ] **Step 6: Commit**

```bash
git add src/pages/BlogListPage.jsx
git commit -m "feat(blog): add client-side search and tag filter to blog list"
```

---

### Task 4: New Blog Post — SIRA Sprint 3 with Mermaid Architecture Diagrams

**Files:**
- Modify: `public/data/blog_posts.json`

This post documents SIRA Sprint 3 implementation work. The `content` field contains HTML with `<div class="mermaid">flowchart...</div>` blocks. Task 2's `useEffect` will render these into SVG diagrams automatically when the post is opened.

- [ ] **Step 1: Open `public/data/blog_posts.json` — identify the opening `[` of the array**

The file starts with `[`. Insert the new post object immediately after `[` and before the first existing post, followed by a comma.

The new post entry:

```json
{
  "id": "ppl-sprint3-implementation-plan",
  "title": "SIRA Sprint 3: Arsitektur Testing, CI Quality, dan Security Hardening",
  "date": "2026-04-07",
  "category": "Software Engineering",
  "tags": ["PPL", "TDD", "CI/CD", "SonarQube", "Security", "FastAPI", "Testing", "SIRA"],
  "excerpt": "Sprint 3 SIRA: bagaimana saya membangun lapisan testing mutation-oriented, meningkatkan observability CI pipeline, melakukan security hardening endpoint autentikasi, dan menggunakan AI secara kritis sebagai mitra engineering — bukan sebagai copy-paste machine.",
  "readTime": "12 min read",
  "content": "<h2>Overview Sprint 3</h2><p>Sprint 3 SIRA berfokus pada <strong>kualitas dan keamanan</strong> — bukan feature baru. Kontribusi saya mencakup empat area: testing strategy, CI observability, security hardening, dan AI-assisted engineering.</p><div class=\"mermaid\">flowchart TD\n    A[Sprint 3 Goal] --> B[Testing Quality]\n    A --> C[CI Observability]\n    A --> D[Security Hardening]\n    A --> E[AI Literacy]\n    B --> B1[Mutation Testing]\n    B --> B2[Integration Tests]\n    B --> B3[Edge Cases]\n    C --> C1[SonarQube Gate]\n    C --> C2[Per-Job Reports]\n    C --> C3[Status Granularity]\n    D --> D1[Auth Hardening]\n    D --> D2[Dependency Patch]\n    E --> E1[Bug Analysis]\n    E --> E2[Solution Drafting]\n    E --> E3[Pipeline Verification]</div><hr/><h2>1. TDD dan Coverage: Lebih dari Happy Path</h2><p>Banyak developer berhenti di happy path. Tapi sistem pembayaran punya banyak kondisi yang hanya muncul di edge case — dan inilah yang paling penting untuk ditest.</p><div class=\"mermaid\">flowchart LR\n    subgraph Testing Layers\n        A[Happy Path] -->|basic| B[Negative Cases]\n        B -->|deeper| C[Corner Cases]\n        C -->|strongest| D[Mutation-Oriented]\n    end\n    D --> E[High Confidence]\n    style A fill:#4CAF50,color:#fff\n    style B fill:#FF9800,color:#fff\n    style C fill:#F44336,color:#fff\n    style D fill:#9C27B0,color:#fff\n    style E fill:#000080,color:#fff</div><p>Contoh corner case yang saya tambahkan di commit <code>4feb534</code>:</p><pre><code># payment sorting dengan tanggal sama\ndef test_payment_sorting_same_date():\n    payments = [\n        {\"id\": \"p1\", \"payment_date\": \"2026-03-01\", \"amount_paid\": 100},\n        {\"id\": \"p2\", \"payment_date\": \"2026-03-01\", \"amount_paid\": 200},\n    ]\n    result = sort_payments(payments)\n    assert result[0][\"id\"] == \"p1\"  # stable sort\n\n# fallback data saat DB return None\ndef test_payment_fallback_when_db_empty():\n    with patch(\"app.services.payment_service.get_all_payments\",\n               new_callable=AsyncMock, return_value=None):\n        result = client.get(\"/api/payments/\")\n    assert result.status_code == 200\n    assert result.json() == []</code></pre><p>Commits: <code>9b37f24</code>, <code>2e1d4cc</code>, <code>4feb534</code>, <code>ac5c938</code>, <code>e6781cc</code></p><hr/><h2>2. Best Practice: Separation of Concerns</h2><div class=\"mermaid\">flowchart TD\n    subgraph Before\n        A1[PaymentService] -->|monolithic| B1[DB queries + Business logic + Status + Sorting]\n    end\n    subgraph After\n        A2[PaymentService] --> B2[PaymentRepository]\n        A2 --> C2[PaymentValidator]\n        A2 --> D2[StatusRecalculator]\n        A2 --> E2[PaymentSorter]\n    end\n    style Before fill:#8B0000,color:#fff\n    style After fill:#003300,color:#fff</div><p>Commits: <code>8d5b215</code>, <code>4d7ea6d</code>, <code>6fdbcc8</code>, <code>c6f6910</code>, <code>2de2fd5</code></p><hr/><h2>3. CI Observability</h2><div class=\"mermaid\">flowchart LR\n    A[Code Push] --> B[CI Trigger]\n    B --> C{Quality Gate}\n    C -->|fail| D[SonarQube Report]\n    C -->|fail| E[Per-Job Status]\n    D --> G[Dev: 2 bugs, 1 vuln]\n    E --> G2[Dev: test-unit failed]\n    G --> H[Fix in under 10 min]\n    G2 --> H\n    style C fill:#000080,color:#fff\n    style H fill:#4CAF50,color:#fff</div><p>Commits: <code>43e8471</code>, <code>270f59f</code>, <code>416462b</code></p><hr/><h2>4. Security Hardening</h2><div class=\"mermaid\">flowchart TD\n    A[Request] --> B{Auth Middleware}\n    B -->|no token| C[401]\n    B -->|invalid scope| D[403]\n    B -->|valid| E[Rate Limiter]\n    E -->|exceeded| F[429]\n    E -->|ok| G[Handler]\n    H[Dep Scanner] --> I{CVE Check}\n    I -->|high sev| J[Block Pipeline]\n    I -->|ok| K[Deploy]\n    style G fill:#003300,color:#fff\n    style K fill:#003300,color:#fff\n    style C fill:#8B0000,color:#fff\n    style D fill:#8B0000,color:#fff\n    style J fill:#8B0000,color:#fff</div><p>OWASP mitigasi: <strong>A01 Broken Access Control</strong> (commit <code>77183d1</code>) dan <strong>A06 Vulnerable Components</strong> (commit <code>2921aee</code>).</p><hr/><h2>5. AI Literacy: Critical Engineering</h2><div class=\"mermaid\">flowchart LR\n    A[Bug / Task] --> B[Analyze with AI]\n    B --> C[Draft Solution]\n    C --> D{Verify}\n    D -->|lint fail| B\n    D -->|test fail| B\n    D -->|pipeline fail| B\n    D -->|all pass| E[Commit]\n    style D fill:#000080,color:#fff\n    style E fill:#003300,color:#fff</div><p>Rule: tidak ada AI output yang commit tanpa lint + typecheck + test + pipeline green. AI adalah <em>thinking partner</em>, bukan copy-paste machine.</p><hr/><h2>Penutup</h2><p>Sprint 3 mengajarkan bahwa <strong>quality work adalah invisible work</strong> — tidak ada fitur baru yang visible ke user, tapi sistem menjadi lebih robust, CI lebih informatif, dan codebase lebih aman.</p>"
}
```

- [ ] **Step 2: Validate JSON is well-formed after edit**

```bash
python3 -c "
import json
with open('public/data/blog_posts.json') as f:
    data = json.load(f)
print(f'Valid JSON: {len(data)} posts')
for p in data:
    print(f'  - {p[\"id\"]} ({p[\"date\"]})')
"
```

Expected:
```
Valid JSON: 5 posts
  - ppl-sprint3-implementation-plan (2026-04-07)
  - ppl-payment-system-lessons (2026-03-17)
  - ppl-sprint2-week1 (2026-03-10)
  - ppl-sprint1-week3-ir (2026-03-09)
  - ppl-sprint1-week3 (2026-03-08)
```

- [ ] **Step 3: Start dev server and verify Mermaid renders**

```bash
pnpm dev
```

Navigate to `/blog` → click "SIRA Sprint 3" post. Verify:
- All 5 Mermaid flowcharts render as SVG (not raw text)
- Diagrams use Windows 95 dark-blue color scheme
- Browser tab title shows the post title
- Search box on `/blog` page now also shows new tags (PPL, SonarQube, etc.)

- [ ] **Step 4: Commit**

```bash
git add public/data/blog_posts.json
git commit -m "feat(blog): add SIRA sprint 3 post with mermaid architecture diagrams"
```

---

## Self-Review

**Spec coverage:**
- Search + tag filter → Task 3 ✅
- Mermaid diagram support → Task 2 ✅
- Per-post SEO (document.title + meta description) → Task 2 ✅
- New blog post with architecture diagrams → Task 4 ✅
- SIRA implementation plan content → Task 4 ✅

**Intentionally skipped (YAGNI):**
- RSS feed: SPA with no SSR; requires either a build script or a separate route; not evidenced as needed
- Sitemap.xml: same reason; static file would go stale; better handled if/when SSR is added

**Placeholder scan:** All steps have complete code. No TBDs.

**Task dependencies:**
- Task 1 (mermaid install) → must complete before Task 2 (import mermaid)
- Task 2 (mermaid useEffect) → must complete before Task 4 (post with mermaid diagrams)
- Task 3 (search/filter) → independent, can run between any other tasks

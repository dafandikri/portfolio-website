import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'

const HomePage = lazy(() => import('./pages/HomePage'))
const BlogListPage = lazy(() => import('./pages/BlogListPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))

const SectionLoader = () => (
  <div style={{
    padding: "40px",
    textAlign: "center",
    backgroundColor: "#C0C0C0",
    border: "2px solid #FFF",
    borderRightColor: "#000",
    borderBottomColor: "#000",
    color: "#000"
  }}>
    Loading...
  </div>
)

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={
          <Suspense fallback={<SectionLoader />}>
            <HomePage />
          </Suspense>
        } />
        <Route path="/blog" element={
          <Suspense fallback={<SectionLoader />}>
            <BlogListPage />
          </Suspense>
        } />
        <Route path="/blog/:id" element={
          <Suspense fallback={<SectionLoader />}>
            <BlogPostPage />
          </Suspense>
        } />
      </Route>
    </Routes>
  )
}

export default App

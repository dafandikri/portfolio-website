import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/w95.css';

const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const BlogPostPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch('/data/blog_posts.json');
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                const found = data.find((p) => p.id === id);
                if (found) {
                    setPost(found);
                } else {
                    setNotFound(true);
                }
            } catch (err) {
                console.error('Error fetching blog post:', err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#C0C0C0',
                border: '2px solid #FFF',
                borderRightColor: '#000',
                borderBottomColor: '#000',
                color: '#000'
            }}>
                Loading...
            </div>
        );
    }

    if (notFound) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ maxWidth: '400px', margin: '60px auto' }}
            >
                <div className="card card-tertiary">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <span>Error</span>
                    </div>
                    <div className="card-body text-center">
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>&#10060;</div>
                        <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
                            Blog post not found.
                        </p>
                        <button className="btn btn-sm btn-primary border-dark" onClick={() => navigate('/blog')}>
                            <span className="btn-text">OK</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div>
            <motion.h2
                className="mb-3 text-white"
                style={{
                    textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
                    fontWeight: "bold", letterSpacing: "1px", fontSize: "1.8rem"
                }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                Blog
            </motion.h2>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
            >
                {/* Back button — same btn pattern as project */}
                <div className="mb-3">
                    <button className="btn btn-sm btn-primary" onClick={() => navigate('/blog')}>
                        <span className="btn-text">&larr; Back to Blog</span>
                    </button>
                </div>

                {/* Main post card — card card-tertiary like Experience.jsx */}
                <div className="card card-tertiary mx-auto">
                    {/* Title bar */}
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <span>{post.title}</span>
                    </div>

                    <div className="card-body">
                        {/* Meta info — same as BlogListPage cards */}
                        <div className="d-flex flex-wrap mb-3" style={{ gap: '8px' }}>
                            <span style={{
                                fontSize: '11px',
                                color: '#000',
                                backgroundColor: '#fff',
                                border: '1px solid #808080',
                                borderRight: '1px solid #fff',
                                borderBottom: '1px solid #fff',
                                padding: '1px 6px'
                            }}>
                                {formatDate(post.date)}
                            </span>
                            <span style={{
                                fontSize: '11px',
                                color: '#000',
                                backgroundColor: '#fff',
                                border: '1px solid #808080',
                                borderRight: '1px solid #fff',
                                borderBottom: '1px solid #fff',
                                padding: '1px 6px'
                            }}>
                                {post.readTime}
                            </span>
                            <span style={{
                                fontSize: '11px',
                                color: '#fff',
                                backgroundColor: '#000080',
                                padding: '1px 6px'
                            }}>
                                {post.category}
                            </span>
                            {post.tags.map((tag) => (
                                <span key={tag} style={{
                                    fontSize: '10px',
                                    backgroundColor: '#DFDFDF',
                                    border: '1px solid #808080',
                                    padding: '1px 4px',
                                    color: '#000'
                                }}>
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Blog content — in yellow tip box like Experience.jsx detail area */}
                        {/* Content is from our own static JSON — safe to render as HTML */}
                        <div className="p-3" style={{
                            backgroundColor: "#FFFFE1",
                            border: "1px solid #888",
                            borderRightColor: "#FFF",
                            borderBottomColor: "#FFF"
                        }}>
                            <style>{`
                                .blog-content h2 {
                                    font-size: 1.1rem;
                                    font-weight: bold;
                                    margin: 24px 0 12px 0;
                                    padding-bottom: 6px;
                                    border-bottom: 2px solid #000080;
                                    color: #000080;
                                }
                                .blog-content h3 {
                                    font-size: 0.95rem;
                                    font-weight: bold;
                                    margin: 18px 0 8px 0;
                                    color: #000;
                                }
                                .blog-content p {
                                    margin: 8px 0;
                                    text-align: justify;
                                    font-size: 0.9rem;
                                    line-height: 1.6;
                                }
                                .blog-content pre {
                                    background-color: #1a1a2e;
                                    color: #e0e0e0;
                                    padding: 12px;
                                    border: 2px solid #808080;
                                    border-right: 2px solid #fff;
                                    border-bottom: 2px solid #fff;
                                    overflow-x: auto;
                                    font-size: 11.5px;
                                    line-height: 1.5;
                                    margin: 10px 0;
                                    font-family: 'Courier New', monospace;
                                }
                                .blog-content code {
                                    font-family: 'Courier New', monospace;
                                    font-size: 12px;
                                }
                                .blog-content pre code {
                                    background: none;
                                    padding: 0;
                                    border: none;
                                    color: inherit;
                                }
                                .blog-content code:not(pre code) {
                                    background-color: #DFDFDF;
                                    padding: 1px 4px;
                                    border: 1px solid #808080;
                                    font-size: 11.5px;
                                }
                                .blog-content table {
                                    width: 100%;
                                    border-collapse: collapse;
                                    margin: 10px 0;
                                    font-size: 12px;
                                }
                                .blog-content th {
                                    background-color: #000080;
                                    color: #fff;
                                    padding: 6px 10px;
                                    text-align: left;
                                    border: 1px solid #000;
                                }
                                .blog-content td {
                                    padding: 6px 10px;
                                    border: 1px solid #808080;
                                    background-color: #fff;
                                }
                                .blog-content tr:nth-child(even) td {
                                    background-color: #f0f0f0;
                                }
                                .blog-content ul, .blog-content ol {
                                    margin: 8px 0;
                                    padding-left: 24px;
                                    font-size: 0.9rem;
                                }
                                .blog-content li {
                                    margin: 4px 0;
                                }
                                .blog-content hr {
                                    border: none;
                                    border-top: 2px solid #808080;
                                    margin: 20px 0;
                                }
                                .blog-content strong {
                                    color: #000080;
                                }
                                .blog-content img {
                                    max-width: 100%;
                                    border: 2px solid #808080;
                                    border-right: 2px solid #fff;
                                    border-bottom: 2px solid #fff;
                                    margin: 8px 0;
                                }
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
                            `}</style>
                            <div
                                className="blog-content"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>

                        {/* Bottom actions — checkbox + button like Experience.jsx */}
                        <div className="form-check mt-3 mb-2">
                            <label className="form-check-label">
                                <input className="form-check-input" type="checkbox" defaultChecked />
                                <span className="form-check-x"></span>
                                <span className="form-check-sign"></span>
                                Show this dialog at startup
                            </label>
                        </div>

                        <div className="d-flex justify-content-end">
                            <button className="btn btn-sm btn-primary border-dark" onClick={() => navigate('/blog')}>
                                <span className="btn-text">Close</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BlogPostPage;

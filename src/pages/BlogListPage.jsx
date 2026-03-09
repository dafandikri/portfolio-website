import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/w95.css';

const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const BlogListPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/data/blog_posts.json');
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                setPosts(data);
            } catch (err) {
                console.error('Error fetching blog posts:', err);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const BlogCard = ({ post, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="card card-tertiary mb-3"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/blog/${post.id}`)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            {/* Title bar */}
            <div className="card-header d-flex justify-content-between align-items-center">
                <span>{post.title}</span>
            </div>

            {/* Card body */}
            <div className="card-body">
                {/* Meta info row */}
                <div className="d-flex flex-wrap mb-2" style={{ gap: '8px' }}>
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
                </div>

                {/* Excerpt in yellow tip box */}
                <div className="p-3 mb-2" style={{
                    backgroundColor: "#FFFFE1",
                    border: "1px solid #888",
                    borderRightColor: "#FFF",
                    borderBottomColor: "#FFF"
                }}>
                    <p className="mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                        {post.excerpt}
                    </p>
                </div>

                {/* Tags */}
                <div className="d-flex flex-wrap" style={{ gap: '4px' }}>
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

                {/* Action button */}
                <div className="d-flex justify-content-end mt-3">
                    <button
                        className="btn btn-sm btn-primary border-dark"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/blog/${post.id}`);
                        }}
                    >
                        <span className="btn-text">Read Post</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );

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
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
                <div className="card card-tertiary mx-auto">
                    {/* Window Title Bar */}
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <span>Blog</span>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div style={{
                                padding: '40px',
                                textAlign: 'center',
                                color: '#000'
                            }}>
                                Loading blog posts...
                            </div>
                        ) : posts.length === 0 ? (
                            <div style={{
                                padding: '40px',
                                textAlign: 'center',
                                color: '#808080'
                            }}>
                                No blog posts yet. Check back soon!
                            </div>
                        ) : (
                            posts.map((post, index) => (
                                <BlogCard key={post.id} post={post} index={index} />
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BlogListPage;

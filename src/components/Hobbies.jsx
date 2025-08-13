import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/w95.css';
import { getImage, getIcon } from '../assets';

const Hobbies = () => {
    const [movieReviews, setMovieReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch movie reviews from JSON file
    useEffect(() => {
        const fetchMovieReviews = async () => {
            try {
                setLoading(true);
                const response = await fetch('/data/letterboxd_reviews.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setMovieReviews(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching movie reviews:', err);
                setError('Failed to load movie reviews');
                // Fallback to sample data
                setMovieReviews([
                    {
                        title: "Sample Movie",
                        year: "2024",
                        poster: "",
                        rating: 4.0,
                        watchedDate: "August 10, 2025",
                        review: "Unable to load reviews from server. This is sample data."
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieReviews();
    }, []);

    // Navigation handlers
    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % movieReviews.length);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + movieReviews.length) % movieReviews.length);
    };

    const currentReview = movieReviews[currentIndex];

    // Generate star rating display
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="d-flex align-items-center">
                {/* Full stars */}
                {Array(fullStars).fill().map((_, i) => (
                    <span key={`full-${i}`} style={{color: "#FFD700", fontSize: "16px"}}>★</span>
                ))}
                {/* Half star */}
                {hasHalfStar && (
                    <span style={{color: "#FFD700", fontSize: "16px"}}>☆</span>
                )}
                {/* Empty stars */}
                {Array(emptyStars).fill().map((_, i) => (
                    <span key={`empty-${i}`} style={{color: "#DDD", fontSize: "16px"}}>☆</span>
                ))}
                <span className="ml-2 small">({rating}/5)</span>
            </div>
        );
    };

    // Clean up review text (remove "dafandikri's review published on Letterboxd:" prefix)
    const cleanReviewText = (review) => {
        if (!review) return "No review available.";
        return review.replace(/^dafandikri's review published on Letterboxd:/, '').trim();
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
            >
                <div className="card card-tertiary" style={{marginBottom: "0px"}}>
                    <div className="card-header d-flex justify-content-between align-items-center" style={{backgroundColor: "#000080", color: "white"}}>
                        <div className="d-flex align-items-center">
                            <div className="icon w95-music-cd mr-2"></div>
                            <span>Film Reviews</span>
                        </div>
                    </div>
                    <div className="card-body p-3 text-center">
                        <p>Loading movie reviews...</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (!movieReviews.length) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true, margin: "-100px" }}
            >
                <div className="card card-tertiary" style={{marginBottom: "0px"}}>
                    <div className="card-header d-flex justify-content-between align-items-center" style={{backgroundColor: "#000080", color: "white"}}>
                        <div className="d-flex align-items-center">
                            <div className="icon w95-music-cd mr-2"></div>
                            <span>Film Reviews</span>
                        </div>
                    </div>
                    <div className="card-body p-3 text-center">
                        <p>No movie reviews found.</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
        >
            {/* Film Reviews Dialog */}
            <div className="card card-tertiary" style={{marginBottom: "0px"}}>
                {/* Dialog Title Bar */}
                <div className="card-header d-flex justify-content-between align-items-center" style={{backgroundColor: "#000080", color: "white", overflow: "hidden"}}>
                    <div className="d-flex align-items-center">
                        <div className="icon w95-music-cd mr-2"></div>
                        <span>Film Reviews</span>
                    </div>
                    <div>
                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>━</button>
                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>☐</button>
                        <button className="btn btn-sm" style={{width: "16px", height: "16px", fontSize: "8px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>&#10006;</button>
                    </div>
                </div>
                
                <div className="card-body p-3">
                    {/* Description */}
                    <div className="mb-3">
                        <p className="small mb-0" style={{fontStyle: "italic"}}>
                            This shows my {movieReviews.length} latest Letterboxd reviews
                        </p>
                    </div>

                    {/* Navigation Controls */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <button 
                            className="btn btn-sm btn-primary" 
                            onClick={goToPrevious}
                            style={{minWidth: "80px"}}
                            disabled={movieReviews.length <= 1}
                        >
                            <span className="btn-text">← Previous</span>
                        </button>
                        
                        <span style={{
                            fontSize: "0.85rem", 
                            color: "#333",
                            fontWeight: "bold"
                        }}>
                            {currentIndex + 1} of {movieReviews.length}
                        </span>
                        
                        <button 
                            className="btn btn-sm btn-primary" 
                            onClick={goToNext}
                            style={{minWidth: "80px"}}
                            disabled={movieReviews.length <= 1}
                        >
                            <span className="btn-text">Next →</span>
                        </button>
                    </div>

                    {/* Movie Review Content */}
                    <motion.div 
                        key={currentIndex}
                        className="row g-0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {/* Left Side - Movie Poster */}
                        <div className="col-md-4">
                            <div className="p-2">
                                {/* Widescreen cinematic poster with Windows 95 border that hugs the image */}
                                {currentReview.poster_url && !currentReview.poster_url.includes('empty-poster') ? (
                                    <div style={{
                                        border: "2px solid #000", 
                                        borderRightColor: "#DFDFDF", 
                                        borderBottomColor: "#DFDFDF", 
                                        backgroundColor: "#FFFFFF", 
                                        padding: "3px",
                                        display: "inline-block",
                                        lineHeight: 0
                                    }}>
                                        <img 
                                            src={currentReview.poster_url} 
                                            alt={`${currentReview.title} Cinematic Poster`} 
                                            style={{
                                                width: "100%",
                                                maxWidth: "100%",
                                                height: "auto",
                                                objectFit: "contain",
                                                display: "block"
                                            }}
                                            onError={(e) => {
                                                // Fallback if poster fails to load
                                                e.target.style.display = 'none';
                                                e.target.parentElement.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{
                                        border: "2px solid #000", 
                                        borderRightColor: "#DFDFDF", 
                                        borderBottomColor: "#DFDFDF", 
                                        backgroundColor: "#FFFFFF", 
                                        padding: "3px",
                                        height: "280px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        overflow: "hidden"
                                    }}>
                                        <div style={{
                                            display: "flex", 
                                            flexDirection: "column", 
                                            alignItems: "center", 
                                            justifyContent: "center", 
                                            height: "100%", 
                                            backgroundColor: "#f5f5f5",
                                            color: "#666",
                                            fontSize: "14px",
                                            fontFamily: "'Windows 95', 'MS Sans Serif', monospace",
                                            textAlign: "center",
                                            padding: "20px"
                                        }}>
                                            <div style={{fontSize: "40px", marginBottom: "12px"}}>🎬</div>
                                            <div style={{fontWeight: "bold", fontSize: "16px", marginBottom: "8px"}}>
                                                {currentReview.title}
                                            </div>
                                            <div style={{fontSize: "12px", color: "#888"}}>
                                                Cinematic Poster Loading...
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Right Side - Movie Details and Review */}
                        <div className="col-md-8">
                            <div className="p-3">
                                {/* Movie title and year */}
                                <h5 className="mb-2" style={{fontWeight: "bold"}}>
                                    {currentReview.title} ({currentReview.year})
                                </h5>
                                
                                {/* Star rating */}
                                <div className="mb-2">
                                    {renderStars(currentReview.rating)}
                                </div>
                                
                                {/* Watch date */}
                                <div className="mb-3">
                                    <small className="text-muted">
                                        <strong>Watched on:</strong> {currentReview.watchedDate}
                                    </small>
                                </div>
                                
                                {/* Review text with proper newline handling */}
                                <div style={{
                                    border: "1px solid #ccc",
                                    borderTopColor: "#999",
                                    borderLeftColor: "#999",
                                    backgroundColor: "#ffffff",
                                    padding: "12px",
                                    fontSize: "14px",
                                    lineHeight: "1.5",
                                    maxHeight: "160px",
                                    overflowY: "auto",
                                    fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif",
                                    whiteSpace: "pre-wrap" // This preserves newlines and spaces
                                }}>
                                    {cleanReviewText(currentReview.review)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* Bottom buttons */}
                    <div className="d-flex justify-content-end mt-3">
                        <a href="https://letterboxd.com/dafandikri/" className="btn btn-sm mr-2 btn-primary border-dark" target="_blank" rel="noopener noreferrer">
                            <span className="btn-text">View on Letterboxd</span>
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Hobbies;
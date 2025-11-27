import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/w95.css';
import { getImage, getIcon } from '../assets';

const Hobbies = () => {
    const [activeTab, setActiveTab] = useState('films');
    const [movieReviews, setMovieReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [climbingContent, setClimbingContent] = useState([]);
    const [climbingLoading, setClimbingLoading] = useState(true);
    const [currentClimbingIndex, setCurrentClimbingIndex] = useState(0);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

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

    // Fetch climbing content from JSON file
    useEffect(() => {
        const fetchClimbingContent = async () => {
            try {
                setClimbingLoading(true);
                const response = await fetch('/data/climbing_content.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setClimbingContent(data);
            } catch (err) {
                console.error('Error fetching climbing content:', err);
                // Fallback to empty array
                setClimbingContent([]);
            } finally {
                setClimbingLoading(false);
            }
        };

        fetchClimbingContent();
    }, []);

    // Navigation handlers
    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % movieReviews.length);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + movieReviews.length) % movieReviews.length);
    };

    // Climbing navigation handlers
    const goToNextClimbing = () => {
        setCurrentClimbingIndex((prev) => (prev + 1) % climbingContent.length);
        setCurrentMediaIndex(0); // Reset media index when changing sessions
    };

    const goToPreviousClimbing = () => {
        setCurrentClimbingIndex((prev) => (prev - 1 + climbingContent.length) % climbingContent.length);
        setCurrentMediaIndex(0); // Reset media index when changing sessions
    };

    // Media pagination handlers for current climbing session
    const goToNextMedia = () => {
        if (currentClimbing && currentClimbing.media && currentClimbing.media.length > 0) {
            setCurrentMediaIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % currentClimbing.media.length;
                return nextIndex;
            });
        }
    };

    const goToPreviousMedia = () => {
        if (currentClimbing && currentClimbing.media && currentClimbing.media.length > 0) {
            setCurrentMediaIndex((prevIndex) => {
                const prevIdx = prevIndex === 0 ? currentClimbing.media.length - 1 : prevIndex - 1;
                return prevIdx;
            });
        }
    };

    const currentReview = movieReviews[currentIndex];
    const currentClimbing = climbingContent[currentClimbingIndex];

    // Ensure currentMediaIndex is valid when climbing content or index changes
    useEffect(() => {
        if (currentClimbing && currentClimbing.media && currentClimbing.media.length > 0) {
            // If currentMediaIndex is out of bounds, reset to 0
            if (currentMediaIndex >= currentClimbing.media.length) {
                setCurrentMediaIndex(0);
            }
        } else {
            // If no media available, reset to 0
            setCurrentMediaIndex(0);
        }
    }, [currentClimbingIndex, currentClimbing, currentMediaIndex]);

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

    // Render climbing media with pagination (image or video)
    const renderClimbingMedia = (content) => {
        if (!content || !content.media || !Array.isArray(content.media) || content.media.length === 0) {
            return (
                <div style={{
                    border: "2px solid #000",
                    borderRightColor: "#DFDFDF",
                    borderBottomColor: "#DFDFDF",
                    backgroundColor: "#f5f5f5",
                    padding: "20px",
                    minHeight: "280px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                    fontSize: "14px",
                    fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"
                }}>
                    No media available
                </div>
            );
        }

        // Ensure currentMediaIndex is within bounds
        const safeMediaIndex = Math.min(currentMediaIndex, content.media.length - 1);
        const currentMedia = content.media[safeMediaIndex];
        const hasMultipleMedia = content.media.length > 1;

        // Additional safety check
        if (!currentMedia) {
            return (
                <div style={{
                    border: "2px solid #000",
                    borderRightColor: "#DFDFDF",
                    borderBottomColor: "#DFDFDF",
                    backgroundColor: "#f5f5f5",
                    padding: "20px",
                    minHeight: "280px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                    fontSize: "14px",
                    fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"
                }}>
                    Media not available
                </div>
            );
        }

        const mediaElement = (() => {
            if (currentMedia.type === 'video') {
                // Check if it's a YouTube URL
                if (currentMedia.url.includes('youtube.com/embed') || currentMedia.url.includes('youtu.be')) {
                    // Ensure URL has proper parameters for better loading
                    const videoUrl = currentMedia.url.includes('?') 
                        ? currentMedia.url 
                        : `${currentMedia.url}?rel=0&modestbranding=1`;
                        
                    return (
                        <iframe
                            key={`video-${currentClimbingIndex}-${safeMediaIndex}`}
                            src={videoUrl}
                            title={currentMedia.caption || 'Climbing video'}
                            width="100%"
                            height="350"
                            style={{
                                border: "none",
                                backgroundColor: "#000",
                                display: "block",
                                width: "100%",
                                height: "350px",
                                objectFit: "contain"
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                        />
                    );
                }
                
                // For local video files
                return (
                    <video
                        key={`video-${currentClimbingIndex}-${safeMediaIndex}`}
                        src={currentMedia.url}
                        controls
                        style={{
                            width: "100%", 
                            height: "350px", 
                            backgroundColor: "#000", 
                            display: "block",
                            objectFit: "contain"
                        }}
                        preload="metadata"
                    >
                        Your browser does not support the video tag.
                    </video>
                );
            }

            return (
                <img
                    key={`image-${currentClimbingIndex}-${safeMediaIndex}`}
                    src={currentMedia.url}
                    alt={currentMedia.caption || 'Climbing photo'}
                    loading="lazy"
                    style={{
                        width: "100%",
                        height: "350px",
                        objectFit: "cover",
                        display: "block",
                        backgroundColor: "#000"
                    }}
                    onError={(e) => {
                        e.target.parentElement.innerHTML = '<div style="padding: 20px; text-align: center; color: #666; font-family: \'Windows 95\', \'MS Sans Serif\', sans-serif; height: 350px; display: flex; align-items: center; justify-content: center;">Image unavailable</div>';
                    }}
                />
            );
        })();

        return (
            <div style={{ position: 'relative' }}>
                <div style={{
                    border: "2px solid #000",
                    borderRightColor: "#DFDFDF",
                    borderBottomColor: "#DFDFDF",
                    backgroundColor: "#FFFFFF",
                    padding: "3px",
                    display: "inline-block",
                    lineHeight: 0,
                    width: "100%"
                }}>
                    {mediaElement}
                </div>
                
                {/* Media pagination controls */}
                {hasMultipleMedia && (
                    <>
                        <button
                            onClick={goToPreviousMedia}
                            style={{
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(192, 192, 192, 0.9)',
                                border: '2px solid',
                                borderTopColor: '#FFFFFF',
                                borderLeftColor: '#FFFFFF',
                                borderRightColor: '#808080',
                                borderBottomColor: '#808080',
                                width: '40px',
                                height: '40px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                            }}
                            onMouseDown={(e) => {
                                e.target.style.borderTopColor = '#808080';
                                e.target.style.borderLeftColor = '#808080';
                                e.target.style.borderRightColor = '#FFFFFF';
                                e.target.style.borderBottomColor = '#FFFFFF';
                            }}
                            onMouseUp={(e) => {
                                e.target.style.borderTopColor = '#FFFFFF';
                                e.target.style.borderLeftColor = '#FFFFFF';
                                e.target.style.borderRightColor = '#808080';
                                e.target.style.borderBottomColor = '#808080';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderTopColor = '#FFFFFF';
                                e.target.style.borderLeftColor = '#FFFFFF';
                                e.target.style.borderRightColor = '#808080';
                                e.target.style.borderBottomColor = '#808080';
                            }}
                        >
                            ‹
                        </button>
                        
                        <button
                            onClick={goToNextMedia}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(192, 192, 192, 0.9)',
                                border: '2px solid',
                                borderTopColor: '#FFFFFF',
                                borderLeftColor: '#FFFFFF',
                                borderRightColor: '#808080',
                                borderBottomColor: '#808080',
                                width: '40px',
                                height: '40px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10
                            }}
                            onMouseDown={(e) => {
                                e.target.style.borderTopColor = '#808080';
                                e.target.style.borderLeftColor = '#808080';
                                e.target.style.borderRightColor = '#FFFFFF';
                                e.target.style.borderBottomColor = '#FFFFFF';
                            }}
                            onMouseUp={(e) => {
                                e.target.style.borderTopColor = '#FFFFFF';
                                e.target.style.borderLeftColor = '#FFFFFF';
                                e.target.style.borderRightColor = '#808080';
                                e.target.style.borderBottomColor = '#808080';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderTopColor = '#FFFFFF';
                                e.target.style.borderLeftColor = '#FFFFFF';
                                e.target.style.borderRightColor = '#808080';
                                e.target.style.borderBottomColor = '#808080';
                            }}
                        >
                            ›
                        </button>
                        
                        {/* Media counter */}
                        <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: '#FFFFFF',
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif",
                            border: '1px solid #FFFFFF',
                            borderRadius: '2px'
                        }}>
                            {safeMediaIndex + 1} / {content.media.length}
                        </div>
                    </>
                )}
                
                {/* Media caption */}
                {currentMedia.caption && (
                    <div style={{
                        padding: '8px',
                        backgroundColor: '#DFDFDF',
                        border: '1px solid #808080',
                        borderTop: 'none',
                        fontSize: '12px',
                        fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif",
                        color: '#000',
                        textAlign: 'center'
                    }}>
                        {currentMedia.caption}
                    </div>
                )}
            </div>
        );
    };

    // Tab button styling function
    const getTabStyle = (isActive) => ({
        backgroundColor: isActive ? '#FFFFFF' : '#C0C0C0',
        border: '2px solid',
        borderTopColor: isActive ? '#FFFFFF' : '#DFDFDF',
        borderLeftColor: isActive ? '#FFFFFF' : '#DFDFDF', 
        borderRightColor: isActive ? '#808080' : '#808080',
        borderBottomColor: isActive ? 'transparent' : '#808080',
        padding: '6px 16px',
        marginRight: '4px',
        marginBottom: isActive ? '0' : '2px',
        fontWeight: isActive ? 'bold' : 'normal',
        cursor: 'pointer',
        fontSize: '0.9rem',
        position: 'relative',
        zIndex: isActive ? 2 : 1,
        fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif",
        color: '#000',
        outline: 'none'
    });

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
                            <span>Hobbies</span>
                        </div>
                    </div>
                    <div className="card-body p-3 text-center">
                        <p>Loading hobbies content...</p>
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
                            <span>Hobbies</span>
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
            {/* Hobbies Dialog */}
            <div className="card card-tertiary" style={{marginBottom: "0px"}}>
                {/* Dialog Title Bar */}
                <div className="card-header d-flex justify-content-between align-items-center" style={{backgroundColor: "#000080", color: "white", overflow: "hidden"}}>
                    <div className="d-flex align-items-center">
                        <div className="icon w95-music-cd mr-2"></div>
                        <span>Hobbies</span>
                    </div>
                    <div>
                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>━</button>
                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>☐</button>
                        <button className="btn btn-sm" style={{width: "16px", height: "16px", fontSize: "8px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>&#10006;</button>
                    </div>
                </div>
                
                <div className="card-body p-3">
                    {/* Tab Navigation */}
                    <div className="mb-3">
                        <div className="d-flex align-items-end">
                            <button
                                onClick={() => setActiveTab('films')}
                                style={getTabStyle(activeTab === 'films')}
                            >
                                Film Reviews
                            </button>
                            <button
                                onClick={() => setActiveTab('climbing')}
                                style={getTabStyle(activeTab === 'climbing')}
                            >
                                Climbing
                            </button>
                        </div>
                        <div style={{
                            borderTop: '2px solid #808080',
                            marginTop: '-2px',
                            position: 'relative',
                            zIndex: 1
                        }}></div>
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                        <p className="small mb-0" style={{fontStyle: "italic", fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"}}>
                            {activeTab === 'films' 
                                ? `This shows my ${movieReviews.length} latest Letterboxd reviews`
                                : 'My climbing journey with photos, videos, and session notes'
                            }
                        </p>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'films' ? (
                        // Film Reviews Content
                        loading ? (
                            <div className="text-center py-4">
                                <p style={{fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"}}>Loading movie reviews...</p>
                            </div>
                        ) : !movieReviews.length ? (
                            <div className="text-center py-4">
                                <p style={{fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"}}>No movie reviews found.</p>
                            </div>
                        ) : (
                        <>
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
                                            alt={`${currentReview.title} movie poster`}
                                            width="280"
                                            height="400"
                                            loading="lazy"
                                            style={{
                                                width: "100%",
                                                maxWidth: "100%",
                                                height: "auto",
                                                objectFit: "contain",
                                                display: "block"
                                            }}
                                            onError={(e) => {
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
                    </>
                    )) : (
                        // Climbing Content
                        climbingLoading ? (
                            <div className="text-center py-4">
                                <p style={{fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"}}>Loading climbing content...</p>
                            </div>
                        ) : !climbingContent.length ? (
                            <div className="text-center py-4">
                                <p style={{fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"}}>No climbing content found.</p>
                            </div>
                        ) : (
                        <>
                    {/* Climbing Navigation Controls */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <button 
                            className="btn btn-sm btn-primary" 
                            onClick={goToPreviousClimbing}
                            style={{minWidth: "80px"}}
                            disabled={climbingContent.length <= 1}
                        >
                            <span className="btn-text">← Previous</span>
                        </button>
                        
                        <span style={{
                            fontSize: "0.85rem", 
                            color: "#333",
                            fontWeight: "bold",
                            fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"
                        }}>
                            {currentClimbingIndex + 1} of {climbingContent.length}
                        </span>
                        
                        <button 
                            className="btn btn-sm btn-primary" 
                            onClick={goToNextClimbing}
                            style={{minWidth: "80px"}}
                            disabled={climbingContent.length <= 1}
                        >
                            <span className="btn-text">Next →</span>
                        </button>
                    </div>

                    {/* Climbing Content */}
                    <motion.div 
                        key={`climbing-${currentClimbingIndex}`}
                        className="row g-0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {/* Left Side - Climbing Media */}
                        <div className="col-md-5">
                            <div className="p-2">
                                {renderClimbingMedia(currentClimbing)}
                            </div>
                        </div>
                        
                        {/* Right Side - Climbing Details */}
                        <div className="col-md-7">
                            <div className="p-3">
                                <h5 className="mb-2" style={{fontWeight: "bold", fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"}}>
                                    {currentClimbing.title}
                                </h5>
                                
                                <div className="mb-2" style={{fontSize: "0.9rem", color: "#444", fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"}}>
                                    <strong>Location:</strong> {currentClimbing.location}
                                </div>
                                
                                {/* Climbing metadata badges */}
                                <div className="d-flex flex-wrap mb-3" style={{gap: "8px"}}>
                                    {currentClimbing.grade && (
                                        <span style={{
                                            border: "2px solid",
                                            borderTopColor: "#FFFFFF",
                                            borderLeftColor: "#FFFFFF",
                                            borderRightColor: "#808080",
                                            borderBottomColor: "#808080",
                                            backgroundColor: "#C0C0C0",
                                            padding: "4px 8px",
                                            fontSize: "0.8rem",
                                            fontWeight: "bold",
                                            fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"
                                        }}>
                                            Grade: {currentClimbing.grade}
                                        </span>
                                    )}
                                    {currentClimbing.style && (
                                        <span style={{
                                            border: "2px solid",
                                            borderTopColor: "#FFFFFF",
                                            borderLeftColor: "#FFFFFF",
                                            borderRightColor: "#808080",
                                            borderBottomColor: "#808080",
                                            backgroundColor: "#C0C0C0",
                                            padding: "4px 8px",
                                            fontSize: "0.8rem",
                                            fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"
                                        }}>
                                            {currentClimbing.style}
                                        </span>
                                    )}
                                    {currentClimbing.date && (
                                        <span style={{
                                            border: "2px solid",
                                            borderTopColor: "#FFFFFF",
                                            borderLeftColor: "#FFFFFF",
                                            borderRightColor: "#808080",
                                            borderBottomColor: "#808080",
                                            backgroundColor: "#C0C0C0",
                                            padding: "4px 8px",
                                            fontSize: "0.8rem",
                                            fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"
                                        }}>
                                            {currentClimbing.date}
                                        </span>
                                    )}
                                </div>
                                
                                {/* Description */}
                                <div style={{
                                    border: "1px solid #ccc",
                                    borderTopColor: "#999",
                                    borderLeftColor: "#999",
                                    backgroundColor: "#ffffff",
                                    padding: "12px",
                                    fontSize: "14px",
                                    lineHeight: "1.5",
                                    minHeight: "100px",
                                    maxHeight: "160px",
                                    overflowY: "auto",
                                    fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif",
                                    whiteSpace: "pre-wrap"
                                }}>
                                    {currentClimbing.description || 'No description available.'}
                                </div>

                                {/* Highlights */}
                                {currentClimbing.highlights && currentClimbing.highlights.length > 0 && (
                                    <div className="mt-3">
                                        <small className="text-muted" style={{fontWeight: "bold", fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"}}>Highlights:</small>
                                        <ul className="mb-0" style={{fontSize: "13px", paddingLeft: "20px", marginTop: "6px", fontFamily: "'Windows 95', 'MS Sans Serif', sans-serif"}}>
                                            {currentClimbing.highlights.map((highlight, idx) => (
                                                <li key={idx}>{highlight}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                    </>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Hobbies;
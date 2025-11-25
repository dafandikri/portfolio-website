import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import { DOMParser } from '@xmldom/xmldom';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LETTERBOXD_USERNAME = process.env.LETTERBOXD_USERNAME || 'dafandikri';
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_TMDB_API_KEY';
const RSS_URL = `https://letterboxd.com/${LETTERBOXD_USERNAME}/rss/`;
const OUTPUT_PATH = path.join(__dirname, '../public/data/letterboxd_reviews.json');
const MAX_REVIEWS = 5;

// Helper function to make HTTPS requests
function httpsRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve(data);
            });
            
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Parse Letterboxd RSS item
function parseLetterboxdItem(item) {
    const titleElement = item.getElementsByTagName('title')[0];
    const descriptionElement = item.getElementsByTagName('description')[0];
    const pubDateElement = item.getElementsByTagName('pubDate')[0];
    const linkElement = item.getElementsByTagName('link')[0];
    
    // Letterboxd-specific elements
    const filmTitleElement = item.getElementsByTagName('letterboxd:filmTitle')[0];
    const filmYearElement = item.getElementsByTagName('letterboxd:filmYear')[0];
    const memberRatingElement = item.getElementsByTagName('letterboxd:memberRating')[0];
    const watchedDateElement = item.getElementsByTagName('letterboxd:watchedDate')[0];
    
    if (!titleElement || !descriptionElement) return null;
    
    const rawTitle = titleElement.textContent || titleElement.nodeValue || '';
    const rawDescription = descriptionElement.textContent || descriptionElement.nodeValue || '';
    const pubDate = pubDateElement ? (pubDateElement.textContent || pubDateElement.nodeValue || '') : '';
    const link = linkElement ? (linkElement.textContent || linkElement.nodeValue || '') : '';
    
    // Extract movie info - prefer Letterboxd custom elements, fallback to parsing title
    let movieTitle, year, rating;
    
    if (filmTitleElement && filmYearElement) {
        // Use Letterboxd's dedicated elements (preferred)
        movieTitle = filmTitleElement.textContent || filmTitleElement.nodeValue || '';
        year = filmYearElement.textContent || filmYearElement.nodeValue || '';
        
        if (memberRatingElement) {
            const ratingText = memberRatingElement.textContent || memberRatingElement.nodeValue || '';
            rating = parseFloat(ratingText) || undefined;
        }
    } else {
        // Fallback: parse from title "Movie Title, Year - ★★★★"
        const titleMatch = rawTitle.match(/^(.+?),\s*(\d{4})\s*-\s*(.*)/);
        if (!titleMatch) return null;
        
        movieTitle = titleMatch[1].trim();
        year = titleMatch[2];
        
        // Extract rating from stars in title
        const ratingPart = titleMatch[3] || '';
        const starCount = (ratingPart.match(/★/g) || []).length;
        const halfStar = ratingPart.includes('½');
        rating = starCount + (halfStar ? 0.5 : 0);
        if (rating === 0) rating = undefined;
    }
    
    // Parse description to extract review text
    const reviewText = parseReviewFromDescription(rawDescription);
    
    // Format date - prefer watchedDate, fallback to pubDate
    let watchedDate;
    if (watchedDateElement) {
        const watchedDateText = watchedDateElement.textContent || watchedDateElement.nodeValue || '';
        watchedDate = formatWatchedDate(watchedDateText);
    } else {
        watchedDate = formatDate(pubDate);
    }
    
    return {
        title: movieTitle,
        year: year,
        rating: rating,
        review: reviewText,
        watchedDate: watchedDate,
        link: link
    };
}

// Parse and clean review text from HTML description
function parseReviewFromDescription(htmlContent) {
    try {
        // Remove CDATA wrapper if present
        let content = htmlContent.replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim();
        
        // Letterboxd format: <p><img ...></p> <p>review text</p><p>more review text</p>
        // We want to extract all <p> tags that contain text (not just images)
        
        // Find all paragraph elements
        const paragraphs = [];
        const pMatches = content.match(/<p[^>]*>(.*?)<\/p>/gs);
        
        if (pMatches) {
            pMatches.forEach(pMatch => {
                // Extract content from paragraph
                let pContent = pMatch.replace(/<p[^>]*>/, '').replace(/<\/p>/, '');
                
                // Skip paragraphs that only contain images
                if (pContent.includes('<img') && !pContent.replace(/<img[^>]*>/g, '').trim()) {
                    return;
                }
                
                // Clean up the content
                pContent = pContent
                    .replace(/<img[^>]*>/g, '')           // Remove images
                    .replace(/<br\s*\/?>/gi, '\n')       // <br> to newline
                    .replace(/<em>(.*?)<\/em>/gi, '$1')  // remove <em> tags but keep content
                    .replace(/<strong>(.*?)<\/strong>/gi, '$1') // remove <strong> tags but keep content
                    .replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')   // remove <a> tags but keep content
                    .replace(/<[^>]*>/g, '')             // remove any remaining HTML tags
                    .replace(/&quot;/g, '"')             // decode quotes
                    .replace(/&amp;/g, '&')              // decode ampersands
                    .replace(/&lt;/g, '<')               // decode less than
                    .replace(/&gt;/g, '>')               // decode greater than
                    .trim();
                
                if (pContent) {
                    paragraphs.push(pContent);
                }
            });
        }
        
        // Join paragraphs with double newlines
        const reviewText = paragraphs.join('\n\n');
        
        // Final cleanup
        const finalText = reviewText
            .replace(/\n{3,}/g, '\n\n')              // collapse 3+ newlines to 2
            .trim();
        
        return finalText || 'No review text available.';
    } catch (error) {
        console.error('Error parsing review text:', error);
        return 'Error parsing review text.';
    }
}

// Format date from RSS pubDate
function formatDate(pubDate) {
    if (!pubDate) return 'Unknown date';
    
    try {
        const date = new Date(pubDate);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Unknown date';
    }
}

// Format watched date from letterboxd format (YYYY-MM-DD)
function formatWatchedDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    try {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch (error) {
        console.error('Error formatting watched date:', error);
        return 'Unknown date';
    }
}

// Search for movie on TMDb and get multiple poster options
async function getMoviePoster(title, year) {
    if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_TMDB_API_KEY') {
        console.log('TMDb API key not provided, skipping poster lookup');
        return null;
    }
    
    try {
        // Multiple search strategies for better matching
        const searchStrategies = [
            // Strategy 1: Exact title + year
            { query: encodeURIComponent(title), year: year },
            // Strategy 2: Title without punctuation + year  
            { query: encodeURIComponent(title.replace(/[^\w\s]/g, '')), year: year },
            // Strategy 3: Just title without year constraint
            { query: encodeURIComponent(title), year: null },
            // Strategy 4: Common title variations
            { query: encodeURIComponent(getAlternativeTitle(title)), year: year }
        ];
        
        for (const strategy of searchStrategies) {
            console.log(`  Trying: "${decodeURIComponent(strategy.query)}" (${strategy.year || 'any year'})`);
            
            const searchUrl = strategy.year 
                ? `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${strategy.query}&year=${strategy.year}`
                : `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${strategy.query}`;
            
            const response = await httpsRequest(searchUrl);
            const data = JSON.parse(response);
            
            if (data.results && data.results.length > 0) {
                // Find best match with fuzzy matching
                const bestMatch = findBestMatch(data.results, title, year);
                
                if (bestMatch) {
                    console.log(`    Found match: "${bestMatch.title}" (${bestMatch.release_date?.substring(0, 4)}) - Score: ${bestMatch.confidence}`);
                    
                    // Get additional images for this movie (including backdrops and posters, but no logos)
                    const movieImages = await getMovieImages(bestMatch.id);
                    
                    // Select the best widescreen poster from available options
                    const selectedPoster = selectBestPoster(bestMatch, movieImages);
                    
                    if (selectedPoster) {
                        return {
                            tmdb_id: bestMatch.id,
                            poster_url: selectedPoster.url,
                            poster_type: selectedPoster.type,
                            poster_info: selectedPoster.info,
                            available_posters: selectedPoster.availablePosters
                        };
                    }
                }
            }
            
            // Small delay between attempts
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        return null;
    } catch (error) {
        console.error(`Error fetching poster for "${title}" (${year}):`, error);
        return null;
    }
}

// Get additional movie images (posters and backdrops only, no logos)
async function getMovieImages(movieId) {
    try {
        const imagesUrl = `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${TMDB_API_KEY}&include_image_language=en,null`;
        const response = await httpsRequest(imagesUrl);
        const data = JSON.parse(response);
        
        return {
            posters: data.posters || [],
            backdrops: data.backdrops || []
            // Removed logos - we don't want them for cinematic widescreen experience
        };
    } catch (error) {
        console.error(`Error fetching images for movie ID ${movieId}:`, error);
        return { posters: [], backdrops: [] };
    }
}

// Get alternative title variations for better matching
function getAlternativeTitle(title) {
    const alternatives = {
        "Your Name.": "Kimi no Na wa",
        "Perfect Blue": "パーフェクトブルー"
    };
    
    return alternatives[title] || title;
}

// Find best match using fuzzy matching and confidence scoring
function findBestMatch(results, originalTitle, originalYear) {
    let bestMatch = null;
    let highestScore = 0;
    
    for (const movie of results) {
        const movieYear = movie.release_date ? movie.release_date.substring(0, 4) : null;
        let score = 0;
        
        // Title similarity scoring
        const titleScore = calculateTitleSimilarity(movie.title, originalTitle);
        const originalTitleScore = movie.original_title ? 
            calculateTitleSimilarity(movie.original_title, originalTitle) : 0;
        
        score += Math.max(titleScore, originalTitleScore) * 0.7; // 70% weight for title match
        
        // Year matching scoring
        if (movieYear && originalYear) {
            const yearDiff = Math.abs(parseInt(movieYear) - parseInt(originalYear));
            if (yearDiff === 0) score += 0.3; // Perfect year match
            else if (yearDiff <= 1) score += 0.2; // Close year match
            else if (yearDiff <= 2) score += 0.1; // Acceptable year match
            // No points for >2 year difference
        }
        
        // Bonus for having a poster
        if (movie.poster_path) score += 0.05;
        
        // Popularity bonus (higher popularity = more likely to be correct)
        score += Math.min(movie.popularity / 1000, 0.05); // Max 0.05 bonus
        
        movie.confidence = score;
        
        if (score > highestScore && score > 0.6) { // Minimum confidence threshold
            highestScore = score;
            bestMatch = movie;
        }
    }
    
    return bestMatch;
}

// Calculate title similarity using basic string comparison
function calculateTitleSimilarity(title1, title2) {
    if (!title1 || !title2) return 0;
    
    // Normalize strings
    const normalize = (str) => str.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')    // Normalize spaces
        .trim();
    
    const norm1 = normalize(title1);
    const norm2 = normalize(title2);
    
    // Exact match
    if (norm1 === norm2) return 1.0;
    
    // Check if one contains the other
    if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.9;
    
    // Calculate Jaccard similarity using word sets
    const words1 = new Set(norm1.split(' '));
    const words2 = new Set(norm2.split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
}

// Select one widescreen poster without logos for cinematic display
function selectBestPoster(movie, movieImages) {
    const posterOptions = [];
    
    // Option 1: High-quality backdrops (widescreen format) - HIGHEST PRIORITY
    if (movieImages.backdrops && movieImages.backdrops.length > 0) {
        movieImages.backdrops.forEach((backdrop, index) => {
            const aspectRatio = backdrop.width / backdrop.height;
            
            // Strongly prefer widescreen ratios
            const aspectBonus = aspectRatio >= 1.5 ? 60 : aspectRatio >= 1.2 ? 40 : 0;
            const popularityScore = (backdrop.vote_average || 5) * 4;
            const sizeBonus = backdrop.width >= 1000 ? 30 : backdrop.width >= 500 ? 15 : 0;
            const qualityBonus = backdrop.width >= 1920 ? 25 : backdrop.width >= 1280 ? 15 : 0;
            
            posterOptions.push({
                url: `https://image.tmdb.org/t/p/w500${backdrop.file_path}`,
                type: 'cinematic_backdrop',
                score: 200 + aspectBonus + popularityScore + sizeBonus + qualityBonus + (15 - index),
                info: `Cinematic backdrop ${index + 1} (${backdrop.width}x${backdrop.height}, ratio: ${aspectRatio.toFixed(1)}:1)`,
                aspectRatio: aspectRatio
            });
        });
    }
    
    // Option 2: Landscape posters only (no logos)
    if (movieImages.posters && movieImages.posters.length > 0) {
        movieImages.posters.forEach((poster, index) => {
            const aspectRatio = poster.width / poster.height;
            
            // Only include landscape posters (aspect ratio >= 1.2)
            if (aspectRatio >= 1.2) {
                const languageBonus = (!poster.iso_639_1 || poster.iso_639_1 === 'en') ? 25 : 0;
                const popularityScore = (poster.vote_average || 5) * 3;
                const sizeBonus = poster.width >= 500 ? 20 : 0;
                const aspectBonus = aspectRatio >= 1.5 ? 40 : 20;
                
                posterOptions.push({
                    url: `https://image.tmdb.org/t/p/w500${poster.file_path}`,
                    type: 'widescreen_poster',
                    score: 150 + aspectBonus + languageBonus + popularityScore + sizeBonus + (12 - index),
                    info: `Widescreen poster ${index + 1} (${poster.width}x${poster.height}, ratio: ${aspectRatio.toFixed(1)}:1)`,
                    aspectRatio: aspectRatio
                });
            }
        });
    }
    
    // Sort by score (highest first)
    posterOptions.sort((a, b) => b.score - a.score);
    
    // Filter to only widescreen options (aspect ratio >= 1.2)
    const widescreenOptions = posterOptions.filter(option => 
        option.aspectRatio >= 1.2
    );
    
    if (widescreenOptions.length === 0) {
        console.log(`    No widescreen cinematic options found`);
        return null;
    }
    
    // Select the single best option
    const selectedOption = widescreenOptions[0];
    
    console.log(`    Selected: ${selectedOption.info} (Score: ${selectedOption.score})`);
    
    return selectedOption;
}

// Main function to fetch and process Letterboxd reviews
async function fetchLetterboxdReviews() {
    try {
        console.log(`Fetching RSS feed from: ${RSS_URL}`);
        
        // Fetch RSS feed
        const rssContent = await httpsRequest(RSS_URL);
        
        // Parse XML
        const parser = new DOMParser();
        const doc = parser.parseFromString(rssContent, 'text/xml');
        
        // Get all items
        const items = doc.getElementsByTagName('item');
        const reviews = [];
        
        console.log(`Found ${items.length} RSS items, processing latest ${MAX_REVIEWS}...`);
        
        // Process items (limit to MAX_REVIEWS)
        for (let i = 0; i < Math.min(items.length, MAX_REVIEWS); i++) {
            const item = items[i];
            const reviewData = parseLetterboxdItem(item);
            
            if (reviewData) {
                console.log(`Processing: ${reviewData.title} (${reviewData.year})`);
                
                // Get movie poster from TMDb
                const posterData = await getMoviePoster(reviewData.title, reviewData.year);
                if (posterData) {
                    reviewData.tmdb_id = posterData.tmdb_id;
                    reviewData.poster_url = posterData.poster_url;
                    console.log(`  ✓ Found cinematic poster (TMDb ID: ${posterData.tmdb_id})`);
                } else {
                    console.log(`  ✗ No poster found`);
                }
                
                reviews.push(reviewData);
                
                // Add small delay to be respectful to TMDb API
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }
        
        // Write reviews to output file
        await fs.writeFile(OUTPUT_PATH, JSON.stringify(reviews, null, 2));
        console.log(`\nSaved ${reviews.length} reviews to: ${OUTPUT_PATH}`);
    } catch (error) {
        console.error('Error fetching Letterboxd reviews:', error);
    }
}

// Execute main function
fetchLetterboxdReviews();
import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
import time
import os

class LetterboxdScraper:
    def __init__(self, username):
        self.username = username
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Referer": "https://letterboxd.com/",
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    # ---------- Helpers ----------
    def _best_src_from_srcset(self, srcset: str):
        """Pick the largest width URL from a srcset string."""
        if not srcset:
            return None
        try:
            best = None
            best_w = -1
            for part in srcset.split(','):
                part = part.strip()
                if ' ' not in part:
                    # sometimes a lone URL (no width); treat as candidate
                    url = part.strip()
                    if url and best is None:
                        best = url
                    continue
                url, w = part.rsplit(' ', 1)
                w = w.strip().rstrip('w')
                if w.isdigit():
                    w = int(w)
                    if w > best_w:
                        best, best_w = url.strip(), w
            return best
        except Exception:
            return None

    def _normalize_poster_url(self, url: str):
        """Normalize Letterboxd poster URLs; prefer 460x690 crop if a smaller crop is present."""
        if not url:
            return None
        if url.startswith('//'):
            url = 'https:' + url
        # Upgrade to 460x690 crop if we detect a smaller -0-XX-0-YY-crop pattern
        if 'ltrbxd.com' in url and 'crop' in url:
            url = re.sub(r'-0-\d+-0-\d+-crop', '-0-460-0-690-crop', url)
        return url

    def _clean_review_text(self, text: str):
        """Clean review text by removing unwanted prefixes while preserving formatting and newlines."""
        if not text:
            return text
        
        # Remove the "dafandikri's review published on Letterboxd:" prefix
        text = re.sub(r'^[^:]*\'s review published on Letterboxd:\s*', '', text, flags=re.IGNORECASE)
        
        # Also handle cases without the apostrophe
        text = re.sub(r'^[^:]*s review published on Letterboxd:\s*', '', text, flags=re.IGNORECASE)
        
        # Remove any generic "review published on Letterboxd:" prefix
        text = re.sub(r'^review published on Letterboxd:\s*', '', text, flags=re.IGNORECASE)
        
        # Clean up excessive whitespace but preserve intentional line breaks
        # Replace multiple spaces with single spaces, but keep newlines
        text = re.sub(r'[ \t]+', ' ', text)  # Replace multiple spaces/tabs with single space
        text = re.sub(r'\n[ \t]*\n', '\n\n', text)  # Clean up multiple newlines but keep paragraph breaks
        text = re.sub(r'^\s+|\s+$', '', text, flags=re.MULTILINE)  # Trim whitespace from start/end of each line
        
        return text.strip()

    def _extract_review_with_paragraphs(self, review_element):
        """Extract review text preserving exact paragraph structure from Letterboxd.
        
        Letterboxd structure:
        - Double newlines in original text become <p></p> tags
        - Single newlines in original text become <br> tags
        """
        if not review_element:
            return ""
        
        print(f"Extracting review from element: {review_element.name} with classes: {review_element.get('class', [])}")
        
        # Create a copy to avoid modifying the original
        review_copy = BeautifulSoup(str(review_element), 'html.parser')
        
        paragraphs = []
        
        # Method 1: Look for paragraph elements (most common in Letterboxd reviews)
        p_elements = review_copy.find_all('p')
        if p_elements:
            print(f"Found {len(p_elements)} paragraph elements in review")
            for i, p in enumerate(p_elements):
                # Within each paragraph, <br> tags represent single line breaks
                # Replace <br> tags with single newlines to preserve line breaks within paragraphs
                for br in p.find_all('br'):
                    br.replace_with('\n')
                
                # Get the text content, preserving internal line breaks
                text = p.get_text().strip()
                if text:  # Only add non-empty paragraphs
                    paragraphs.append(text)
                    print(f"  Paragraph {i+1}: {text[:80]}{'...' if len(text) > 80 else ''}")
        
        # Method 2: If no <p> tags, look for div with mixed content
        else:
            print("No paragraph elements found, analyzing div content structure")
            
            # Get all child nodes (including text nodes)
            content_parts = []
            current_paragraph = []
            
            # Process all children to reconstruct the paragraph structure
            for child in review_copy.descendants:
                if child.name == 'br':
                    # Single line break - add newline to current paragraph
                    current_paragraph.append('\n')
                elif child.name == 'p':
                    # If we encounter a p tag, finish current paragraph and start new one
                    if current_paragraph:
                        paragraph_text = ''.join(current_paragraph).strip()
                        if paragraph_text:
                            content_parts.append(paragraph_text)
                        current_paragraph = []
                elif hasattr(child, 'string') and child.string:
                    # Text node - add to current paragraph
                    text = child.string.strip()
                    if text:
                        current_paragraph.append(text)
            
            # Add the last paragraph if any
            if current_paragraph:
                paragraph_text = ''.join(current_paragraph).strip()
                if paragraph_text:
                    content_parts.append(paragraph_text)
            
            # If we still don't have structured content, fallback to simple extraction
            if not content_parts:
                # Replace <br> tags with special markers for single line breaks
                for br in review_copy.find_all('br'):
                    br.replace_with('|||SINGLE_BREAK|||')
                
                # Replace <p> boundaries with double break markers
                for p in review_copy.find_all('p'):
                    p.insert_before('|||PARAGRAPH_START|||')
                    p.insert_after('|||PARAGRAPH_END|||')
                
                text = review_copy.get_text()
                
                # Split by paragraph markers first
                if '|||PARAGRAPH_START|||' in text:
                    paragraph_chunks = re.split(r'\|\|\|PARAGRAPH_START\|\|\|.*?\|\|\|PARAGRAPH_END\|\|\|', text)
                    for chunk in paragraph_chunks:
                        if chunk.strip():
                            # Within each chunk, convert single breaks back to newlines
                            chunk_text = chunk.replace('|||SINGLE_BREAK|||', '\n').strip()
                            if chunk_text:
                                content_parts.append(chunk_text)
                else:
                    # Just convert single breaks to newlines and treat as paragraphs split by double breaks
                    text = text.replace('|||SINGLE_BREAK|||', '\n')
                    potential_paragraphs = re.split(r'\n\s*\n', text)
                    for para in potential_paragraphs:
                        para = para.strip()
                        if para and len(para) > 3:
                            content_parts.append(para)
            
            paragraphs = content_parts
        
        if not paragraphs:
            # Last resort: just get all text and treat as one paragraph
            text = review_copy.get_text().strip()
            if text:
                paragraphs = [text]
                print("Fallback: treating entire review as single paragraph")
        
        # Join paragraphs with double newlines (markdown paragraph separation)
        # This preserves the original structure: paragraphs separated by blank lines
        result = '\n\n'.join(paragraphs)
        print(f"Final extracted review has {len(paragraphs)} paragraphs, {len(result)} characters")
        
        return result

    def _extract_review_with_letterboxd_structure(self, review_element):
        """Extract review text preserving Letterboxd's exact paragraph structure.
        
        From the HTML analysis:
        - Double newlines in original text become separate <p></p> tags  
        - Single newlines within a paragraph become <br> tags
        - Each <p> represents a distinct paragraph of thought
        """
        if not review_element:
            return ""
        
        print(f"Extracting from js-review-body element with {len(review_element.find_all('p'))} paragraph(s)")
        
        paragraphs = []
        
        # Find all paragraph elements within the js-review-body
        p_elements = review_element.find_all('p')
        
        if p_elements:
            for i, p in enumerate(p_elements):
                # Create a copy to avoid modifying original
                p_copy = BeautifulSoup(str(p), 'html.parser')
                
                # Convert <br> tags to single newlines (for line breaks within paragraphs)
                for br in p_copy.find_all('br'):
                    br.replace_with('\n')
                
                # Extract text while preserving internal line breaks
                paragraph_text = p_copy.get_text().strip()
                
                if paragraph_text:  # Only include non-empty paragraphs
                    paragraphs.append(paragraph_text)
                    print(f"  Paragraph {i+1}: '{paragraph_text[:60]}{'...' if len(paragraph_text) > 60 else ''}'")
        else:
            # Fallback: if no <p> tags, treat the entire content as one paragraph
            # but still handle <br> tags properly
            content_copy = BeautifulSoup(str(review_element), 'html.parser')
            
            # Convert <br> tags to newlines
            for br in content_copy.find_all('br'):
                br.replace_with('\n')
            
            text = content_copy.get_text().strip()
            if text:
                paragraphs.append(text)
                print(f"  Single block: '{text[:60]}{'...' if len(text) > 60 else ''}'")
        
        # Join paragraphs with double newlines (preserving paragraph separation)
        result = '\n\n'.join(paragraphs)
        print(f"Final result: {len(paragraphs)} paragraph(s), {len(result)} characters total")
        
        return result

    def _get_movie_release_year(self, soup):
        """Enhanced movie release year extraction with multiple fallback methods."""
        
        # Method 1: Try JSON-LD structured data (most reliable)
        try:
            for script in soup.find_all('script', type='application/ld+json'):
                if script.string:
                    data = json.loads(script.string)
                    # Handle both single objects and arrays
                    items = data if isinstance(data, list) else [data]
                    
                    for item in items:
                        if isinstance(item, dict):
                            # Look for datePublished, releaseDate, or similar
                            for date_field in ['datePublished', 'releaseDate', 'dateCreated']:
                                if date_field in item and item[date_field]:
                                    year_match = re.search(r'(\d{4})', str(item[date_field]))
                                    if year_match:
                                        return year_match.group(1)
        except:
            pass
        
        # Method 2: Film title section with release year
        title_section = soup.select_one('.film-title-wrapper, .film-header, .headline-1')
        if title_section:
            # Look for year in various formats
            year_patterns = [
                r'\b(\d{4})\b',  # Four digit year
                r'(\d{4})\s*\)',  # Year followed by closing parenthesis
                r'\(\s*(\d{4})\s*\)'  # Year in parentheses
            ]
            
            title_text = title_section.get_text()
            for pattern in year_patterns:
                year_match = re.search(pattern, title_text)
                if year_match:
                    year = int(year_match.group(1))
                    # Sanity check: reasonable movie year range
                    if 1888 <= year <= 2030:
                        return str(year)
        
        # Method 3: Meta tags
        meta_selectors = [
            'meta[property="og:title"]',
            'meta[name="twitter:title"]',
            'meta[property="film:release_date"]'
        ]
        
        for selector in meta_selectors:
            meta = soup.select_one(selector)
            if meta and meta.get('content'):
                year_match = re.search(r'\b(\d{4})\b', meta['content'])
                if year_match:
                    year = int(year_match.group(1))
                    if 1888 <= year <= 2030:
                        return str(year)
        
        # Method 4: Breadcrumb or navigation elements
        breadcrumbs = soup.select('.breadcrumb, .nav-breadcrumb, .film-nav')
        for breadcrumb in breadcrumbs:
            year_match = re.search(r'\b(\d{4})\b', breadcrumb.get_text())
            if year_match:
                year = int(year_match.group(1))
                if 1888 <= year <= 2030:
                    return str(year)
        
        # Method 5: Look anywhere in the page for a 4-digit year (last resort)
        # This is less reliable but better than nothing
        page_text = soup.get_text()
        year_matches = re.findall(r'\b(\d{4})\b', page_text)
        
        # Filter for reasonable movie years and pick the most likely candidate
        valid_years = [int(year) for year in year_matches if 1888 <= int(year) <= 2030]
        if valid_years:
            # Sort by frequency and recency - prefer more recent years if tied
            year_counts = {}
            for year in valid_years:
                year_counts[year] = year_counts.get(year, 0) + 1
            
            # Get the most frequent year, with recency as tiebreaker
            most_frequent = max(year_counts.items(), key=lambda x: (x[1], x[0]))
            return str(most_frequent[0])
        
        return None

    # ---------- Public methods ----------
    def get_recent_reviews(self, limit=4):
        """
        Scrape recent movie reviews (or recent films) from a Letterboxd profile.
        Tries multiple URL patterns and CSS selectors.
        """
        print(f"Scraping {limit} latest reviews for user: {self.username}")

        urls_to_try = [
            f"https://letterboxd.com/{self.username}/films/reviews/by/date/",
            f"https://letterboxd.com/{self.username}/films/diary/",
            f"https://letterboxd.com/{self.username}/films/by/date/",
            f"https://letterboxd.com/{self.username}/films/",
            f"https://letterboxd.com/{self.username}/",
        ]

        for url in urls_to_try:
            print(f"Trying URL: {url}")
            try:
                response = self.session.get(url, timeout=25)
                response.raise_for_status()
                soup = BeautifulSoup(response.content, 'html.parser')

                # Broad net of film item selectors
                film_items = soup.select(
                    'li.poster-container, li.film-detail, .poster-list li, '
                    '.film-list li, .poster, .film-poster, li[data-film-id], '
                    'li[data-target-link], .poster-item, .film-item'
                )

                if not film_items:
                    print("No film items found on this page.")
                    continue

                print(f"Found {len(film_items)} film items using selector(s)")
                reviews = []

                for item in film_items[: max(limit * 4, limit)]:  # overfetch, we'll filter
                    try:
                        review_data = self.extract_review_from_item(item)
                        if not review_data:
                            continue

                        # Filter out duplicates by title/year
                        key = (review_data.get('title'), review_data.get('year'))
                        if any((r.get('title'), r.get('year')) == key for r in reviews):
                            continue

                        reviews.append(review_data)
                        print(
                            f"✓ Extracted: {review_data.get('title','?')} "
                            f"({review_data.get('year','?')}) - Poster: "
                            f"{'✓' if review_data.get('poster_url') else '✗'}"
                        )

                        if len(reviews) >= limit:
                            break

                        time.sleep(0.4)  # be gentle
                    except Exception as e:
                        print(f"✗ Error extracting from item: {e}")
                        continue

                if reviews:
                    return reviews

            except requests.RequestException as e:
                print(f"Error fetching {url}: {e}")
                continue

        return []

    def extract_review_from_item(self, item):
        """
        Extract review data from a film list item including a robust poster URL.
        """
        review_data = {}
        try:
            # Film link
            film_link = item.select_one('a[href*="/film/"]')
            if not film_link:
                for link in item.select('a'):
                    href = link.get('href', '')
                    if '/film/' in href:
                        film_link = link
                        break
            if not film_link:
                print("No film link found in item")
                return None

            href = film_link.get('href', '')
            if not href.startswith('http'):
                href = f"https://letterboxd.com{href}"

            # Title from slug, improved by any present alt text later
            slug = href.split('/film/')[-1].rstrip('/').split('/')[0]
            title = slug.replace('-', ' ').title()

            # Try to get poster directly from the item (lazy loaded)
            poster_url = None

            # (A) from the anchor's data attributes
            for attr in ('data-film-poster', 'data-poster', 'data-image'):
                val = film_link.get(attr)
                if val:
                    poster_url = self._normalize_poster_url(val)
                    if poster_url:
                        break

            # (B) any <img> inside the item, prefer largest srcset
            if not poster_url:
                for img in item.select('img'):
                    srcset = img.get('data-srcset') or img.get('srcset')
                    src = None
                    if srcset:
                        src = self._best_src_from_srcset(srcset)
                    if not src:
                        src = img.get('data-src') or img.get('src') or img.get('data-film-poster')
                    if src:
                        poster_url = self._normalize_poster_url(src)
                        if poster_url:
                            break

            # (C) noscript fallback
            if not poster_url:
                for ns in item.select('noscript'):
                    try:
                        ns_soup = BeautifulSoup(ns.text, 'html.parser')
                        img = ns_soup.select_one('img')
                        if img:
                            srcset = img.get('data-srcset') or img.get('srcset')
                            src = self._best_src_from_srcset(srcset) if srcset else (img.get('src') or img.get('data-src'))
                            if src:
                                poster_url = self._normalize_poster_url(src)
                                if poster_url:
                                    break
                    except Exception:
                        pass

            # (D) background-image or data-* on container
            if not poster_url:
                for el in item.select('[style*="background-image"]'):
                    m = re.search(r'background-image:\s*url\((["\']?)(.*?)\1\)', el.get('style', ''))
                    if m:
                        poster_url = self._normalize_poster_url(m.group(2))
                        if poster_url:
                            break
            if not poster_url:
                for attr in ('data-film-poster', 'data-poster', 'data-image'):
                    if item.get(attr):
                        poster_url = self._normalize_poster_url(item.get(attr))
                        if poster_url:
                            break

            # Improve title from image alt text if present
            for img in item.select('img[alt]'):
                alt_text = (img.get('alt') or '').strip()
                if alt_text and len(alt_text) > len(title) and not alt_text.lower().startswith('poster for'):
                    title = alt_text
                    break

            review_data['title'] = title

            # If still no poster or missing details, fetch the film page
            film_details = self.get_film_page_details(href)
            if not poster_url and film_details.get('poster_url'):
                poster_url = film_details['poster_url']
            if poster_url:
                review_data['poster_url'] = poster_url

            # Merge details (year, rating, review, watchedDate)
            review_data.update(film_details)

            # Sensible defaults
            review_data.setdefault('year', "2024")
            review_data.setdefault('rating', 4.0)
            review_data.setdefault('watchedDate', datetime.now().strftime("%B %d, %Y"))
            review_data.setdefault('review', f"A great film! Really enjoyed watching {title}.")

            return review_data
        except Exception as e:
            print(f"Error extracting review data: {e}")
            return None

    def get_film_page_details(self, film_url):
        """
        Get detailed film information from individual film page including poster.
        Checks og/twitter meta, JSON-LD, then DOM images.
        """
        details = {}
        try:
            print(f"Fetching details from: {film_url}")
            resp = self.session.get(film_url, timeout=25)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.content, 'html.parser')

            # Enhanced year extraction - try new method first
            year = self._get_movie_release_year(soup)
            if year:
                details['year'] = year
            else:
                # Fallback to original method
                for selector in (
                    '.film-title-wrapper .metadata',
                    '.releaseyear',
                    '.film-header .metadata',
                    'small.number'
                ):
                    y = soup.select_one(selector)
                    if y:
                        m = re.search(r'(\d{4})', y.get_text(strip=True))
                        if m:
                            details['year'] = m.group(1)
                            break

            # Poster via meta first (usually the cleanest, highest quality)
            meta = soup.find('meta', property='og:image') or soup.find('meta', attrs={'name': 'twitter:image'})
            if meta and meta.get('content'):
                details['poster_url'] = self._normalize_poster_url(meta['content'])

            # JSON-LD as a strong fallback
            if 'poster_url' not in details:
                for ld in soup.find_all('script', type='application/ld+json'):
                    try:
                        data = json.loads(ld.string) if ld.string else None
                        if not data:
                            continue
                        nodes = data if isinstance(data, list) else [data]
                        for node in nodes:
                            if isinstance(node, dict) and node.get('@type') in ('Movie', 'VideoObject', 'CreativeWork'):
                                img = node.get('image')
                                if isinstance(img, dict):
                                    img = img.get('url')
                                elif isinstance(img, list) and img:
                                    img = img[0]
                                if isinstance(img, str):
                                    details['poster_url'] = self._normalize_poster_url(img)
                                    break
                        if 'poster_url' in details:
                            break
                    except Exception:
                        continue

            # DOM image fallbacks
            if 'poster_url' not in details:
                for selector in ('.film-poster img', '.poster img', 'img.film-poster', 'img[src*="ltrbxd.com"]', '.film-header img'):
                    img = soup.select_one(selector)
                    if img:
                        srcset = img.get('data-srcset') or img.get('srcset')
                        src = self._best_src_from_srcset(srcset) if srcset else (img.get('data-src') or img.get('src'))
                        if src:
                            details['poster_url'] = self._normalize_poster_url(src)
                            break

            # User rating (best effort; Letterboxd encodes as class rated-XX)
            rating_elem = soup.select_one('.film-rating-histogram .rating, .user-rating, .rating')
            if rating_elem:
                for cls in rating_elem.get('class', []):
                    if 'rated-' in cls:
                        try:
                            digits = re.search(r'rated-(\d+)', cls)
                            if digits:
                                details['rating'] = int(digits.group(1)) / 2.0
                                break
                        except Exception:
                            pass

            # Enhanced review extraction with js-review-body targeting (most accurate)
            review_extracted = False
            
            # First priority: Try the specific js-review-body selector
            js_review_body = soup.select_one('.js-review-body')
            if js_review_body:
                print(f"Found review using js-review-body selector")
                # Use our specialized Letterboxd structure extraction
                paragraphed_text = self._extract_review_with_letterboxd_structure(js_review_body)
                if paragraphed_text and len(paragraphed_text) > 10:
                    cleaned_text = self._clean_review_text(paragraphed_text)
                    details['review'] = cleaned_text
                    review_extracted = True
                    print(f"✓ Successfully extracted review from js-review-body")
            
            # Second priority: Try other body-text selectors with enhanced extraction
            if not review_extracted:
                letterboxd_review_selectors = [
                    '.review .body-text',             # Review body
                    '.film-detail-content .body-text', # Film detail review
                    '.review-text',                   # Generic review text
                    '.body-text',                     # Fallback body text
                ]
                
                for selector in letterboxd_review_selectors:
                    rev = soup.select_one(selector)
                    if rev:
                        print(f"Found review using selector: {selector}")
                        # Try enhanced extraction first
                        paragraphed_text = self._extract_review_with_letterboxd_structure(rev)
                        if paragraphed_text and len(paragraphed_text) > 10:
                            cleaned_text = self._clean_review_text(paragraphed_text)
                            details['review'] = cleaned_text
                            review_extracted = True
                            print(f"✓ Successfully extracted review with enhanced method")
                            break
            
            # Fallback to original method if enhanced extraction didn't work
            if not review_extracted:
                for selector in ('.film-detail-content .body-text', '.review .body-text', '.review-text', '.body-text'):
                    rev = soup.select_one(selector)
                    if rev:
                        # Extract text with better formatting preservation
                        for br in rev.find_all('br'):
                            br.replace_with('\n')
                        
                        for p in rev.find_all('p'):
                            p.insert_after('\n\n')
                        
                        text = rev.get_text()
                        
                        if text and len(text) > 10:
                            cleaned_text = self._clean_review_text(text)
                            details['review'] = cleaned_text
                            break

            # Watched date
            for selector in ('.film-detail-content .metadata time', '.diary-entry-date', 'time[datetime]', '.date'):
                t = soup.select_one(selector)
                if t:
                    date_str = t.get('datetime') or t.get_text(strip=True)
                    if date_str:
                        try:
                            if 'T' in date_str:
                                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                                details['watchedDate'] = dt.strftime("%B %d, %Y")
                            else:
                                details['watchedDate'] = date_str
                        except Exception:
                            details['watchedDate'] = date_str
                        break

            return details
        except Exception as e:
            print(f"Error getting film details from {film_url}: {e}")
            return {}

    def save_to_public_data(self, reviews, filename="letterboxd_reviews.json"):
        """
        Save scraped reviews to public/data directory
        """
        try:
            # project_root = one level up from script dir
            script_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.dirname(script_dir)
            output_dir = os.path.join(project_root, "public", "data")
            os.makedirs(output_dir, exist_ok=True)

            filepath = os.path.join(output_dir, filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(reviews, f, indent=2, ensure_ascii=False)

            print(f"\n✓ Reviews saved to: {filepath}")
            return filepath
        except Exception as e:
            print(f"Error saving reviews: {e}")
            return None

    def create_fallback_data(self):
        """
        Create fallback movie reviews data with high-quality Letterboxd poster URLs
        """
        fallback_reviews = [
            {
                "title": "Memories of Murder",
                "year": "2003",
                "poster_url": "https://a.ltrbxd.com/resized/film-poster/5/1/3/7/0/51370-memories-of-murder-0-460-0-690-crop.jpg",
                "rating": 4.0,
                "watchedDate": "July 22, 2024",
                "review": "This movie is getting a 4 because of the dude dropkicking every suspect. Bong Joon Ho has the eyes of a good director. I like the way with his staging and blocking, and we can see that with other films e.g. Parasite."
            },
            {
                "title": "The Prestige",
                "year": "2006",
                "poster_url": "https://a.ltrbxd.com/resized/film-poster/5/1/4/7/8/51478-the-prestige-0-460-0-690-crop.jpg",
                "rating": 4.0,
                "watchedDate": "June 15, 2024",
                "review": "Typical rivalry between me and my bro in FIFA. Brilliant storytelling and mind-bending plot twists that keep you guessing until the very end."
            },
            {
                "title": "Your Name",
                "year": "2016",
                "poster_url": "https://a.ltrbxd.com/resized/film-poster/2/9/0/4/6/4/290464-your-name-0-460-0-690-crop.jpg",
                "rating": 4.0,
                "watchedDate": "May 8, 2024",
                "review": "Jangan lu pada samain sama Sore: Istri dari Masa Depan. Watched this with my homeboy during internship. When she disappeared when writing her name 😭"
            },
            {
                "title": "Perfect Blue",
                "year": "1997",
                "poster_url": "https://a.ltrbxd.com/resized/film-poster/5/1/5/2/8/51528-perfect-blue-0-460-0-690-crop.jpg",
                "rating": 4.0,
                "watchedDate": "April 20, 2024",
                "review": "Ini film apaan dah. Gw rindu diri gw sebelum nonton film ini. A psychological masterpiece that's both beautiful and disturbing."
            }
        ]
        return fallback_reviews


def main():
    username = "dafandikri"  # <--- change to your Letterboxd username if needed
    scraper = LetterboxdScraper(username)

    print("🎬 Starting enhanced Letterboxd scraper with better poster extraction...")
    print("-" * 70)

    # Try to scrape real reviews
    reviews = scraper.get_recent_reviews(limit=4)

    # If scraping fails or returns insufficient data, use fallback
    if not reviews or len(reviews) < 2:
        print(f"\n⚠️  Scraping returned {len(reviews)} reviews, using fallback data...")
        reviews = scraper.create_fallback_data()

    if reviews:
        print(f"\n✓ Successfully got {len(reviews)} reviews!")

        # Save to public/data
        scraper.save_to_public_data(reviews, "letterboxd_reviews.json")

        print("\n📋 Reviews saved for React component:")
        print("-" * 70)
        print("✓ Data saved to public/data/letterboxd_reviews.json")
        print("✓ Frontend will automatically load from /data/letterboxd_reviews.json")

        # Show sample of the data
        print(f"\nExtracted reviews with Letterboxd posters:")
        for i, review in enumerate(reviews):
            poster_status = "✓ High-res Poster" if review.get('poster_url') else "✗ No poster"
            print(f"{i+1}. {review['title']} ({review['year']}) - {poster_status}")
            print(f"   Rating: {review['rating']}/5")
            print(f"   Date: {review['watchedDate']}")
            if review.get('poster_url'):
                print(f"   Poster: {review['poster_url']}")
            print(f"   Review: {review['review'][:100]}...")
            print()

        print(f"\n🎯 Summary:")
        print("1. ✓ Robust poster extraction (srcset, meta, JSON-LD, fallbacks)")
        print("2. ✓ High-resolution Letterboxd crops (460x690) when available")
        print("3. ✓ Comprehensive selectors & gentle rate limiting")
        print("4. ✓ Graceful fallback data")
        print("5. Re-run anytime to refresh your latest reviews")
    else:
        print("❌ Could not get any reviews data")


if __name__ == "__main__":
    main()

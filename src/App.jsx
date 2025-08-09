import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './App.css'
import Navbar from './components/Navbar'
import ProfileCard from './components/ProfileCard'
import TechStackDialog from './components/TechStackDialog'
import SkillsetsDialog from './components/SkillsetsDialog'
import Experience from './components/Experience'
import Project from './components/Project'
import Contact from './components/Contact'
import KnowEachOther from './components/KnowEachOther'
import { getImage } from './assets'

function App() {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload critical images
  useEffect(() => {
    const preloadImages = async () => {
      const criticalImages = [
        getImage("background"),
        getImage("profile"),
        getImage("interbio_project"),
        getImage("portfolio_project")
      ];

      const imagePromises = criticalImages.map((src) => {
        return new Promise((resolve, reject) => {
          if (!src) {
            resolve(); // Skip if image source is undefined
            return;
          }
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if image fails to load
          img.src = src;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.warn('Some images failed to preload:', error);
        setImagesLoaded(true); // Continue anyway
      }
    };

    preloadImages();
  }, []);

  // Force scroll to top on page load/refresh
  useEffect(() => {
    // Only run scroll logic after images are loaded
    if (!imagesLoaded) return;

    // Scroll to top immediately
    window.scrollTo(0, 0);
    
    // Clear any hash from URL without triggering navigation
    if (window.location.hash) {
      // Replace the current history entry to remove the hash
      window.history.replaceState(null, null, window.location.pathname + window.location.search);
    }
    
    // Ensure scroll position stays at top after a short delay (in case of any layout shifts)
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [imagesLoaded]);

  // Show loading screen until images are preloaded
  if (!imagesLoaded) {
    return (
      <div className="windows95-app">
        <div className="loading-screen" style={{
          backgroundImage: `url(${getImage("background")})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Optional: Add a subtle loading indicator */}
          <div style={{
            backgroundColor: 'rgba(192, 192, 192, 0.9)',
            border: '2px solid #000',
            borderRightColor: '#dfdfdf',
            borderBottomColor: '#dfdfdf',
            padding: '20px',
            fontFamily: 'Windows 95, sans-serif',
            fontSize: '14px',
            boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)'
          }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="windows95-app">
      <motion.div 
        className="desktop-background" 
        style={{
          backgroundImage: `url(${getImage("background")})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'fixed'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Navbar />
        <div className="container py-2">
          <div id="profile" className="mb-2">
            <ProfileCard />
          </div>
          
          <div className="mb-2">
            <KnowEachOther />
          </div>
          
          {/* Tech Stack and Skillsets section with animated title */}
          <div id="tech-skills" className="mb-5">
            <motion.h2 
              className="mb-3 text-white" 
              style={{
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
                fontWeight: "bold",
                letterSpacing: "1px",
                fontSize: "1.8rem"
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
            >
              Skills & Technologies
            </motion.h2>
            
            <div className="row">
              <div className="col-lg-5">
                <SkillsetsDialog />
              </div>
              <div className="col-lg-7">
                <TechStackDialog />
              </div>
            </div>
          </div>
          
          <div id="experience" className="mb-5">
            <motion.h2 
              className="mb-3 text-white" 
              style={{
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
                fontWeight: "bold",
                letterSpacing: "1px",
                fontSize: "1.8rem"
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
            >
              Experience
            </motion.h2>
            <div className="row">
              <div className="col-12">
                <Experience />
              </div>
            </div>
          </div>
          
          <div id="projects" className="mb-5">
            <motion.h2 
              className="mb-3 text-white" 
              style={{
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
                fontWeight: "bold",
                letterSpacing: "1px",
                fontSize: "1.8rem"
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
            >
              Projects
            </motion.h2>
            <Project />
          </div>
          
          <div id="contact">
            <motion.h2 
              className="mb-3 text-white" 
              style={{
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
                fontWeight: "bold",
                letterSpacing: "1px",
                fontSize: "1.8rem"
              }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
            >
              Contact Me
            </motion.h2>
            <Contact />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default App

import { useState, useEffect, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import './App.css'
import Navbar from './components/Navbar'
import ProfileCard from './components/ProfileCard'
import KnowEachOther from './components/KnowEachOther'
import { getImage } from './assets'

// Lazy load components that are not immediately visible
const TechStackDialog = lazy(() => import('./components/TechStackDialog'))
const SkillsetsDialog = lazy(() => import('./components/SkillsetsDialog'))
const Experience = lazy(() => import('./components/Experience'))
const Project = lazy(() => import('./components/Project'))
const Hobbies = lazy(() => import('./components/Hobbies'))
const Contact = lazy(() => import('./components/Contact'))

// Loading component for lazy-loaded sections
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
  // Force scroll to top on page load/refresh
  useEffect(() => {
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
  }, []);

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
          <div id="profile" className="mb-2">
            <ProfileCard />
          </div>
          
          <div className="mb-2">
            <KnowEachOther />
          </div>
          
          {/* Tech Stack and Skillsets section with lazy loading */}
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
                <Suspense fallback={<SectionLoader />}>
                  <SkillsetsDialog />
                </Suspense>
              </div>
              <div className="col-lg-7">
                <Suspense fallback={<SectionLoader />}>
                  <TechStackDialog />
                </Suspense>
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
            <Suspense fallback={<SectionLoader />}>
              <Project />
            </Suspense>
          </div>
          
          <div id="hobbies" className="mb-5">
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
              Hobbies
            </motion.h2>
            <Suspense fallback={<SectionLoader />}>
              <Hobbies />
            </Suspense>
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
            <Suspense fallback={<SectionLoader />}>
              <Contact />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

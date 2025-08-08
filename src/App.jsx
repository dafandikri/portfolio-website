import { useState } from 'react'
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
          
          {/* Tech Stack and Skillsets section with title */}
          <motion.div 
            id="tech-skills" 
            className="mb-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut",
              delay: 0.9
            }}
          >
            {/* Enhanced title with shadow for better contrast */}
            <h2 className="mb-3 text-white" style={{
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
              fontWeight: "bold",
              letterSpacing: "1px",
              fontSize: "1.8rem"
            }}>
              Skills & Technologies
            </h2>
            
            <div className="row">
              <div className="col-lg-5">
                <SkillsetsDialog />
              </div>
              <div className="col-lg-7">
                <TechStackDialog />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            id="experience" 
            className="mb-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut",
              delay: 1.2
            }}
          >
            {/* Enhanced title with shadow for better contrast */}
            <h2 className="mb-3 text-white" style={{
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
              fontWeight: "bold",
              letterSpacing: "1px",
              fontSize: "1.8rem"
            }}>
              Experience
            </h2>
            <div className="row">
              <div className="col-12">
                <Experience />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            id="projects" 
            className="mb-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut",
              delay: 1.5
            }}
          >
            {/* Added Projects title with consistent styling */}
            <h2 className="mb-3 text-white" style={{
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
              fontWeight: "bold",
              letterSpacing: "1px",
              fontSize: "1.8rem"
            }}>
              Projects
            </h2>
            <Project />
          </motion.div>
          
          <motion.div 
            id="contact"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut",
              delay: 1.8
            }}
          >
            {/* Added Contact Me title with consistent styling and small spacing */}
            <h2 className="mb-3 text-white" style={{
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
              fontWeight: "bold",
              letterSpacing: "1px",
              fontSize: "1.8rem"
            }}>
              Contact Me
            </h2>
            <Contact />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default App

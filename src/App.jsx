import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import ProfileCard from './components/ProfileCard'
import TechStackDialog from './components/TechStackDialog'
import SkillsetsDialog from './components/SkillsetsDialog'
import Experience from './components/Experience'
import Project from './components/Project'
import Contact from './components/Contact'
import KnowEachOther from './components/KnowEachOther'

function App() {
  return (
    <div className="windows95-app">
      <div className="desktop-background">
        <Navbar />
        <div className="container py-4">
          <div id="profile">
            <ProfileCard />
          </div>
          <KnowEachOther />
          
          {/* Tech Stack and Skillsets side by side layout */}
          <div id="tech-skills" className="section-sm">
            <div className="row">
              <div className="col-lg-5">
                <SkillsetsDialog />
              </div>
              <div className="col-lg-7">
                <TechStackDialog />
              </div>
            </div>
          </div>
          
          <div id="experience" className="mt-4">
            <Experience />
          </div>
          
          <div id="projects" className="mt-4">
            <Project />
          </div>
          
          <div id="contact" className="mt-4">
            <Contact />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import ProfileCard from './components/ProfileCard'
import TechStackDialog from './components/TechStackDialog'
import SkillsetsDialog from './components/SkillsetsDialog'
import Experience from './components/Experience'
import Project from './components/Project'
import Contact from './components/Contact'

function App() {
  return (
    <div>
      <Navbar />
      <ProfileCard />
      
      {/* Tech Stack and Skillsets side by side layout */}
      <div id="tech-skills" className="section-sm">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <SkillsetsDialog />
            </div>
            <div className="col-lg-7">
              <TechStackDialog />
            </div>
          </div>
        </div>
      </div>
      
      <Experience />
      <Project />
      <Contact />
    </div>
  )
}

export default App

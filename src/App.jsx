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
      <TechStackDialog />
      <SkillsetsDialog />
      <Experience />
      <Project />
      <Contact />
    </div>
  )
}

export default App

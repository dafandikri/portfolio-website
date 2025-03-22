import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import ProfileCard from './components/ProfileCard'
import TechStackDialog from './components/TechStackDialog'
import SkillsetsDialog from './components/SkillsetsDialog'
import Experience from './components/Experience'
import Project from './components/Project'

function App() {
  return (
    <div>
      <Navbar />
      <ProfileCard />
      <TechStackDialog />
      <SkillsetsDialog />
      <Experience />
      <Project />
    </div>
  )
}

export default App

import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import ProfileCard from './components/ProfileCard'
import TechStackDialog from './components/TechStackDialog'
import SkillsetsDialog from './components/SkillsetsDialog'
import Experience from './components/Experience'

function App() {
  return (
    <div>
      <Navbar />
      <ProfileCard />
      <TechStackDialog />
      <SkillsetsDialog />
      <Experience />
    </div>
  )
}

export default App

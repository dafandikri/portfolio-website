import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import ProfileCard from './components/ProfileCard'
import TechStackDialog from './components/TechStackDialog'

function App() {
  return (
    <div>
      <Navbar />
      <ProfileCard />
      <TechStackDialog />
    </div>
  )
}

export default App

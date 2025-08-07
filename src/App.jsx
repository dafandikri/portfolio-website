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
        <div className="container py-2"> {/* Reduced padding from py-4 to py-2 */}
          <div id="profile" className="mb-2"> {/* Added margin-bottom to reduce space after profile */}
            <ProfileCard />
          </div>
          
          <div className="mb-2"> {/* Added margin-bottom to reduce space after KnowEachOther */}
            <KnowEachOther />
          </div>
          
          {/* Tech Stack and Skillsets section with title */}
          <div id="tech-skills" className="mb-5"> {/* Changed from mb-4 to mb-5 for even more space */}
            {/* Enhanced title with shadow for better contrast */}
            <h2 className="mb-3 text-white" style={{ /* Reduced from mb-4 to mb-3 */
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
              fontWeight: "bold",
              letterSpacing: "1px",
              fontSize: "1.8rem" /* Slightly smaller font size */
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
          </div>
          
          <div id="experience" className="mb-3"> {/* Changed from mt-4 to mb-3 */}
            {/* Enhanced title with shadow for better contrast */}
            <h2 className="mb-3 text-white" style={{ /* Reduced from mb-4 to mb-3 */
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
              fontWeight: "bold",
              letterSpacing: "1px",
              fontSize: "1.8rem" /* Slightly smaller font size */
            }}>
              Experience
            </h2>
            <div className="row">
              <div className="col-12">
                <Experience />
              </div>
            </div>
          </div>
          
          <div id="projects" className="mb-3"> {/* Changed from mt-4 to mb-3 */}
            <Project />
          </div>
          
          <div id="contact"> {/* Removed mt-4 as it's the last element */}
            <Contact />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

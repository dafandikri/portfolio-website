import { useState, useEffect } from 'react';
import '../styles/w95.css';

// Helper function to import project images
const importProjectImage = (imageName) => {
  return `/src/assets/img/${imageName}.png`;
};

// Helper function to import tech stack icons
const importTechIcon = (iconName) => {
  return `/src/assets/img/favicon/${iconName}.png`;
};

const Project = () => {
    // Project data could be expanded to an array for multiple projects
    const projects = [
        {
            title: "Portfolio Website",
            description: "Personal portfolio website, showcasing skills, experiences, and projects. Contents are to be updated regularly. Future update will showcase achievements section, certifications section, and some other cool stuff.",
            image: "portfolioweb",
            features: [
                "Responsive design with Bootstrap framework",
                "Windows 95 aesthetic with modern functionality",
                "Interactive elements using JavaScript",
                "Showcases projects, skills, and experience"
            ],
            techStack: ["html", "css", "javascript", "bootstrap"],
            liveLink: "#",
            repoLink: "#"
        }
    ];

    return (
        <div className="row">
            {/* First Project */}
            <div className="col-lg-6 mb-4">
                <div className="card card-tertiary h-100 overflow-hidden">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <span>Portfolio Website</span>
                        <div>
                            <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>━</button>
                            <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>☐</button>
                            <button className="btn btn-sm" style={{width: "16px", height: "16px", fontSize: "8px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>&#10006;</button>
                        </div>
                    </div>
                    <div className="card-body p-0">
                        <div className="row g-0">
                            {/* Left Panel with Project Screenshot */}
                            <div className="col-md-5" style={{backgroundColor: "#7fb4b4", overflow: "hidden"}}>
                                <div className="p-3 h-100 d-flex flex-column justify-content-between">
                                    <div>
                                        {/* Project Screenshot with Windows 95 border */}
                                        <div style={{border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", backgroundColor: "#FFFFFF", padding: "3px", marginBottom: "10px"}}>
                                            <img src={importProjectImage("portfolioweb")} className="img-fluid" alt="Portfolio Website Screenshot" />
                                        </div>
                                        
                                        {/* Tech Stack Icons */}
                                        <div className="d-flex flex-wrap mt-2">
                                            {projects[0].techStack.map((tech, index) => (
                                                <div 
                                                    key={index}
                                                    className="mr-2 mb-2" 
                                                    style={{border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "2px", backgroundColor: "#C0C0C0", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center"}}
                                                >
                                                    <img 
                                                        src={importTechIcon(tech)} 
                                                        alt={tech} 
                                                        width="20" 
                                                        height="20" 
                                                        style={{imageRendering: "pixelated"}} 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Panel with Project Info */}
                            <div className="col-md-7 bg-white">
                                <div className="p-3">
                                    <h5 className="mb-2">{projects[0].title}</h5>
                                    <p className="small">{projects[0].description}</p>
                                    
                                    <ul className="small pl-3 mb-3">
                                        {projects[0].features.map((feature, index) => (
                                            <li key={index}>{feature}</li>
                                        ))}
                                    </ul>
                                    
                                    <div className="d-flex mt-auto">
                                        <a href={projects[0].liveLink} className="btn btn-sm mr-2 btn-primary border-dark" target="_blank" rel="noopener noreferrer">
                                            <span className="btn-text">View Website</span>
                                        </a>
                                        <a href={projects[0].repoLink} className="btn btn-sm btn-primary" target="_blank" rel="noopener noreferrer">
                                            <span className="btn-text">GitHub Repo</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Project;
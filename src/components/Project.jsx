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
    // Expanded project data with multiple projects
    const projects = [
        {
            title: "Portfolio Website",
            description: "Personal portfolio website, showcasing skills, experiences, and projects. Contents are to be updated regularly. Future update will showcase achievements section, certifications section, and some other cool stuff.",
            image: "interbio_project",
            features: [
                "Responsive design with Bootstrap framework",
                "Windows 95 aesthetic with modern functionality",
                "Interactive elements using JavaScript",
                "Showcases projects, skills, and experience"
            ],
            techStack: ["javascript", "react"],
            liveLink: "#",
            repoLink: "#"
        },
        {
            title: "Bikun Tracker Bot",
            description: "A comprehensive bus tracking system with real-time notifications and web interface. Features automated tracking, location updates, and user notifications for bus arrival times.",
            image: "portfolioweb", // Using same image for now
            features: [
                "Real-time bus location tracking",
                "Automated notification system",
                "Web interface with interactive maps",
                "Flask backend with Python automation"
            ],
            techStack: ["python", "javascript", "html", "css"],
            liveLink: "#",
            repoLink: "#"
        },
        {
            title: "Kementrans Bot",
            description: "Data extraction and processing bot for government transportation data. Automates data collection, processing, and CSV export functionality with scheduled operations.",
            image: "portfolioweb", // Using same image for now
            features: [
                "Automated data extraction from PDFs",
                "CSV export functionality",
                "Scheduled data processing",
                "Google Sheets integration"
            ],
            techStack: ["python", "csv", "github", "javascript"],
            liveLink: "#",
            repoLink: "#"
        },
        {
            title: "SCELE Bot",
            description: "Educational platform automation bot for course management and student interaction. Streamlines administrative tasks and improves learning experience.",
            image: "portfolioweb", // Using same image for now
            features: [
                "Course management automation",
                "Student interaction handling",
                "Assignment tracking",
                "Notification system"
            ],
            techStack: ["python", "bootstrap", "html", "css"],
            liveLink: "#",
            repoLink: "#"
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const projectsPerPage = 2;

    // Calculate total pages
    const totalPages = Math.ceil(projects.length / projectsPerPage);

    // Get current projects to display
    const getCurrentProjects = () => {
        const start = currentIndex * projectsPerPage;
        const end = start + projectsPerPage;
        return projects.slice(start, end);
    };

    // Navigation handlers
    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % totalPages);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
    };

    return (
        <div>
            {/* Navigation Controls */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button 
                    className="btn btn-sm btn-primary" 
                    onClick={goToPrevious}
                    disabled={totalPages <= 1}
                >
                    <span className="btn-text">← Previous</span>
                </button>
                
                <span style={{fontSize: "0.9rem", color: "#000"}}>
                    Page {currentIndex + 1} of {totalPages}
                </span>
                
                <button 
                    className="btn btn-sm btn-primary" 
                    onClick={goToNext}
                    disabled={totalPages <= 1}
                >
                    <span className="btn-text">Next →</span>
                </button>
            </div>

            {/* Projects Display */}
            <div className="row">
                {getCurrentProjects().map((project, index) => (
                    <div key={currentIndex * projectsPerPage + index} className="col-lg-6 mb-4">
                        <div className="card card-tertiary h-100 overflow-hidden">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <span>{project.title}</span>
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
                                                    <img src={importProjectImage(project.image)} className="img-fluid" alt={`${project.title} Screenshot`} />
                                                </div>
                                                
                                                {/* Tech Stack Icons */}
                                                <div className="d-flex flex-wrap mt-2">
                                                    {project.techStack.map((tech, techIndex) => (
                                                        <div 
                                                            key={techIndex}
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
                                            <h5 className="mb-2">{project.title}</h5>
                                            <p className="small">{project.description}</p>
                                            
                                            <ul className="small pl-3 mb-3">
                                                {project.features.map((feature, featureIndex) => (
                                                    <li key={featureIndex}>{feature}</li>
                                                ))}
                                            </ul>
                                            
                                            <div className="d-flex mt-auto">
                                                <a href={project.liveLink} className="btn btn-sm mr-2 btn-primary border-dark" target="_blank" rel="noopener noreferrer">
                                                    <span className="btn-text">View Website</span>
                                                </a>
                                                <a href={project.repoLink} className="btn btn-sm btn-primary" target="_blank" rel="noopener noreferrer">
                                                    <span className="btn-text">GitHub Repo</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Project;
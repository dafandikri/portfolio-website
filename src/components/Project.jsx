import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/w95.css';
import { getImage, getIcon } from '../assets';

const Project = () => {
    // Updated project data based on CV
    const projects = [
        {
            title: "Portfolio Website",
            year: "2025",
            description: "A nostalgic Windows 95-themed portfolio website built with React and Vite. Features smooth animations, responsive design, and retro UI elements that showcase my projects, skills, and experience in an engaging, interactive format with modern web technologies.",
            image: "portfolio_project",
            features: [
                "Windows 95-inspired UI with authentic retro styling and animations",
                "Responsive design with mobile hamburger menu and scroll-triggered animations",
                "Framer Motion integration for smooth cascading entrance effects",
                "SEO optimized with meta tags, robots.txt, and social media previews"
            ],
            techStack: ["react", "javascript", "vsc", "github"],
            liveLink: "https://dafandikri.tech",
            repoLink: "https://github.com/dafandikri/portfolio-website"
        },
        {
            title: "Interbio.id Website",
            year: "2024",
            description: "Complete redesign and relaunch of interbio.id on WordPress for PT International Biometrics Indonesia. Modernized UI, streamlined navigation, and implemented enterprise-grade security standards while creating a modular CMS workflow for non-technical staff.",
            image: "interbio_project",
            features: [
                "Full website redesign and relaunch on WordPress platform",
                "Modern UI with streamlined navigation for enhanced user engagement",
                "ISO 27001 compliance with SSL/TLS security implementation",
                "Modular CMS workflow training for non-technical staff (2x PR efficiency increase)"
            ],
            techStack: ["wordpress", "figma", "github"],
            liveLink: "https://interbio.id",
            repoLink: "#"
        },
        {
            title: "JagaRaga",
            year: "2025",
            description: "A comprehensive health and wellness application designed through an end-to-end HCI cycle. Focused on translating complex health needs of office workers and students into an intuitive digital solution through extensive user research and data-driven design.",
            image: "", // No image
            features: [
                "End-to-end HCI cycle implementation with Value Proposition Canvas",
                "25+ qualitative insights consolidated into actionable design requirements",
                "High-fidelity Figma prototype with iterative usability testing",
                "System Usability Scale improved to 68.67 (Good rating)"
            ],
            techStack: ["figma", "react", "javascript"],
            liveLink: "#",
            repoLink: "#"
        },
        {
            title: "Solemates",
            year: "2025",
            description: "A secure Django-based e-commerce website for shoe retail built as part of Security-Driven Software Development course. Implemented OWASP Top 10 principles and secure coding practices, successfully passing independent penetration testing.",
            image: "", // No image
            features: [
                "Django-based e-commerce platform with security focus",
                "OWASP Top 10 security principles implementation",
                "Kubernetes deployment to Fakultas Ilmu Komputer UI server",
                "Secure DevOps practices with SSH configuration and infrastructure hardening"
            ],
            techStack: ["python", "django", "docker", "github"],
            liveLink: "#",
            repoLink: "#"
        },
        {
            title: "GeoBikunAlert",
            year: "2024",
            description: "An intelligent notification bot that revolutionizes campus transportation. Automatically tracks Bikun bus locations, converts data to GPS coordinates, and sends proximity alerts via Apple's API, improving commuting efficiency for 3000+ students and professors by 200%.",
            image: "", // No image
            features: [
                "Real-time bus location scraping from bikun.ui.ac.id",
                "GPS coordinate conversion and proximity detection (100m radius)",
                "Apple API integration for seamless notifications",
                "200% improvement in commuting efficiency for 3000+ users"
            ],
            techStack: ["python", "javascript", "github"],
            liveLink: "#",
            repoLink: "#"
        },
        {
            title: "DepeFood",
            year: "2024",
            description: "A comprehensive food ordering platform built with JavaFX, featuring dual interfaces for administrators and customers. Streamlined restaurant management for admins while providing seamless ordering experience for customers.",
            image: "", // No image
            features: [
                "JavaFX-based food ordering system",
                "Dual interface design for admins and customers",
                "Restaurant management and order processing features",
                "25% improvement in user satisfaction ratings"
            ],
            techStack: ["java", "github"],
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
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
        >
            {/* Navigation Controls */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button 
                    className="btn btn-sm btn-primary" 
                    onClick={goToPrevious}
                    disabled={totalPages <= 1}
                >
                    <span className="btn-text">← Previous</span>
                </button>
                
                <span style={{
                    fontSize: "0.9rem", 
                    color: "white",
                    textShadow: "2px 2px 8px rgba(0, 0, 0, 0.8)",
                    fontWeight: "bold"
                }}>
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
                        <motion.div 
                            className="card card-tertiary h-100 overflow-hidden"
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ 
                                duration: 0.5, 
                                ease: "easeOut",
                                delay: index * 0.1
                            }}
                            viewport={{ once: true, margin: "-50px" }}
                        >
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <span>{project.title} ({project.year})</span>
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
                                                    {project.image ? (
                                                        <img src={getImage(project.image)} className="img-fluid" alt={`${project.title} Screenshot`} />
                                                    ) : (
                                                        <div style={{
                                                            display: "flex", 
                                                            flexDirection: "column", 
                                                            alignItems: "center", 
                                                            justifyContent: "center", 
                                                            height: "120px", 
                                                            backgroundColor: "#f5f5f5",
                                                            color: "#666",
                                                            fontSize: "14px",
                                                            fontFamily: "'Windows 95', 'MS Sans Serif', monospace"
                                                        }}>
                                                            <div style={{fontSize: "30px", marginBottom: "8px"}}>☹️</div>
                                                            <div style={{fontWeight: "bold", fontSize: "16px"}}>Coming Soon</div>
                                                            <div style={{fontSize: "12px", marginTop: "4px"}}>Screenshot in progress</div>
                                                        </div>
                                                    )}
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
                                                                src={getIcon(tech)} 
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
                                                    <span className="btn-text">View Project</span>
                                                </a>
                                                <a href={project.repoLink} className="btn btn-sm btn-primary" target="_blank" rel="noopener noreferrer">
                                                    <span className="btn-text">GitHub Repo</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default Project;
import { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/w95.css';
import { getImage, getIcon } from '../assets';
import { projects } from '../data';

const Project = () => {
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
                                        <div className="h-100 d-flex flex-column">
                                            <div style={{flex: 1, display: "flex", flexDirection: "column"}}>
                                                {/* Project Screenshot - NO WHITESPACE AT ALL */}
                                                <div style={{flex: 1, position: "relative"}}>
                                                    {project.image ? (
                                                        <div style={{position: "relative", width: "100%", height: "100%"}}>
                                                            <img
                                                                src={getImage(project.image)}
                                                                alt={`${project.title} Screenshot`}
                                                                width="280"
                                                                height="180"
                                                                loading="lazy"
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "contain",
                                                                    display: "block"
                                                                }}
                                                            />
                                                            <div style={{
                                                                position: "absolute",
                                                                top: "50%",
                                                                left: "50%",
                                                                transform: "translate(-50%, -50%)",
                                                                background: "rgba(0,0,0,0.7)",
                                                                color: "white",
                                                                padding: "4px 8px",
                                                                borderRadius: "3px",
                                                                fontSize: "10px",
                                                                opacity: 0,
                                                                transition: "opacity 0.3s",
                                                                pointerEvents: "none"
                                                            }}
                                                            className="hover-overlay"
                                                            >
                                                                Click to enlarge
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            height: "100%",
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
                                                <div className="p-2">
                                                    <div className="d-flex flex-wrap">
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

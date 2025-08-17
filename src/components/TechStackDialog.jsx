import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '../styles/w95.css';
import { getIcon } from '../assets';

const TechStackDialog = () => {
    const [container1Width, setContainer1Width] = useState(0);
    const [container2Width, setContainer2Width] = useState(0);
    const scrollContainerRef = useRef(null);
    const techIconsRef1 = useRef(null);
    const techIconsRef2 = useRef(null);
    
    // Split tech stack into two arrays for the two sliders
    const techStackRow1 = [
        { name: "JavaScript", icon: "javascript" },
        { name: "Dart", icon: "dart" },
        { name: "Discord", icon: "discord" },
        { name: "Django", icon: "django" },
        { name: "Docker", icon: "docker" },
        { name: "Figma", icon: "figma" },
        { name: "Flutter", icon: "flutter" },
        { name: "Gemini", icon: "gemini" },
        { name: "GitHub", icon: "github" },
        { name: "GPT", icon: "gpt" },
    ];
    
    const techStackRow2 = [
        { name: "IntelliJ", icon: "ij" },
        { name: "Java", icon: "java" },
        { name: "Python", icon: "python" },
        { name: "React", icon: "react" },
        { name: "Selenium", icon: "selenium" },
        { name: "Spring Boot", icon: "springboot" },
        { name: "Tailwind", icon: "tailwind" },
        { name: "Ubuntu", icon: "ubuntu" },
        { name: "VS Code", icon: "vsc" },
        { name: "WordPress", icon: "wordpress" },
    ];
    
    // Measure the width of both icon containers for the animations
    useEffect(() => {
        if (techIconsRef1.current) {
            const width1 = techIconsRef1.current.offsetWidth;
            setContainer1Width(width1);
        }
        if (techIconsRef2.current) {
            const width2 = techIconsRef2.current.offsetWidth;
            setContainer2Width(width2);
        }
    }, []);
    
    const renderTechIcons = (techStack) => {
        return techStack.map((tech, index) => (
            <div key={index} className="tech-icon mx-3" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <div style={{width: "48px", height: "48px", border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0"}}>
                    <img 
                        src={getIcon(tech.icon)} 
                        alt={tech.name} 
                        style={{width: "36px", height: "36px", imageRendering: "pixelated"}} 
                    />
                </div>
                <span style={{fontSize: "10px", marginTop: "4px"}}>{tech.name}</span>
            </div>
        ));
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
        >
            {/* Tech Stack Dialog */}
            <div className="card card-tertiary h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span>Tech Stack and Tools</span>
                    <div>
                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: "1", backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: "0"}}>━</button>
                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: "1", backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: "0"}}>☐</button>
                        <button className="btn btn-sm" style={{width: "16px", height: "16px", fontSize: "8px", lineHeight: "1", backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: "0"}}>✖</button>
                    </div>
                </div>
                <div className="card-body d-flex flex-column">
                    <div className="mb-3">
                        <strong>My Tech Stack and Tools:</strong>
                    </div>
                    {/* Icon scrolling container */}
                    <div 
                        ref={scrollContainerRef}
                        className="tech-stack-container flex-grow-1" 
                        style={{
                            position: "relative", 
                            overflow: "hidden", 
                            height: "160px",
                            border: "1px solid #888", 
                            borderRightColor: "#FFF", 
                            borderBottomColor: "#FFF", 
                            backgroundColor: "#FFF", 
                            padding: "4px 0", // Consistent padding
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-around" // Distribute space evenly
                        }}
                    >
                        {/* First row - left to right */}
                        <div 
                            className="tech-icons-wrapper"
                            style={{
                                display: "flex", 
                                width: "max-content", 
                                animation: container1Width ? `scrollTechRight ${techStackRow1.length * 2}s linear infinite` : 'none'
                            }}
                        >
                            {/* First set of icons */}
                            <div ref={techIconsRef1} className="tech-icons" style={{display: "flex"}}>
                                {renderTechIcons(techStackRow1)}
                            </div>
                            
                            {/* Duplicate set for seamless loop */}
                            <div className="tech-icons" style={{display: "flex"}}>
                                {renderTechIcons(techStackRow1)}
                            </div>
                        </div>
                        
                        {/* Second row - right to left */}
                        <div 
                            className="tech-icons-wrapper"
                            style={{
                                display: "flex", 
                                width: "max-content", 
                                animation: container2Width ? `scrollTechLeft ${techStackRow2.length * 2}s linear infinite` : 'none'
                            }}
                        >
                            {/* First set of icons */}
                            <div ref={techIconsRef2} className="tech-icons" style={{display: "flex"}}>
                                {renderTechIcons(techStackRow2)}
                            </div>
                            
                            {/* Duplicate set for seamless loop */}
                            <div className="tech-icons" style={{display: "flex"}}>
                                {renderTechIcons(techStackRow2)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="d-flex justify-content-end mt-4">
                        <button className="btn btn-sm mr-2 btn-primary border-dark" type="button">
                            <span className="btn-text">Nice!</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* End of Tech Stack Dialog */}
            
            {/* CSS for animations */}
            <style jsx>{`
                @keyframes scrollTechLeft {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-${container2Width}px); }
                }
                
                @keyframes scrollTechRight {
                    0% { transform: translateX(-${container1Width}px); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </motion.div>
    );
};

export default TechStackDialog;
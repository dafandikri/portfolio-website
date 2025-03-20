import { useState, useEffect, useRef } from 'react';
import '../styles/w95.css';

// Import tech stack icons
const importIcon = (iconName) => {
  return `/src/assets/img/favicon/${iconName}.png`;
};

const TechStackDialog = () => {
    const [containerWidth, setContainerWidth] = useState(0);
    const scrollContainerRef = useRef(null);
    const techIconsRef = useRef(null);
    
    const techStack = [
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
        { name: "IntelliJ", icon: "ij" },
        { name: "Java", icon: "java" },
        { name: "Python", icon: "python" },
        { name: "React", icon: "react" },
        { name: "Selenium", icon: "selenium" },
        { name: "Spring Boot", icon: "springboot" },
        { name: "Tailwind", icon: "tailwind" },
        { name: "Ubuntu", icon: "ubuntu" },
        { name: "VS Code", icon: "vsc" },
    ];
    
    // Measure the width of the icons container for the animation
    useEffect(() => {
        if (techIconsRef.current) {
            const width = techIconsRef.current.offsetWidth;
            setContainerWidth(width);
        }
    }, []);
    
    const renderTechIcons = () => {
        return techStack.map((tech, index) => (
            <div key={index} className="tech-icon mx-3" style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <div style={{width: "48px", height: "48px", border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0"}}>
                    <img 
                        src={importIcon(tech.icon)} 
                        alt={tech.name} 
                        style={{width: "36px", height: "36px", imageRendering: "pixelated"}} 
                    />
                </div>
                <span style={{fontSize: "10px", marginTop: "4px"}}>{tech.name}</span>
            </div>
        ));
    };
    
    return (
        <section className="section-sm">
                        <div className="my-5">
                            {/* Tech Stack Dialog */}
                            <div className="card card-tertiary">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <span>Tech Stack and Tools</span>
                                    <div>
                                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: "1", backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: "0"}}>━</button>
                                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: "1", backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: "0"}}>☐</button>
                                        <button className="btn btn-sm" style={{width: "16px", height: "16px", fontSize: "8px", lineHeight: "1", backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: "0"}}>✖</button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="mb-3">
                                        <strong>Tech Stack and Tools:</strong>
                                    </div>
                                    {/* Icon scrolling container */}
                                    <div 
                                        ref={scrollContainerRef}
                                        className="tech-stack-container" 
                                        style={{
                                            position: "relative", 
                                            overflow: "hidden", 
                                            height: "80px", 
                                            border: "1px solid #888", 
                                            borderRightColor: "#FFF", 
                                            borderBottomColor: "#FFF", 
                                            backgroundColor: "#FFF", 
                                            padding: "8px 0"
                                        }}
                                    >
                                        <div 
                                            className="tech-icons-wrapper"
                                            style={{
                                                display: "flex", 
                                                width: "max-content", 
                                                animation: containerWidth ? `scrollTech ${techStack.length * 2}s linear infinite` : 'none'
                                            }}
                                        >
                                            {/* First set of icons */}
                                            <div ref={techIconsRef} className="tech-icons" style={{display: "flex"}}>
                                                {renderTechIcons()}
                                            </div>
                                            
                                            {/* Second set of icons (duplicate for seamless loop) */}
                                            <div className="tech-icons" style={{display: "flex"}}>
                                                {renderTechIcons()}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex justify-content-end mt-4">
                                        <button className="btn btn-sm mr-2 btn-primary border-dark" type="button">
                                            <span className="btn-text">View All</span>
                                        </button>
                                        <button className="btn btn-sm btn-primary" type="button">
                                            <span className="btn-text">OK</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* End of Tech Stack Dialog */}
                        </div>
            
            {/* CSS for animation */}
            <style jsx>{`
                @keyframes scrollTech {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-${containerWidth}px); }
                }
            `}</style>
        </section>
    );
};

export default TechStackDialog;
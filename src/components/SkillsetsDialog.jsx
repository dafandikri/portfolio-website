import { useState, useEffect, useRef } from 'react';
import '../styles/w95.css';

// Import skills icons
const importSkillIcon = (iconName) => {
    return `/src/assets/img/skills/${iconName}.png`;
};

const SkillsetsDialog = () => {
    const [containerWidth, setContainerWidth] = useState(0);
    const scrollContainerRef = useRef(null);
    const skillsContainerRef = useRef(null);
    
    // Define skills data
    const skills = [
        { name: "Frontend Development", icon: "frontend", skills: "HTML, CSS, JavaScript, React, WordPress" },
        { name: "Backend Development", icon: "backend", skills: "Node.js, Python, Java, APIs" },
        { name: "Database Management", icon: "database", skills: "SQL, MongoDB, Redis, ORM" },
        { name: "Mobile Development", icon: "mobile", skills: "Flutter, React Native" },
        { name: "UI/UX Design", icon: "design", skills: "Figma, Adobe XD, Wireframing" },
        { name: "DevOps", icon: "devops", skills: "CI/CD, Docker, Git, AWS" },
        { name: "Project Management", icon: "management", skills: "Agile, Scrum, JIRA, Leadership" },
        { name: "AI & Machine Learning", icon: "ai", skills: "TensorFlow, PyTorch, NLP" },
    ];
    
    // Measure the width of the skills container for the animation
    useEffect(() => {
        if (skillsContainerRef.current) {
            const width = skillsContainerRef.current.offsetWidth;
            setContainerWidth(width);
        }
    }, []);

    // Function to render skill cards
    const renderSkillCard = (skill, index) => (
        <div 
            key={`${skill.name}-${index}`}
            className="tech-icon mx-4" 
            style={{
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                width: "180px",
                backgroundColor: "#C0C0C0",
                border: "2px solid #FFF",
                borderRightColor: "#000",
                borderBottomColor: "#000",
                padding: "8px",
                margin: "0 10px"
            }}
        >
            <div style={{width: "64px", height: "64px", marginBottom: "8px"}}>
                <img 
                    src={importSkillIcon(skill.icon)} 
                    alt={skill.name} 
                    style={{width: "64px", height: "64px", imageRendering: "pixelated"}} 
                />
            </div>
            <span style={{fontSize: "12px", textAlign: "center", fontWeight: "bold"}}>{skill.name}</span>
            <span style={{fontSize: "10px", textAlign: "center"}}>{skill.skills}</span>
        </div>
    );

    return (
        <section className="section-sm">
            {/* Skillsets Dialog */}
            <div className="card card-tertiary">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span>Professional Skillsets</span>
                    <div>
                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>━</button>
                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>☐</button>
                        <button className="btn btn-sm" style={{width: "16px", height: "16px", fontSize: "8px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>&#10006;</button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <strong>My Professional Skills:</strong>
                    </div>
                    {/* Skill categories scrolling container */}
                    <div 
                        ref={scrollContainerRef}
                        className="tech-stack-container" 
                        style={{
                            position: "relative", 
                            overflow: "hidden", 
                            height: "170px", 
                            border: "1px solid #888", 
                            borderRightColor: "#FFF", 
                            borderBottomColor: "#FFF", 
                            backgroundColor: "#FFF", 
                            padding: "8px 0"
                        }}
                    >
                        <div 
                            className="skills-wrapper"
                            style={{
                                display: "flex", 
                                width: "max-content", 
                                animation: containerWidth ? `scrollSkills ${skills.length * 5}s linear infinite` : 'none'
                            }}
                        >
                            {/* First set of skills */}
                            <div ref={skillsContainerRef} className="skills-set" style={{display: "flex"}}>
                                {skills.map((skill, index) => renderSkillCard(skill, index))}
                            </div>
                            
                            {/* Second set of skills (duplicate for seamless loop) */}
                            <div className="skills-set" style={{display: "flex"}}>
                                {skills.map((skill, index) => renderSkillCard(skill, index + skills.length))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="d-flex justify-content-end mt-4">
                        <button className="btn btn-sm mr-2 btn-primary border-dark" type="button">
                            <span className="btn-text">View Details</span>
                        </button>
                        <button className="btn btn-sm btn-primary" type="button">
                            <span className="btn-text">OK</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* End of Skillsets Dialog */}
                
            {/* CSS for animation */}
            <style jsx>{`
                @keyframes scrollSkills {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-${containerWidth}px); }
                }
            `}</style>
        </section>
    );
};

export default SkillsetsDialog;
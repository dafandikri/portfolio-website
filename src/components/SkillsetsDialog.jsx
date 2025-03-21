import { useState, useEffect } from 'react';
import '../styles/w95.css';

const SkillsetsDialog = () => {
  return (
    <section className="section-sm">
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                    <div className="my-5">
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
                                <div className="tech-stack-container" style={{position: "relative", overflow: "hidden", height: "120px", border: "1px solid #888", borderRightColor: "#FFF", borderBottomColor: "#FFF", backgroundColor: "#FFF", padding: "8px 0"}}>
                                    <div className="tech-stack-scroll" style={{display: "flex", position: "absolute", animation: "scroll-tech 40s linear infinite"}}>
                                        {/* Skill categories - first set */}
                                        <div className="tech-icon mx-4" style={{display: "flex", flexDirection: "column", alignItems: "center", width: "180px"}}>
                                            <div style={{width: "64px", height: "64px", border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0", marginBottom: "8px"}}>
                                                <img src="../img/skills/frontend.png" alt="Frontend Development" style={{width: "52px", height: "52px", imageRendering: "pixelated"}} />
                                            </div>
                                            <span style={{fontSize: "12px", textAlign: "center", fontWeight: "bold"}}>Frontend Development</span>
                                            <span style={{fontSize: "10px", textAlign: "center"}}>HTML, CSS, JavaScript, React</span>
                                        </div>
                                        <div className="tech-icon mx-4" style={{display: "flex", flexDirection: "column", alignItems: "center", width: "180px"}}>
                                            <div style={{width: "64px", height: "64px", border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0", marginBottom: "8px"}}>
                                                <img src="../img/skills/backend.png" alt="Backend Development" style={{width: "52px", height: "52px", imageRendering: "pixelated"}} />
                                            </div>
                                            <span style={{fontSize: "12px", textAlign: "center", fontWeight: "bold"}}>Backend Development</span>
                                            <span style={{fontSize: "10px", textAlign: "center"}}>Node.js, Python, Java, APIs</span>
                                        </div>
                                        <div className="tech-icon mx-4" style={{display: "flex", flexDirection: "column", alignItems: "center", width: "180px"}}>
                                            <div style={{width: "64px", height: "64px", border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0", marginBottom: "8px"}}>
                                                <img src="../img/skills/database.png" alt="Database Management" style={{width: "52px", height: "52px", imageRendering: "pixelated"}} />
                                            </div>
                                            <span style={{fontSize: "12px", textAlign: "center", fontWeight: "bold"}}>Database Management</span>
                                            <span style={{fontSize: "10px", textAlign: "center"}}>SQL, MongoDB, Redis, ORM</span>
                                        </div>
                                        <div className="tech-icon mx-4" style={{display: "flex", flexDirection: "column", alignItems: "center", width: "180px"}}>
                                            <div style={{width: "64px", height: "64px", border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0", marginBottom: "8px"}}>
                                                <img src="../img/skills/mobile.png" alt="Mobile Development" style={{width: "52px", height: "52px", imageRendering: "pixelated"}} />
                                            </div>
                                            <span style={{fontSize: "12px", textAlign: "center", fontWeight: "bold"}}>Mobile Development</span>
                                            <span style={{fontSize: "10px", textAlign: "center"}}>Flutter, React Native</span>
                                        </div>
                                        <div className="tech-icon mx-4" style={{display: "flex", flexDirection: "column", alignItems: "center", width: "180px"}}>
                                            <div style={{width: "64px", height: "64px", border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0", marginBottom: "8px"}}>
                                                <img src="../img/skills/design.png" alt="UI/UX Design" style={{width: "52px", height: "52px", imageRendering: "pixelated"}} />
                                            </div>
                                            <span style={{fontSize: "12px", textAlign: "center", fontWeight: "bold"}}>UI/UX Design</span>
                                            <span style={{fontSize: "10px", textAlign: "center"}}>Figma, Adobe XD, Wireframing</span>
                                        </div>
                                        <div className="tech-icon mx-4" style={{display: "flex", flexDirection: "column", alignItems: "center", width: "180px"}}>
                                            <div style={{width: "64px", height: "64px", border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0", marginBottom: "8px"}}>
                                                <img src="../img/skills/devops.png" alt="DevOps" style={{width: "52px", height: "52px", imageRendering: "pixelated"}} />
                                            </div>
                                            <span style={{fontSize: "12px", textAlign: "center", fontWeight: "bold"}}>DevOps</span>
                                            <span style={{fontSize: "10px", textAlign: "center"}}>CI/CD, Docker, Git, AWS</span>
                                        </div>
                                        <div className="tech-icon mx-4" style={{display: "flex", flexDirection: "column", alignItems: "center", width: "180px"}}>
                                            <div style={{width: "64px", height: "64px", border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0", marginBottom: "8px"}}>
                                                <img src="../img/skills/management.png" alt="Project Management" style={{width: "52px", height: "52px", imageRendering: "pixelated"}} />
                                            </div>
                                            <span style={{fontSize: "12px", textAlign: "center", fontWeight: "bold"}}>Project Management</span>
                                            <span style={{fontSize: "10px", textAlign: "center"}}>Agile, Scrum, JIRA, Leadership</span>
                                        </div>
                                        <div className="tech-icon mx-4" style={{display: "flex", flexDirection: "column", alignItems: "center", width: "180px"}}>
                                            <div style={{width: "64px", height: "64px", border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0", marginBottom: "8px"}}>
                                                <img src="../img/skills/ai.png" alt="AI/ML" style={{width: "52px", height: "52px", imageRendering: "pixelated"}} />
                                            </div>
                                            <span style={{fontSize: "12px", textAlign: "center", fontWeight: "bold"}}>AI & Machine Learning</span>
                                            <span style={{fontSize: "10px", textAlign: "center"}}>TensorFlow, PyTorch, NLP</span>
                                        </div>
                                        
                                        {/* Duplicate first few skills for seamless looping */}
                                        <div className="tech-icon mx-4" style={{display: "flex", flexDirection: "column", alignItems: "center", width: "180px"}}>
                                            <div style={{width: "64px", height: "64px", border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0", marginBottom: "8px"}}>
                                                <img src="../img/skills/frontend.png" alt="Frontend Development" style={{width: "52px", height: "52px", imageRendering: "pixelated"}} />
                                            </div>
                                            <span style={{fontSize: "12px", textAlign: "center", fontWeight: "bold"}}>Frontend Development</span>
                                            <span style={{fontSize: "10px", textAlign: "center"}}>HTML, CSS, JavaScript, React</span>
                                        </div>
                                        <div className="tech-icon mx-4" style={{display: "flex", flexDirection: "column", alignItems: "center", width: "180px"}}>
                                            <div style={{width: "64px", height: "64px", border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0", marginBottom: "8px"}}>
                                                <img src="../img/skills/backend.png" alt="Backend Development" style={{width: "52px", height: "52px", imageRendering: "pixelated"}} />
                                            </div>
                                            <span style={{fontSize: "12px", textAlign: "center", fontWeight: "bold"}}>Backend Development</span>
                                            <span style={{fontSize: "10px", textAlign: "center"}}>Node.js, Python, Java, APIs</span>
                                        </div>
                                        <div className="tech-icon mx-4" style={{display: "flex", flexDirection: "column", alignItems: "center", width: "180px"}}>
                                            <div style={{width: "64px", height: "64px", border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0", marginBottom: "8px"}}>
                                                <img src="../img/skills/database.png" alt="Database Management" style={{width: "52px", height: "52px", imageRendering: "pixelated"}} />
                                            </div>
                                            <span style={{fontSize: "12px", textAlign: "center", fontWeight: "bold"}}>Database Management</span>
                                            <span style={{fontSize: "10px", textAlign: "center"}}>SQL, MongoDB, Redis, ORM</span>
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
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
};

export default SkillsetsDialog;
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/w95.css';
import { getIcon } from '../assets';

const Experience = () => {
    // Experience data by year - Updated with real CV experience
    const experienceData = {
        "2025": {
            title: "Intern - Kementerian Transmigrasi Republik Indonesia",
            date: "July 2025 - August 2025",
            description: "Researched national regulations on Electronic-Based Government Systems (SPBE) including Presidential Regulation No. 95/2018 and Ministry of Administrative Reform guidelines to assess their impact on digital services at the Ministry of Transmigration.",
            achievements: [
                "Automated certificate design process using programming skills, increasing output efficiency by 4x",
                "Eliminated the need for manual formatting through automation",
                "Assisted Strategic Planning Training Team with participant registration and session flow",
                "Supported more than 20 employees in training activities"
            ],
            logo: "kementrans"
        },
        "2024": {
            title: "IT Developer Intern - PT International Biometrics Indonesia",
            date: "June 2024 - August 2024",
            description: "Redesigned and relaunched interbio.id on WordPress, modernizing UI and streamlining navigation to elevate user engagement and brand credibility.",
            achievements: [
                "Passed ISO 27001 standards test implementing SSL/TLS best practices",
                "Passed independent penetration test with 0 critical vulnerabilities",
                "Configured modular CMS workflow and trained communications team",
                "Empowered non-technical staff to publish content, resulting in 2x increase in PR efforts"
            ],
            logo: "interbio"
        },
        "2023": {
            title: "Mentee at RISTEK OpenClass Data Science - RISTEK Fasilkom UI",
            date: "2023",
            description: "Deepened understanding of Data Management for its applications in AI and Machine Learning Development, taught by an industry expert Data Scientist at Tiket.com.",
            achievements: [
                "Gained comprehensive knowledge in data management principles",
                "Learned AI and Machine Learning development applications",
                "Received mentorship from industry expert at Tiket.com",
                "Enhanced technical skills in data science methodologies"
            ],
            logo: "ristek"
        }
    };

    // State to track the currently selected year
    const [selectedYear, setSelectedYear] = useState("2024");
    const [showDialog, setShowDialog] = useState(true);
    
    // Handler for year button clicks
    const handleYearClick = (year) => {
        setSelectedYear(year);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
        >
            {/* Welcome Dialog */}
            <div className="card card-tertiary mx-auto">
                {/* Dialog Title Bar */}
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span>Experience</span>
                    <div>
                        <button className="btn btn-sm" style={{width: "16px", height: "16px", fontSize: "8px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>&#10006;</button>
                    </div>
                </div>
                <div className="card-body">
                    {/* Main Dialog Content */}
                    <h5 className="text-center mb-4">Welcome to My Experience</h5>
                    
                    <div className="row">
                        <div className="col-12">
                            {/* Year Buttons - Horizontal layout above description */}
                            <div className="d-flex justify-content-center mb-3">
                                {Object.keys(experienceData).sort((a, b) => b - a).map(year => (
                                    <button 
                                        key={year}
                                        className={`btn btn-primary mx-1 ${selectedYear === year ? 'active' : ''}`}
                                        type="button"
                                        onClick={() => handleYearClick(year)}
                                        style={{width: "55px", fontSize: "0.8rem", padding: "4px 2px"}}
                                    >
                                        <span className="btn-text">{year}</span>
                                    </button>
                                ))}
                            </div>
                            
                            {/* Tip Box with Yellow Background - Now full width */}
                            <div id="experienceContent" className="p-3 mb-3" style={{backgroundColor: "#FFFFE1", border: "1px solid #888", borderRightColor: "#FFF", borderBottomColor: "#FFF"}}>
                                <div className="d-flex">
                                    <div className="mr-3">
                                        {/* Company Logo Icon that changes based on selected year - Made bigger like skillsets */}
                                        <div style={{width: "64px", height: "64px", backgroundColor: "#FFFFE1", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #888", borderRightColor: "#FFF", borderBottomColor: "#FFF"}}>
                                            <img 
                                                src={getIcon(experienceData[selectedYear].logo)} 
                                                alt="Company Logo" 
                                                style={{width: "48px", height: "48px", imageRendering: "pixelated"}} 
                                            />
                                        </div>
                                    </div>
                                    <div style={{flex: 1}}>
                                        <p className="mb-2"><strong style={{color: "#000080", fontSize: "1.1rem"}}>{experienceData[selectedYear].title}</strong></p>
                                        <p className="mb-2" style={{fontSize: "0.9rem", lineHeight: "1.4", color: "#555"}}>{experienceData[selectedYear].date}</p>
                                        <p className="mb-3" style={{fontSize: "1rem", lineHeight: "1.4"}}>{experienceData[selectedYear].description}</p>
                                        
                                        {/* Key Achievements */}
                                        <div>
                                            <p className="mb-2" style={{fontSize: "0.95rem", fontWeight: "bold", color: "#000080"}}>Key Achievements:</p>
                                            <ul className="mb-0" style={{fontSize: "0.9rem", lineHeight: "1.3", paddingLeft: "20px"}}>
                                                {experienceData[selectedYear].achievements.map((achievement, index) => (
                                                    <li key={index} className="mb-1">{achievement}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="form-check mb-2">
                                <label className="form-check-label">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        checked={showDialog}
                                        onChange={() => setShowDialog(!showDialog)}
                                    />
                                    <span className="form-check-x"></span>
                                    <span className="form-check-sign"></span>
                                    Show this dialog at startup
                                </label>
                            </div>
                            
                            {/* Close Button */}
                            <div className="d-flex justify-content-end mt-3">
                                <button className="btn btn-sm btn-primary border-dark" type="button">
                                    <span className="btn-text">Close</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* End of Welcome Dialog */}
        </motion.div>
    );
};

export default Experience;
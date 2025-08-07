import { useState, useEffect } from 'react';
import '../styles/w95.css';
import { getIcon } from '../assets';

const Experience = () => {
    // Experience data by year
    const experienceData = {
        "2025": {
            title: "Intern - Kementerian Transmigrasi Republik Indonesia",
            date: "July 2025 - August 2025",
            description: "Successfully developed and updated the company's official website using WordPress, achieving significant improvements in functionality and user experience.",
            logo: "kementrans"
        },
        "2024": {
            title: "IT Developer Intern - PT International Biometrics Indonesia",
            date: "June 2024 - August 2024",
            description: "Successfully developed and updated the company's official website using WordPress, achieving significant improvements in functionality and user experience.",
            logo: "interbio"
        },
        "2023": {
            title: "Java Developer - CodeCrafters Inc.",
            date: "March 2023 - November 2023",
            description: "Developed enterprise Java applications utilizing Spring Boot, implementing RESTful APIs and microservices architecture.",
            logo: "java"
        },
        "2022": {
            title: "Frontend Developer - Web Solutions Ltd",
            date: "August 2022 - February 2023",
            description: "Built responsive web applications using React.js, collaborating with design and backend teams to deliver seamless user experiences.",
            logo: "react"
        },
        "2021": {
            title: "Software Engineering Intern - Tech Innovators",
            date: "May 2021 - July 2022",
            description: "Contributed to open-source projects and gained practical experience in version control and collaborative development.",
            logo: "github"
        },
        "2020": {
            title: "Web Development Assistant - Digital Creators",
            date: "September 2020 - April 2021",
            description: "Assisted in developing interactive web applications with JavaScript and jQuery, focusing on client-side functionality.",
            logo: "javascript"
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
        <div>
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
                                        <p className="mb-1" style={{fontSize: "0.9rem", lineHeight: "1.4", color: "#555"}}>{experienceData[selectedYear].date}</p>
                                        <p className="mb-0" style={{fontSize: "1rem", lineHeight: "1.4"}}>{experienceData[selectedYear].description}</p>
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
        </div>
    );
};

export default Experience;
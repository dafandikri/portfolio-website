import { useState, useEffect } from 'react';
import '../styles/w95.css';

// Import company logos helper
const importCompanyLogo = (iconName) => {
    return `/src/assets/img/favicon/${iconName}.png`;
};

const Experience = () => {
    // Experience data by year
    const experienceData = {
        "2024": {
            title: "IT Developer Intern - PT International Biometrics Indonesia",
            description: "Successfully developed and updated the company's official website using WordPress, achieving significant improvements in functionality and user experience.",
            logo: "wordpress"
        },
        "2023": {
            title: "Java Developer - CodeCrafters Inc.",
            description: "Developed enterprise Java applications utilizing Spring Boot, implementing RESTful APIs and microservices architecture.",
            logo: "java"
        },
        "2022": {
            title: "Frontend Developer - Web Solutions Ltd",
            description: "Built responsive web applications using React.js, collaborating with design and backend teams to deliver seamless user experiences.",
            logo: "react"
        },
        "2021": {
            title: "Software Engineering Intern - Tech Innovators",
            description: "Contributed to open-source projects and gained practical experience in version control and collaborative development.",
            logo: "github"
        },
        "2020": {
            title: "Web Development Assistant - Digital Creators",
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
        <section className="section-sm">
            {/* Welcome Dialog */}
            <div className="card card-tertiary mx-auto" style={{maxWidth: "550px"}}>
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
                        <div className="col-9">
                            {/* Tip Box with Yellow Background */}
                            <div id="experienceContent" className="p-3 mb-3" style={{backgroundColor: "#FFFFE1", border: "1px solid #888", borderRightColor: "#FFF", borderBottomColor: "#FFF"}}>
                                <div className="d-flex">
                                    <div className="mr-3">
                                        {/* Company Logo Icon that changes based on selected year */}
                                        <div style={{width: "32px", height: "32px", backgroundColor: "#FFFFE1", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #888", borderRightColor: "#FFF", borderBottomColor: "#FFF"}}>
                                            <img 
                                                src={importCompanyLogo(experienceData[selectedYear].logo)} 
                                                alt="Company Logo" 
                                                style={{width: "24px", height: "24px", imageRendering: "pixelated"}} 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="mb-1"><strong style={{color: "#000080"}}>{experienceData[selectedYear].title}</strong></p>
                                        <p className="mb-0">{experienceData[selectedYear].description}</p>
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
                        </div>
                        <div className="col-3 d-flex flex-column">
                            {/* Year Buttons */}
                            {Object.keys(experienceData).map(year => (
                                <button 
                                    key={year}
                                    className={`btn btn-primary mb-2 ${selectedYear === year ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => handleYearClick(year)}
                                >
                                    <span className="btn-text">{year}</span>
                                </button>
                            ))}
                            <div className="mt-auto">
                                <button className="btn btn-primary border-dark" type="button">
                                    <span className="btn-text">Close</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* End of Welcome Dialog */}
        </section>
    );
};

export default Experience;
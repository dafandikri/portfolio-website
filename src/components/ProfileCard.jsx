import { useState, useEffect } from 'react';
import '../styles/w95.css';
import { getImage } from '../assets';

const ProfileCard = () => {
    return (
        <div className="col-12 mb-4">
            <div className="card card-tertiary">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <span>Profile Card</span>
                    <div>
                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>━</button>
                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>☐</button>
                        <button className="btn btn-sm" style={{width: "16px", height: "16px", fontSize: "8px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>&#10006;</button>
                    </div>
                </div>
                <div className="card-body" style={{position: "relative", paddingBottom: "70px"}}>
                    <div className="d-flex flex-row align-items-center">
                        {/* Larger square image with Windows 95 border style */}
                        <div className="mr-4" style={{border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "6px", backgroundColor: "#C0C0C0"}}>
                            {/* Use the proper asset import */}
                            <img src={getImage("profile")} alt="Profile Picture" style={{width: "200px", height: "200px", display: "block", objectFit: "cover"}} />
                        </div>
                        <div style={{padding: "15px"}}>
                            <h2 className="mb-3" style={{fontSize: "28px", fontWeight: "bold"}}>Erdafa Andikri</h2>
                            <p className="card-text" style={{fontSize: "18px", lineHeight: "1.5"}}>
                                An excellent Software Architect,
                                a versatile Full-Stack Engineer,
                                and to the core, a problem solver,
                                crafting innovative IT solutions
                                from the lively city of Jakarta,
                                Indonesia.
                            </p>
                        </div>
                    </div>
                    
                    {/* Buttons positioned at bottom right - fixed sizing */}
                    <div style={{
                        position: "absolute", 
                        bottom: "20px", 
                        right: "20px",
                    }}>
                        <button 
                            className="btn btn-primary border-dark" 
                            type="button" 
                            style={{
                                fontSize: "14px", 
                                padding: "6px 16px", 
                                height: "auto",
                                minHeight: "32px",
                                lineHeight: "normal"
                            }}
                        >
                            <span className="btn-text">Very Cool!</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;

import { useState, useEffect } from 'react';
import '../styles/w95.css';
import profileImage from '/src/assets/img/profile.jpg'; // Import profile image

const ProfileCard = () => {
    return (
        <div className="col-12 col-lg-6 mb-4 mb-lg-0">
            <div className="card card-tertiary">
                <div className="card-header">
                    <span>Profile Card</span>
                </div>
                <div className="card-body">
                    <div className="d-flex flex-row align-items-start">
                        {/* Square image with Windows 95 border style */}
                        <div className="mr-3" style={{border: "2px solid #000", borderRightColor: "#DFDFDF", borderBottomColor: "#DFDFDF", padding: "4px", backgroundColor: "#C0C0C0"}}>
                            {/* Use the imported image */}
                            <img src={profileImage} alt="Profile Picture" style={{width: "150px", height: "150px", display: "block", objectFit: "cover"}} />
                        </div>
                        <div>
                            <h5 className="mb-2">Erdafa Andikri</h5>
                            <p className="card-text">
                                An excellent Software Architect,
                                a versatile Full-Stack Engineer,
                                and to the core, a problem solver,
                                crafting innovative IT solutions
                                from the lively city of Jakarta,
                                Indonesia.
                            </p>
                        </div>
                    </div>
                    <div className="d-flex mt-3 justify-content-end">
                        <button className="btn btn-sm mr-2 btn-primary" type="button">
                            <span className="btn-text">Contact</span>
                        </button>
                        <button className="btn btn-sm btn-primary border-dark" type="button">
                            <span className="btn-text">View Profile</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;

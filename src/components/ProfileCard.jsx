import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/w95.css';
import { getImage } from '../assets';

const ProfileCard = () => {
    const [showSparks, setShowSparks] = useState(false);

    const handleCoolButtonClick = () => {
        setShowSparks(true);
        setTimeout(() => setShowSparks(false), 1000); // Reset after animation
    };

    // Shake animation variant - EXACTLY same as navbar buttons
    const buttonVariants = {
        hover: {
            x: [0, -8, 8, -8, 8, 0, -4, 4, 0],
            y: [0, -4, 4, -4, 4, 0, -4, 4, 0],
            transition: {
                duration: 0.6,
                ease: "easeInOut"
            }
        },
        tap: {
            scale: 0.95
        }
    };

    // Sparks animation variants
    const sparkVariants = {
        initial: { 
            opacity: 0, 
            scale: 0, 
            x: 0, 
            y: 0,
            rotate: 0
        },
        animate: { 
            opacity: [0, 1, 1, 0], 
            scale: [0, 1.2, 1, 0],
            x: Math.random() * 60 - 30,
            y: Math.random() * 60 - 30,
            rotate: Math.random() * 360,
            transition: {
                duration: 1,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="col-12 mb-4">
            <motion.div 
                className="card card-tertiary"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                    duration: 0.3, 
                    ease: "easeOut",
                    delay: 0.3
                }}
            >
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
                            <img src={getImage("profile")} alt="Erdafa Andikri's profile photo" style={{width: "200px", height: "200px", display: "block", objectFit: "cover"}} />
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
                        <motion.button 
                            className="btn btn-primary border-dark" 
                            type="button" 
                            style={{
                                fontSize: "14px", 
                                padding: "6px 16px", 
                                height: "auto",
                                minHeight: "32px",
                                lineHeight: "normal",
                                position: "relative"
                            }}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={handleCoolButtonClick}
                        >
                            <span className="btn-text">Very Cool!</span>
                            
                            {/* Sparks Animation */}
                            {showSparks && (
                                <div style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    pointerEvents: "none",
                                    zIndex: 1000
                                }}>
                                    {[...Array(8)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial="initial"
                                            animate="animate"
                                            variants={sparkVariants}
                                            style={{
                                                position: "absolute",
                                                width: "8px",
                                                height: "8px",
                                                backgroundColor: ["#FFD700", "#FFA500", "#FF6347", "#00BFFF", "#32CD32"][i % 5],
                                                borderRadius: "50%",
                                                boxShadow: `0 0 6px ${["#FFD700", "#FFA500", "#FF6347", "#00BFFF", "#32CD32"][i % 5]}`,
                                            }}
                                        />
                                    ))}
                                    
                                    {/* Star-shaped sparks */}
                                    {[...Array(4)].map((_, i) => (
                                        <motion.div
                                            key={`star-${i}`}
                                            initial="initial"
                                            animate="animate"
                                            variants={{
                                                ...sparkVariants,
                                                animate: {
                                                    ...sparkVariants.animate,
                                                    x: Math.random() * 80 - 40,
                                                    y: Math.random() * 80 - 40,
                                                }
                                            }}
                                            style={{
                                                position: "absolute",
                                                fontSize: "12px",
                                                color: "#FFD700",
                                                textShadow: "0 0 6px #FFD700",
                                            }}
                                        >
                                            ✨
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfileCard;

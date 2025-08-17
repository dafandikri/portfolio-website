import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/w95.css';
import { getImage, getIcon } from '../assets';

const Contact = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
        >
            {/* MSN-inspired Contact Dialog - removed section wrapper and reduced margin */}
            <div className="card card-tertiary" style={{marginBottom: "0px"}}>
                {/* Dialog Title Bar */}
                <div className="card-header d-flex justify-content-between align-items-center" style={{backgroundColor: "#000080", color: "white", overflow: "hidden"}}>
                    <span>Contact Me</span>
                    <div>
                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>━</button>
                        <button className="btn btn-sm mr-1" style={{width: "16px", height: "16px", fontSize: "12px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>☐</button>
                        <button className="btn btn-sm" style={{width: "16px", height: "16px", fontSize: "8px", lineHeight: 1, backgroundColor: "#C0C0C0", border: "2px solid #FFF", borderRightColor: "#000", borderBottomColor: "#000", padding: 0}}>&#10006;</button>
                    </div>
                </div>
                
                <div className="card-body p-0">
                    <div className="row g-0">
                        {/* Left Side - Profile Image (MSN Globe Replacement) */}
                        <div className="col-md-4 bg-white position-relative">
                            <div className="p-3 text-center" style={{minHeight: "280px"}}>
                                {/* Profile image */}
                                <div style={{marginTop: "30px", marginBottom: "20px", position: "relative", display: "inline-block"}}>
                                    <div style={{border: "1px solid #888", borderRightColor: "#fff", borderBottomColor: "#fff", backgroundColor: "#fff", padding: "8px", display: "inline-block"}}>
                                        <img 
                                            src={getImage("profile")} 
                                            alt="Erdafa Andikri" 
                                            width="140" 
                                            height="140" 
                                            loading="lazy"
                                            style={{width: "140px", height: "140px", objectFit: "cover"}} 
                                        />
                                    </div>
                                    
                                    {/* Small floating icons like the original MSN screen */}
                                    <div style={{position: "absolute", top: "15px", right: "-20px", background: "white", border: "1px solid #aaa", padding: "3px", borderRadius: "2px"}}>
                                        <img 
                                            src="/profile.png" 
                                            alt="portfolio icon" 
                                            width="24" 
                                            height="24" 
                                            loading="lazy"
                                            style={{borderRadius: "2px", objectFit: "cover"}} 
                                        />
                                    </div>
                                    <div style={{position: "absolute", bottom: "30px", left: "-15px", background: "white", border: "1px solid #aaa", padding: "3px", borderRadius: "2px"}}>
                                        <img 
                                            src={getIcon("code")} 
                                            alt="code icon" 
                                            width="24" 
                                            height="24" 
                                            loading="lazy"
                                            style={{imageRendering: "pixelated"}} 
                                        />
                                    </div>
                                </div>
                                
                                {/* Name/Brand (where "msn" would be) */}
                                <div style={{position: "absolute", bottom: "30px", left: 0, right: 0}}>
                                    <div style={{fontWeight: "bold", fontSize: "24px"}}>Erdafa</div>
                                    <div style={{fontSize: "12px", color: "#555"}}>Software Engineer & Problem Solver</div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Side - Contact Form (Sign-In Replacement) */}
                        <div className="col-md-8" style={{backgroundColor: "#C0C0C0", boxSizing: "border-box"}}>
                            <div className="p-4" style={{overflow: "hidden"}}>
                                {/* Call to action (replacing "Sign in") */}
                                <div style={{border: "1px solid #888", borderBottom: "none", backgroundColor: "#C0C0C0", padding: "4px 10px", overflow: "hidden"}}>
                                    <h5 style={{marginBottom: 0}}>Don't hesitate to contact me!</h5>
                                </div>
                                
                                {/* Contact Info Box */}
                                <div style={{border: "2px solid #000", borderLeftColor: "#DFDFDF", borderTopColor: "#DFDFDF", backgroundColor: "white", padding: "15px", marginBottom: "15px", overflow: "hidden"}}>
                                    <p className="mb-3">I'm always up for new projects, work opportunities, and collaborations.</p>
                                    <p className="mb-2">Feel free to reach out for collab purposes or just a friendly hello! You can find me at:</p>
                                    
                                    <div className="row">
                                        <div className="col-md-6">
                                            {/* Primary contact methods with icons */}
                                            <div className="d-flex align-items-center mb-2" style={{border: "1px solid #888", background: "#eee", padding: "6px 10px"}}>
                                                <div className="d-flex align-items-center" style={{width: "90px", minWidth: "90px"}}>
                                                    <img src={getIcon("gmail")} alt="Email" width="16" height="16" style={{marginRight: "5px"}} />
                                                    <strong style={{fontSize: "12px"}}>Email:</strong>
                                                </div>
                                                <a href="mailto:dafandikri@gmail.com" className="text-primary" style={{fontSize: "12px", wordBreak: "break-word", marginLeft: "8px"}}>dafandikri@gmail.com</a>
                                            </div>
                                            
                                            <div className="d-flex align-items-center mb-2" style={{border: "1px solid #888", background: "#eee", padding: "6px 10px"}}>
                                                <div className="d-flex align-items-center" style={{width: "90px", minWidth: "90px"}}>
                                                    <img src={getIcon("linkedin")} alt="LinkedIn" width="16" height="16" style={{marginRight: "5px"}} />
                                                    <strong style={{fontSize: "12px"}}>LinkedIn:</strong>
                                                </div>
                                                <a href="https://linkedin.com/in/dafandikri" className="text-primary" style={{fontSize: "12px", marginLeft: "8px"}}>linkedin.com/in/dafandikri</a>
                                            </div>
                                        </div>
                                        
                                        <div className="col-md-6">
                                            {/* Secondary contact methods with icons - made more prominent */}
                                            <div className="d-flex align-items-center mb-2" style={{border: "1px solid #888", background: "#f5f5f5", padding: "6px 12px"}}>
                                                <div className="d-flex align-items-center" style={{width: "100px", minWidth: "100px"}}>
                                                    <img src={getIcon("github")} alt="GitHub" width="16" height="16" style={{marginRight: "6px", imageRendering: "pixelated"}} />
                                                    <strong style={{fontSize: "12px"}}>GitHub:</strong>
                                                </div>
                                                <a href="https://github.com/dafandikri" className="text-primary" style={{fontSize: "12px", marginLeft: "10px"}}>github.com/dafandikri</a>
                                            </div>
                                            
                                            <div className="d-flex align-items-center" style={{border: "1px solid #888", background: "#f5f5f5", padding: "6px 12px"}}>
                                                <div className="d-flex align-items-center" style={{width: "100px", minWidth: "100px"}}>
                                                    <img src={getIcon("instagram")} alt="Instagram" width="16" height="16" style={{marginRight: "6px", imageRendering: "pixelated"}} />
                                                    <strong style={{fontSize: "12px"}}>Instagram:</strong>
                                                </div>
                                                <a href="https://instagram.com/dafandikri" className="text-primary" style={{fontSize: "12px", marginLeft: "10px"}}>@dafandikri</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Checkbox (nostalgic element) */}
                                <div className="form-check mb-4">
                                    <label className="form-check-label">
                                        <input className="form-check-input" type="checkbox" />
                                        <span className="form-check-x"></span>
                                        <span className="form-check-sign"></span>
                                        Subscribe to my occasional updates
                                    </label>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="d-flex justify-content-end">
                                    <a href="mailto:dafandikri@gmail.com" className="btn btn-sm mr-2 btn-primary border-dark">
                                        <span className="btn-text">Send Email</span>
                                    </a>
                                    <a href="https://linkedin.com/in/dafandikri" className="btn btn-sm mr-2 btn-primary">
                                        <span className="btn-text">Connect</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* End of MSN-inspired Contact Dialog */}
        </motion.div>
    );
};

export default Contact;

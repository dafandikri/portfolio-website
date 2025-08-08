import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/w95.css';
import { getIcon } from '../assets';

const Navbar = () => {
    const [time, setTime] = useState('');
    
    // Navigation items with their respective icons and target sections
    const navItems = [
        { name: "Profile", icon: "user", target: "#profile" },
        { name: "Tech Stack & Skills", icon: "code", target: "#tech-skills" },
        { name: "Experience", icon: "briefcase", target: "#experience" },
        { name: "Projects", icon: "folder", target: "#projects" },
        { name: "Contact", icon: "envelope", target: "#contact" }
    ];
    
    useEffect(() => {
        // Format time in AM/PM format
        const formatAMPM = (date) => {
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0'+minutes : minutes;
            return hours + ':' + minutes + ' ' + ampm;
        };
        
        // Update time immediately
        setTime(formatAMPM(new Date()));
        
        // Update time every minute
        const intervalId = setInterval(() => {
            setTime(formatAMPM(new Date()));
        }, 60000);
        
        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    const iconStyle = {
        width: "20px", 
        height: "20px", 
        imageRendering: "pixelated"
    };

    // Animation variants for buttons
    const buttonVariants = {
        hover: {
            x: [0, -2, 2, -2, 2, 0, -1, 1, 0],
            y: [0, -1, 1, -1, 1, 0, -1, 1, 0],
            transition: {
                duration: 0.6,
                ease: "easeInOut"
            }
        },
        tap: {
            scale: 0.95
        }
    };

    return (
        <motion.div 
            className="navbar-wrapper" 
            style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: "15px",
                position: "sticky",
                top: 0,
                zIndex: 1000
            }}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
                duration: 0.3, 
                ease: "easeOut",
                delay: 0
            }}
        >
            <div style={{
                width: "85%",
                maxWidth: "1000px",
                backgroundColor: "#C0C0C0",
                border: "2px solid #FFFFFF",
                borderRight: "2px solid #000000",
                borderBottom: "2px solid #000000",
                boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)"
            }}>
                {/* Dialog Content */}
                <nav className="d-flex justify-content-between align-items-center p-2">
                    {/* Time display on left */}
                    <div style={{
                        border: "2px solid #808080",
                        borderRight: "2px solid #FFFFFF",
                        borderBottom: "2px solid #FFFFFF",
                        backgroundColor: "#C0C0C0",
                        padding: "2px 8px",
                        fontSize: "12px"
                    }}>
                        <span className="text-uppercase">{time}</span>
                    </div>
                    
                    {/* Center navigation links with icons */}
                    <ul className="navbar-nav d-flex flex-row m-0">
                        {navItems.map((item, index) => (
                            <li key={index} className="nav-item mx-2">
                                <motion.a 
                                    href={item.target} 
                                    title={item.name}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        backgroundColor: "#C0C0C0",
                                        border: "2px solid #FFFFFF",
                                        borderRight: "2px solid #000000",
                                        borderBottom: "2px solid #000000",
                                        padding: "4px 8px",
                                        color: "#000000",
                                        textDecoration: "none",
                                        fontSize: "10px"
                                    }}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <img 
                                        src={getIcon(item.icon)} 
                                        alt={item.name} 
                                        style={iconStyle} 
                                    />
                                    <span className="mt-1">{item.name}</span>
                                </motion.a>
                            </li>
                        ))}
                    </ul>
                    
                    {/* LinkedIn link on right */}
                    <motion.a 
                        href="https://www.linkedin.com/in/dafandikri" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="Visit my LinkedIn profile"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            backgroundColor: "#C0C0C0",
                            border: "2px solid #FFFFFF",
                            borderRight: "2px solid #000000",
                            borderBottom: "2px solid #000000",
                            padding: "4px 8px",
                            color: "#000000",
                            textDecoration: "none",
                            fontSize: "10px"
                        }}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        <img 
                            src={getIcon("linkedin")} 
                            alt="LinkedIn" 
                            style={iconStyle} 
                        />
                        <span className="mt-1">LinkedIn</span>
                    </motion.a>
                </nav>
            </div>
        </motion.div>
    );
};

export default Navbar;

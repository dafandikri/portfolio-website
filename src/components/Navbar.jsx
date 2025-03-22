import { useState, useEffect } from 'react';
import '../styles/w95.css';

// Helper function to import icons
const importIcon = (iconName) => {
  return `/src/assets/img/favicon/${iconName}.png`;
};

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
        width: "24px", 
        height: "24px", 
        imageRendering: "pixelated"
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark justify-content-between mb-3">
            {/* Time display on left */}
            <div className="time text-center">
                <span className="text-uppercase">{time}</span>
            </div>
            
            {/* Center navigation links with icons */}
            <ul className="navbar-nav mx-auto d-flex flex-row">
                {navItems.map((item, index) => (
                    <li key={index} className="nav-item mx-2">
                        <a href={item.target} className="nav-link" title={item.name}>
                            <img 
                                src={importIcon(item.icon)} 
                                alt={item.name} 
                                style={iconStyle} 
                            />
                        </a>
                    </li>
                ))}
            </ul>
            
            {/* LinkedIn link on right */}
            <div>
                <a 
                    href="https://www.linkedin.com/in/erdafa-andikri-496b341b0" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="nav-link"
                    title="Visit my LinkedIn profile"
                >
                    <img 
                        src={importIcon("linkedin")} 
                        alt="LinkedIn" 
                        style={iconStyle} 
                    />
                </a>
            </div>
        </nav>
    );
};

export default Navbar;

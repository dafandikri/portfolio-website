import { useState, useEffect } from 'react';
import '../styles/w95.css';

const Navbar = () => {
    const [time, setTime] = useState('');
    
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

    return (
        <nav className="navbar navbar-expand-lg navbar-dark justify-content-between mb-3">
            <ul className="navbar-nav navbar-nav-hover flex-row align-items-center">
                <li className="nav-item">
                    <a href="../index.html" className="nav-link" role="button">
                        <span className="nav-link-inner-text">📺 Start</span>
                    </a>
                </li>
                <li className="nav-item">
                    <a href="../docs/introduction.html" className="nav-link"
                        role="button">
                        <span
                            className="nav-link-inner-text">📕 Documentation</span>
                    </a>
                </li>
            </ul>
            <div className="time text-center">
                <span className="text-uppercase">{time}</span>
            </div>
        </nav>
    )
};

export default Navbar;

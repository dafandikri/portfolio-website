import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '../styles/w95.css';
import { getIcon } from '../assets';
import { experiences } from '../data';

const Experience = () => {
    // Flattened entries list for selection lookup
    const allEntries = Object.values(experiences).flatMap((y) => y.entries);

    // State to track the currently selected entry (defaults to the first entry of 2024)
    const defaultEntry = experiences['2024']?.entries[0];
    const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>(
        defaultEntry ? defaultEntry.id : allEntries[0]?.id,
    );
    const [showDialog, setShowDialog] = useState(true);
    const [hoveredYear, setHoveredYear] = useState<string | null>(null);
    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Handler for year button clicks: select the first entry of that year
    const handleYearClick = (year: string) => {
        const first = experiences[year]?.entries[0];
        if (first) setSelectedEntryId(first.id);
    };

    const handleSelectEntry = (entryId: string) => {
        setSelectedEntryId(entryId);
        // clear any pending close timeout and close dropdown immediately
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
            hoverTimeout.current = null;
        }
        setHoveredYear(null);
    };

    // cleanup hover timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeout.current) {
                clearTimeout(hoverTimeout.current);
                hoverTimeout.current = null;
            }
        };
    }, []);

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
                                        {Object.keys(experiences).sort((a, b) => Number(b) - Number(a)).map(year => {
                                            const yearObj = experiences[year];
                                            if (!yearObj) return null;
                                            const hasDropdown = yearObj.entries && yearObj.entries.length > 1;
                                            return (
                                                <div key={year} className="position-relative" onMouseEnter={() => {
                                                    // cancel any pending close and keep open
                                                    if (hoverTimeout.current) { clearTimeout(hoverTimeout.current); hoverTimeout.current = null; }
                                                    setHoveredYear(year);
                                                }} onMouseLeave={() => {
                                                    // delay closing slightly so user can move into dropdown
                                                    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                                                    hoverTimeout.current = setTimeout(() => { setHoveredYear(null); hoverTimeout.current = null; }, 150);
                                                }}>
                                                    <button
                                                        className={`btn btn-primary mx-1 ${allEntries.find(e => e.id === selectedEntryId)?.id?.startsWith(year) ? 'active' : ''}`}
                                                        type="button"
                                                        onClick={() => handleYearClick(year)}
                                                        style={{width: "80px", fontSize: "0.8rem", padding: "4px 6px", display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}
                                                    >
                                                        <span className="btn-text">{year}</span>
                                                        {hasDropdown && <span style={{marginLeft: 6, fontSize: '0.8rem'}}>▾</span>}
                                                    </button>

                                                    {/* Dropdown anchored to the year button */}
                                                    {hasDropdown && hoveredYear === year && (
                                                        <div style={{position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50}} onMouseEnter={() => {
                                                            if (hoverTimeout.current) { clearTimeout(hoverTimeout.current); hoverTimeout.current = null; }
                                                            setHoveredYear(year);
                                                        }} onMouseLeave={() => {
                                                            if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                                                            hoverTimeout.current = setTimeout(() => { setHoveredYear(null); hoverTimeout.current = null; }, 150);
                                                        }}>
                                                            <div style={{backgroundColor: '#C0C0C0', border: '2px solid #FFF', borderRightColor: '#000', borderBottomColor: '#000', padding: '6px', minWidth: '150px'}}>
                                                                {yearObj.entries.map(entry => (
                                                                    <button key={entry.id} onClick={() => handleSelectEntry(entry.id)} className="w-100 mb-1" style={{display: 'block', textAlign: 'left', padding: '6px 8px', background: '#C0C0C0', color: '#000', border: '1px solid #888', borderRightColor: '#FFF', borderBottomColor: '#FFF'}}>
                                                                        <div style={{fontSize: '0.9rem', fontWeight: 400}}>{entry.monthLabel}</div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>

                            {/* Tip Box with Yellow Background - Now full width */}
                            <motion.div
                                key={selectedEntryId}
                                id="experienceContent"
                                className="p-3 mb-3"
                                style={{backgroundColor: "#FFFFE1", border: "1px solid #888", borderRightColor: "#FFF", borderBottomColor: "#FFF"}}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                {(() => {
                                    const selected = allEntries.find(e => e.id === selectedEntryId) || allEntries[0];
                                    if (!selected) return null;
                                    return (
                                        <div className="d-flex">
                                            <div className="mr-3">
                                                <div style={{width: "64px", height: "64px", backgroundColor: "#FFFFE1", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #888", borderRightColor: "#FFF", borderBottomColor: "#FFF"}}>
                                                    <img
                                                        src={getIcon(selected.logo)}
                                                        alt={`${selected.logo} company logo`}
                                                        style={{width: "48px", height: "48px", imageRendering: "pixelated"}}
                                                    />
                                                </div>
                                            </div>
                                            <div style={{flex: 1}}>
                                                <p className="mb-2"><strong style={{color: "#000080", fontSize: "1.1rem"}}>{selected.title}</strong></p>
                                                <p className="mb-2" style={{fontSize: "0.9rem", lineHeight: "1.4", color: "#555"}}>{selected.date}</p>
                                                <p className="mb-3" style={{fontSize: "1rem", lineHeight: "1.4"}}>{selected.description}</p>

                                                {/* Key Achievements */}
                                                <div>
                                                    <p className="mb-2" style={{fontSize: "0.95rem", fontWeight: "bold", color: "#000080"}}>Key Achievements:</p>
                                                    <ul className="mb-0" style={{fontSize: "0.9rem", lineHeight: "1.3", paddingLeft: "20px"}}>
                                                        {selected.achievements && selected.achievements.map((achievement, index) => (
                                                            <li key={index} className="mb-1">{achievement}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()}
                            </motion.div>

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
                                <button className="btn btn-sm mr-2 btn-primary border-dark" type="button">
                                    <span className="btn-text">Amazing!</span>
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

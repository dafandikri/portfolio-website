import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const KnowEachOther = () => {
  const fullText = "Hey! Let's get to know each other. Scroll down to know more about me!";
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing and deleting effect
  useEffect(() => {
    let timeout;

    if (isTyping) {
      if (displayText.length < fullText.length) {
        // Typing forward
        timeout = setTimeout(() => {
          setDisplayText(fullText.substring(0, displayText.length + 1));
        }, 100);
      } else {
        // Finished typing, pause before starting to delete
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        // Deleting
        timeout = setTimeout(() => {
          setDisplayText(displayText.substring(0, displayText.length - 1));
        }, 50);
      } else {
        // Finished deleting, pause before starting to type again
        timeout = setTimeout(() => {
          setIsTyping(true);
        }, 1000);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, fullText]);

  return (
    <motion.div 
      className="section-sm mb-5"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        ease: "easeOut",
        delay: 0.6
      }}
    >
      <div className="card">
        <div className="card-header">
          <div className="icon w95-file-text"></div>
          <span>WordPad - Introduction.doc</span>
        </div>
        <div className="card-body word-processor">
          <motion.div 
            className="toolbar mb-2 p-1 d-flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mr-2">File</span>
            <span className="mr-2">Edit</span>
            <span className="mr-2">View</span>
            <span className="mr-2">Insert</span>
            <span className="mr-2">Format</span>
            <span>Help</span>
          </motion.div>
          
          <motion.div 
            className="formatting-bar mb-2 p-1 d-flex align-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="mr-2">Arial</span>
            <span className="mr-2 divider">|</span>
            <span className="mr-2">12</span>
            <span className="mr-2 divider">|</span>
            <span className="mr-2">B</span>
            <span className="mr-2 divider">|</span>
            <span className="mr-2">i</span>
            <span className="mr-2 divider">|</span>
            <span className="mr-1">U</span>
          </motion.div>
          
          <div className="text-content p-3">
            <h1 className="typing-text">
              {displayText}
              <span className={`cursor ${cursorVisible ? 'visible' : 'invisible'}`}>|</span>
            </h1>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default KnowEachOther;

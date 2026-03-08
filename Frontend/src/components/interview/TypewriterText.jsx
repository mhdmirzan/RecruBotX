import React, { useState, useEffect } from 'react';

const TypewriterText = ({ text, typingSpeed = 15 }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        if (text.length > displayedText.length) {
            const timeoutId = setTimeout(() => {
                setDisplayedText(text.slice(0, displayedText.length + 1));
            }, typingSpeed);
            return () => clearTimeout(timeoutId);
        } else if (text.length < displayedText.length) {
            // If the text was reset or changed completely
            setDisplayedText(text);
        }
    }, [text, displayedText, typingSpeed]);

    return <span>{displayedText}</span>;
};

export default TypewriterText;

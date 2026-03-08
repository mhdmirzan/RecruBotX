import React, { useState, useEffect, useRef } from 'react';

const TypewriterText = ({ text, typingSpeed = 40 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const startTimeRef = useRef(null);
    const textRef = useRef(text);
    const speedRef = useRef(typingSpeed);

    useEffect(() => {
        textRef.current = text;
        speedRef.current = typingSpeed;
    }, [text, typingSpeed]);

    useEffect(() => {
        if (!text) {
            setDisplayedText('');
            return;
        }

        // Only animate if text has grown
        if (text.length > displayedText.length) {
            if (!startTimeRef.current) {
                // start time is now
                startTimeRef.current = performance.now();
            }

            const initialLength = displayedText.length;
            let animationFrameId;

            const updateText = (timestamp) => {
                const elapsed = timestamp - startTimeRef.current;
                const charsToAdd = Math.floor(elapsed / speedRef.current);
                const currentTargetLength = initialLength + charsToAdd;

                // Only update state if length actually changed to save re-renders
                if (currentTargetLength > displayedText.length && currentTargetLength <= textRef.current.length) {
                    setDisplayedText(textRef.current.slice(0, currentTargetLength));
                } else if (currentTargetLength > textRef.current.length) {
                    setDisplayedText(textRef.current);
                }

                if (currentTargetLength < textRef.current.length) {
                    animationFrameId = requestAnimationFrame(updateText);
                } else {
                    startTimeRef.current = null;
                }
            };

            animationFrameId = requestAnimationFrame(updateText);

            return () => cancelAnimationFrame(animationFrameId);
        } else if (text.length < displayedText.length) {
            // Unlikely to happen during normal add, but handles reset/shrink
            setDisplayedText(text);
            startTimeRef.current = null;
        }
    }, [text, displayedText.length]);

    return <span>{displayedText}</span>;
};

export default TypewriterText;

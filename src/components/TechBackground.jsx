import React from 'react';

/**
 * Animated Circuit Board Background
 * Creates a futuristic tech background with animated connection paths
 */
const TechBackground = () => {
    return (
        <div className="tech-background">
            {/* Animated circuit paths */}
            <svg className="circuit-svg" xmlns="http://www.w3.org/2000/svg">
                {/* Horizontal lines */}
                <line className="circuit-line line-1" x1="0" y1="20%" x2="100%" y2="20%" />
                <line className="circuit-line line-2" x1="0" y1="40%" x2="100%" y2="40%" />
                <line className="circuit-line line-3" x1="0" y1="60%" x2="100%" y2="60%" />
                <line className="circuit-line line-4" x1="0" y1="80%" x2="100%" y2="80%" />

                {/* Vertical lines */}
                <line className="circuit-line line-5" x1="20%" y1="0" x2="20%" y2="100%" />
                <line className="circuit-line line-6" x1="50%" y1="0" x2="50%" y2="100%" />
                <line className="circuit-line line-7" x1="80%" y1="0" x2="80%" y2="100%" />

                {/* Connection nodes (glowing dots) */}
                <circle className="circuit-node node-1" cx="20%" cy="20%" r="4" />
                <circle className="circuit-node node-2" cx="50%" cy="40%" r="4" />
                <circle className="circuit-node node-3" cx="80%" cy="60%" r="4" />
                <circle className="circuit-node node-4" cx="20%" cy="80%" r="4" />
                <circle className="circuit-node node-5" cx="80%" cy="20%" r="4" />

                {/* Animated pulse travels */}
                <circle className="pulse pulse-1" cx="0" cy="20%" r="3">
                    <animate attributeName="cx" from="0" to="100%" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle className="pulse pulse-2" cx="0" cy="60%" r="3">
                    <animate attributeName="cx" from="0" to="100%" dur="5s" repeatCount="indefinite" />
                </circle>
                <circle className="pulse pulse-3" cx="50%" cy="0" r="3">
                    <animate attributeName="cy" from="0" to="100%" dur="6s" repeatCount="indefinite" />
                </circle>
            </svg>

            {/* Gradient overlay */}
            <div className="tech-gradient"></div>

            {/* Particle effects */}
            <div className="particles">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className={`particle particle-${i}`}></div>
                ))}
            </div>
        </div>
    );
};

export default TechBackground;

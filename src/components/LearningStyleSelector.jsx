import React, { useState, useEffect } from 'react';
import {
    getAllLearningStyles,
    getLearningStyle,
    setLearningStyle
} from '../services/learningStyleService';

const LearningStyleSelector = ({ onStyleChange }) => {
    const [selectedStyle, setSelectedStyle] = useState(getLearningStyle());
    const [isExpanded, setIsExpanded] = useState(false);
    const styles = getAllLearningStyles();

    const handleSelect = (style) => {
        setLearningStyle(style.id);
        setSelectedStyle(style);
        setIsExpanded(false);
        if (onStyleChange) {
            onStyleChange(style);
        }
    };

    return (
        <div style={{
            marginBottom: '1.5rem',
            position: 'relative'
        }}>
            {/* Current Selection Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(165, 180, 252, 0.5)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{selectedStyle.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                            {selectedStyle.name} Learning
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginTop: '0.1rem'
                        }}>
                            {selectedStyle.description.split('-')[0].trim()}
                        </div>
                    </div>
                </div>
                <span style={{
                    fontSize: '1.2rem',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s ease'
                }}>
                    ▼
                </span>
            </button>

            {/* Expanded Options */}
            {isExpanded && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    zIndex: 1000,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                    animation: 'slideDown 0.3s ease'
                }}>
                    {styles.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => handleSelect(style)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                marginBottom: '0.25rem',
                                background: style.id === selectedStyle.id
                                    ? 'rgba(99, 102, 241, 0.3)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                border: style.id === selectedStyle.id
                                    ? '1px solid rgba(165, 180, 252, 0.5)'
                                    : '1px solid transparent',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.2s ease',
                                textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                                if (style.id !== selectedStyle.id) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (style.id !== selectedStyle.id) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                }
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{style.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                    {style.name}
                                </div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    marginTop: '0.15rem'
                                }}>
                                    {style.description}
                                </div>
                            </div>
                            {style.id === selectedStyle.id && (
                                <span style={{ color: '#a5b4fc' }}>✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LearningStyleSelector;

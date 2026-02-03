import React, { useState, useEffect } from 'react';
import { generateFollowUp, getMasteryLevel } from '../services/adaptiveService';

const AdaptiveFeedback = ({ topic }) => {
    const [feedback, setFeedback] = useState(null);
    const [mastery, setMastery] = useState(0);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        if (!topic) return;

        const followUp = generateFollowUp(topic);
        const masteryLevel = getMasteryLevel(topic);

        setFeedback(followUp);
        setMastery(masteryLevel);
    }, [topic]);

    if (!feedback) return null;

    const getMasteryColor = () => {
        if (mastery >= 80) return '#10b981'; // Green
        if (mastery >= 50) return '#f59e0b'; // Amber
        return '#6366f1'; // Blue
    };

    const getPriorityColor = (priority) => {
        if (priority === 'high') return '#ef4444'; // Red
        if (priority === 'medium') return '#f59e0b'; // Amber
        return '#6366f1'; // Blue
    };

    return (
        <div className="glass-card animate-fade-in" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{
                    fontSize: '1.1rem',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    🧠 Your Learning Path
                </h3>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="btn-text"
                    style={{ margin: 0, fontSize: '0.85rem' }}
                >
                    {isExpanded ? '−' : '+'}
                </button>
            </div>

            {isExpanded && (
                <div className="animate-fade-in" style={{ marginTop: '1.5rem' }}>
                    {/* Mastery Progress */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.5rem'
                        }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Topic Mastery
                            </span>
                            <span style={{
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                color: getMasteryColor()
                            }}>
                                {mastery}%
                            </span>
                        </div>
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${mastery}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, ${getMasteryColor()}, ${getMasteryColor()}dd)`,
                                transition: 'width 0.5s ease',
                                borderRadius: '4px'
                            }} />
                        </div>
                    </div>

                    {/* Feedback Message */}
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderLeft: `3px solid ${getMasteryColor()}`,
                        borderRadius: '0 8px 8px 0',
                        marginBottom: '1.5rem'
                    }}>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>
                            {feedback.message}
                        </p>
                    </div>

                    {/* Weak Areas & Suggestions */}
                    {feedback.needsFollowUp && feedback.suggestions.length > 0 && (
                        <div>
                            <h4 style={{
                                fontSize: '0.9rem',
                                color: 'var(--text-muted)',
                                marginBottom: '1rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Focus Areas
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {feedback.suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="glass-card"
                                        style={{
                                            padding: '0.8rem 1rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            border: `1px solid ${getPriorityColor(suggestion.priority)}33`
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: getPriorityColor(suggestion.priority)
                                            }} />
                                            <span style={{ fontSize: '0.9rem' }}>
                                                {suggestion.area}
                                            </span>
                                        </div>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--text-muted)',
                                            textTransform: 'capitalize'
                                        }}>
                                            {suggestion.priority} priority
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    💡 <strong>Tip:</strong> Use flashcards to practice these concepts more
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {!feedback.needsFollowUp && (
                        <div style={{
                            textAlign: 'center',
                            padding: '2rem 1rem'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                                Excellent work!
                            </p>
                            <p style={{
                                margin: '0.5rem 0 0 0',
                                fontSize: '0.9rem',
                                color: 'var(--text-muted)'
                            }}>
                                You've mastered this topic. Ready for the next challenge?
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdaptiveFeedback;

import React, { useState } from 'react';
import { trackProgress, getMasteryLevel } from '../../services/flashcardService';

const FlashCard = ({ card, index }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [mastery, setMastery] = useState(getMasteryLevel(card.id));

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (!isFlipped) {
            setShowButtons(true);
        }
    };

    const handleResponse = (remembered) => {
        const progress = trackProgress(card.id, remembered);
        setMastery(Math.round((progress.correct / progress.total) * 100));
        setShowButtons(false);

        // Auto-flip back after a delay
        setTimeout(() => {
            setIsFlipped(false);
        }, 800);
    };

    const getMasteryColor = () => {
        if (mastery >= 80) return '#10b981'; // Green
        if (mastery >= 50) return '#f59e0b'; // Amber
        return '#6366f1'; // Blue (learning)
    };

    return (
        <div style={{
            marginBottom: '2rem',
            animationDelay: `${index * 0.05}s`
        }} className="animate-fade-in">
            {/* Mastery Indicator */}
            {mastery > 0 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.85rem'
                }}>
                    <div style={{
                        flex: 1,
                        height: '4px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${mastery}%`,
                            height: '100%',
                            background: getMasteryColor(),
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                    <span style={{ color: getMasteryColor(), fontWeight: 600 }}>
                        {mastery}% mastered
                    </span>
                </div>
            )}

            {/* Flashcard */}
            <div
                onClick={handleFlip}
                style={{
                    perspective: '1000px',
                    cursor: 'pointer',
                    minHeight: '200px'
                }}
            >
                <div style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '200px',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    {/* Front */}
                    <div className="glass-card" style={{
                        position: 'absolute',
                        width: '100%',
                        minHeight: '200px',
                        backfaceVisibility: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '2rem',
                        border: '2px solid var(--glass-border)'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Question
                        </div>
                        <div style={{ fontSize: '1.2rem', textAlign: 'center', lineHeight: '1.6' }}>
                            {card.front}
                        </div>
                        <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Click to reveal →
                        </div>
                    </div>

                    {/* Back */}
                    <div className="glass-card" style={{
                        position: 'absolute',
                        width: '100%',
                        minHeight: '200px',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '2rem',
                        border: '2px solid var(--primary)',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(245, 158, 11, 0.05))'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Answer
                        </div>
                        <div style={{ fontSize: '1.2rem', textAlign: 'center', lineHeight: '1.6', marginBottom: '1rem' }}>
                            {card.back}
                        </div>
                        {card.explanation && (
                            <div style={{
                                marginTop: '1rem',
                                fontSize: '0.9rem',
                                color: 'var(--text-muted)',
                                textAlign: 'center',
                                paddingTop: '1rem',
                                borderTop: '1px solid var(--glass-border)'
                            }}>
                                💡 {card.explanation}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Study Buttons */}
            {showButtons && isFlipped && (
                <div className="animate-fade-in" style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1rem',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleResponse(false); }}
                        style={{
                            padding: '0.8rem 1.5rem',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid #ef4444',
                            borderRadius: '8px',
                            color: '#ef4444',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.3)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                    >
                        😕 Need Review
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleResponse(true); }}
                        style={{
                            padding: '0.8rem 1.5rem',
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px solid #10b981',
                            borderRadius: '8px',
                            color: '#10b981',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(16, 185, 129, 0.3)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(16, 185, 129, 0.2)'}
                    >
                        ✓ Got It!
                    </button>
                </div>
            )}
        </div>
    );
};

const FlashcardsView = ({ flashcards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [studyMode, setStudyMode] = useState('browse'); // 'browse' or 'focused'

    if (!flashcards || flashcards.length === 0) return null;

    const currentCard = flashcards[currentIndex];

    return (
        <div className="glass-card animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🎴 Flashcards
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setStudyMode('browse')}
                            className="btn-text"
                            style={{
                                margin: 0,
                                padding: '0.5rem 1rem',
                                background: studyMode === 'browse' ? 'var(--primary)' : 'transparent',
                                borderRadius: '6px'
                            }}
                        >
                            Browse All
                        </button>
                        <button
                            onClick={() => setStudyMode('focused')}
                            className="btn-text"
                            style={{
                                margin: 0,
                                padding: '0.5rem 1rem',
                                background: studyMode === 'focused' ? 'var(--primary)' : 'transparent',
                                borderRadius: '6px'
                            }}
                        >
                            Study Mode
                        </button>
                    </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    {flashcards.length} cards generated from your study materials
                </p>
            </div>

            {studyMode === 'focused' ? (
                <div>
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem'
                    }}>
                        Card {currentIndex + 1} of {flashcards.length}
                    </div>

                    <FlashCard card={currentCard} index={0} />

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1rem',
                        marginTop: '1.5rem'
                    }}>
                        <button
                            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                            disabled={currentIndex === 0}
                            className="btn-primary"
                            style={{
                                width: 'auto',
                                padding: '0.6rem 1.2rem',
                                opacity: currentIndex === 0 ? 0.3 : 1
                            }}
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() => setCurrentIndex(Math.min(flashcards.length - 1, currentIndex + 1))}
                            disabled={currentIndex === flashcards.length - 1}
                            className="btn-primary"
                            style={{
                                width: 'auto',
                                padding: '0.6rem 1.2rem',
                                opacity: currentIndex === flashcards.length - 1 ? 0.3 : 1
                            }}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {flashcards.map((card, index) => (
                        <FlashCard key={card.id} card={card} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FlashcardsView;

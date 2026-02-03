import React, { useState } from 'react';

const InputSection = ({
    topic,
    setTopic,
    onGenerate,
    status,
    intents,
    setIntents,
    onDemo
}) => {
    // Removed local apiKey state since it's handled globally/default now
    const [showTransparency, setShowTransparency] = useState(false);

    const handleIntentChange = (key) => {
        setIntents(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const isFormValid = topic.trim().length > 0 && (intents.notes || intents.slides || intents.quiz || intents.flashcards);

    return (
        <div className="glass-card animate-slide-up" style={{ padding: '3rem 2rem', border: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Pro Search Bar */}
            <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '16px',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease'
                }}
                    className="pro-search-container"
                >
                    <span style={{ fontSize: '1.5rem', paddingLeft: '1.5rem', opacity: 0.7 }}>🔍</span>
                    <input
                        type="text"
                        placeholder="What do you want to master today?"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        disabled={status === 'loading'}
                        style={{
                            width: '100%',
                            padding: '1.5rem 1rem',
                            fontSize: '1.2rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-main)',
                            outline: 'none'
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && isFormValid) onGenerate(topic);
                        }}
                    />
                    {status === 'loading' && (
                        <div style={{ paddingRight: '1.5rem' }}>
                            <div className="loading-spinner" style={{ width: '24px', height: '24px' }}></div>
                        </div>
                    )}
                </div>

                {/* Example Link */}
                <div style={{ marginTop: '0.8rem', paddingLeft: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Try: <span
                        onClick={onDemo}
                        style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}
                    >
                        Photosynthesis
                    </span>
                    <span style={{ margin: '0 0.5rem' }}>•</span>
                    <span onClick={() => setTopic('Machine Learning')} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}>
                        Machine Learning
                    </span>
                </div>
            </div>

            {/* Pro Intent Selection (Pill Toggles) */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    {[
                        { id: 'notes', label: '📝 Study Notes' },
                        { id: 'slides', label: '🎯 Slides' },
                        { id: 'quiz', label: '❓ Quiz' },
                        { id: 'flashcards', label: '🎴 Flashcards' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleIntentChange(item.id)}
                            disabled={status === 'loading'}
                            style={{
                                padding: '0.8rem 1.5rem',
                                borderRadius: '50px',
                                border: intents[item.id] ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                                background: intents[item.id] ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
                                color: intents[item.id] ? 'var(--accent)' : 'var(--text-muted)',
                                fontSize: '0.95rem',
                                fontWeight: intents[item.id] ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            className="intent-toggle"
                        >
                            {item.label}
                            {intents[item.id] && <span style={{ fontSize: '0.8rem' }}>✓</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Area */}
            <div style={{ textAlign: 'center' }}>
                <button
                    className="btn-primary"
                    onClick={() => onGenerate(topic)}
                    disabled={status === 'loading' || !isFormValid}
                    style={{
                        padding: '1rem 3rem',
                        fontSize: '1.1rem',
                        borderRadius: '50px',
                        boxShadow: isFormValid ? '0 0 20px var(--accent-glow)' : 'none',
                        opacity: isFormValid ? 1 : 0.7
                    }}
                >
                    {status === 'loading' ? 'Generating Magic...' : 'Craft Study Material 🚀'}
                </button>
            </div>

            {/* Footer / Transparency (Subtle) */}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                {!showTransparency ? (
                    <p
                        onClick={() => setShowTransparency(true)}
                        style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6 }}
                    >
                        How does this work?
                    </p>
                ) : (
                    <div className="animate-fade-in" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
                        Study Craft AI analyzes your topic using advanced LLMs (DeepSeek/Gemini) and creates structured notes, quizzes, slides, and flashcards instantly.
                        <br />
                        <span
                            onClick={() => setShowTransparency(false)}
                            style={{ color: 'var(--accent)', cursor: 'pointer', marginTop: '0.5rem', display: 'inline-block' }}
                        >
                            Close
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputSection;

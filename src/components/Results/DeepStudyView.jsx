import React, { useState, useEffect } from 'react';
import { generateDeepStudy, askTutor, STUDY_LEVELS, detectSubjectType } from '../../services/deepStudyService';

/**
 * Deep Study View
 * Progressive learning from Zero to Hero
 */
const DeepStudyView = ({ topic, onBack }) => {
    const [currentLevel, setCurrentLevel] = useState(STUDY_LEVELS.FOUNDATION);
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [askingTutor, setAskingTutor] = useState(false);
    const [subjectType, setSubjectType] = useState('general');

    const levels = [
        { id: STUDY_LEVELS.FOUNDATION, label: '🌱 Foundation', desc: 'Start from zero' },
        { id: STUDY_LEVELS.UNDERSTANDING, label: '🔍 Understanding', desc: 'How it works' },
        { id: STUDY_LEVELS.APPLICATION, label: '⚡ Application', desc: 'Real-world use' },
        { id: STUDY_LEVELS.MASTERY, label: '🏆 Mastery', desc: 'Expert level' }
    ];

    useEffect(() => {
        setSubjectType(detectSubjectType(topic));
        loadLevel(STUDY_LEVELS.FOUNDATION);
    }, [topic]);

    const loadLevel = async (level) => {
        if (content[level]) {
            setCurrentLevel(level);
            return;
        }

        setLoading(true);
        try {
            // Service handles API keys internally now
            const result = await generateDeepStudy(topic, level);
            setContent(prev => ({ ...prev, [level]: result }));
            setCurrentLevel(level);
        } catch (error) {
            console.error('Load level error:', error);
        }
        setLoading(false);
    };

    const handleAskTutor = async () => {
        if (!question.trim() || askingTutor) return;

        setAskingTutor(true);
        const currentContent = content[currentLevel];
        const context = currentContent?.title || topic;

        try {
            // Service handles API keys internally now
            const response = await askTutor(topic, question, context);
            setChatHistory(prev => [...prev,
            { type: 'user', text: question },
            { type: 'ai', text: response.answer, suggestions: response.followUpSuggestions }
            ]);
            setQuestion('');
        } catch (error) {
            console.error('Tutor error:', error);
        }
        setAskingTutor(false);
    };

    const renderContent = (levelContent) => {
        if (!levelContent?.content) return null;

        return levelContent.content.map((block, index) => {
            switch (block.type) {
                case 'definition':
                case 'analogy':
                case 'mechanism':
                case 'connections':
                case 'advanced':
                    return (
                        <div key={index} className="glass-card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--accent)', marginBottom: '0.75rem', textTransform: 'capitalize' }}>
                                {block.type === 'definition' && '📖 '}
                                {block.type === 'analogy' && '💡 '}
                                {block.type === 'mechanism' && '⚙️ '}
                                {block.type}
                            </h4>
                            <p style={{ lineHeight: 1.7 }}>{block.text}</p>
                        </div>
                    );
                case 'keyPoints':
                case 'components':
                case 'commonMistakes':
                case 'edgeCases':
                case 'expertTips':
                    return (
                        <div key={index} className="glass-card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--accent)', marginBottom: '0.75rem', textTransform: 'capitalize' }}>
                                {block.type === 'keyPoints' && '🔑 Key Points'}
                                {block.type === 'components' && '🧩 Components'}
                                {block.type === 'commonMistakes' && '⚠️ Common Mistakes'}
                                {block.type === 'edgeCases' && '🔍 Edge Cases'}
                                {block.type === 'expertTips' && '💎 Expert Tips'}
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {block.items?.map((item, i) => (
                                    <li key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                case 'process':
                    return (
                        <div key={index} className="glass-card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>📋 Process</h4>
                            <ol style={{ paddingLeft: '1.5rem' }}>
                                {block.steps?.map((step, i) => (
                                    <li key={i} style={{ padding: '0.5rem 0' }}>{step}</li>
                                ))}
                            </ol>
                        </div>
                    );
                case 'realWorld':
                    return (
                        <div key={index} className="glass-card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>🌍 Real-World Examples</h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {block.examples?.map((ex, i) => (
                                    <li key={i} style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span>→</span> {ex}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                case 'exercise':
                    return (
                        <div key={index} className="glass-card" style={{ marginBottom: '1rem', padding: '1.5rem', borderLeft: '3px solid var(--accent)' }}>
                            <h4 style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>🎯 Practice Exercise</h4>
                            <p><strong>Problem:</strong> {block.problem}</p>
                            <details style={{ marginTop: '1rem' }}>
                                <summary style={{ cursor: 'pointer', color: 'var(--accent)' }}>Show Solution</summary>
                                <p style={{ marginTop: '0.75rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                    {block.solution}
                                </p>
                            </details>
                        </div>
                    );
                case 'funFact':
                    return (
                        <div key={index} style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '8px', marginBottom: '1rem' }}>
                            <span style={{ marginRight: '0.5rem' }}>✨</span>
                            <strong>Fun Fact:</strong> {block.text}
                        </div>
                    );
                case 'furtherStudy':
                    return (
                        <div key={index} className="glass-card" style={{ marginBottom: '1rem', padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>📚 Further Study</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {block.resources?.map((res, i) => (
                                    <span key={i} style={{
                                        padding: '0.5rem 1rem',
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem'
                                    }}>
                                        {res}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                default:
                    return null;
            }
        });
    };

    const currentContent = content[currentLevel];

    return (
        <div className="deep-study-view">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <button className="btn-text" onClick={onBack}>← Back</button>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ margin: 0 }}>🎓 Deep Study: <span className="accent-text">{topic}</span></h2>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Subject: {subjectType.charAt(0).toUpperCase() + subjectType.slice(1)}
                    </span>
                </div>
                <div style={{ width: '80px' }}></div>
            </div>

            {/* Level Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '2rem',
                overflowX: 'auto',
                padding: '0.5rem 0'
            }}>
                {levels.map((level, index) => (
                    <button
                        key={level.id}
                        onClick={() => loadLevel(level.id)}
                        disabled={loading}
                        style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            border: currentLevel === level.id ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                            background: currentLevel === level.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--glass-bg)',
                            color: currentLevel === level.id ? 'var(--accent)' : 'var(--text-main)',
                            cursor: 'pointer',
                            minWidth: '140px',
                            textAlign: 'left',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ fontWeight: 600 }}>{level.label}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{level.desc}</div>
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading {currentLevel} content...</p>
                </div>
            ) : currentContent ? (
                <div>
                    {/* Title & Key Question */}
                    <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>{currentContent.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            {currentContent.keyQuestion}
                        </p>
                    </div>

                    {/* Content Blocks */}
                    {renderContent(currentContent)}

                    {/* Self Check */}
                    {currentContent.selfCheck && (
                        <div className="glass-card" style={{ padding: '1.5rem', marginTop: '2rem', borderLeft: '3px solid var(--primary)' }}>
                            <h4 style={{ marginBottom: '0.75rem' }}>🧠 Self Check</h4>
                            <p>{currentContent.selfCheck}</p>
                        </div>
                    )}
                </div>
            ) : null}

            {/* AI Tutor Chat */}
            <div className="glass-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>💬 Ask the AI Tutor</h4>

                {/* Chat History */}
                {chatHistory.length > 0 && (
                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
                        {chatHistory.map((msg, i) => (
                            <div key={i} style={{
                                padding: '1rem',
                                marginBottom: '0.5rem',
                                borderRadius: '8px',
                                background: msg.type === 'user' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(6, 182, 212, 0.1)',
                                marginLeft: msg.type === 'user' ? '20%' : '0',
                                marginRight: msg.type === 'ai' ? '20%' : '0'
                            }}>
                                <p>{msg.text}</p>
                                {msg.suggestions?.length > 0 && (
                                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {msg.suggestions.map((s, j) => (
                                            <button
                                                key={j}
                                                onClick={() => setQuestion(s)}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    fontSize: '0.8rem',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid var(--glass-border)',
                                                    borderRadius: '20px',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-muted)'
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask anything about this topic..."
                        onKeyDown={(e) => e.key === 'Enter' && handleAskTutor()}
                        disabled={askingTutor}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)',
                            background: 'rgba(0,0,0,0.2)',
                            color: 'var(--text-main)',
                            fontSize: '1rem'
                        }}
                    />
                    <button
                        onClick={handleAskTutor}
                        disabled={askingTutor || !question.trim()}
                        className="btn-primary"
                        style={{ padding: '1rem 1.5rem' }}
                    >
                        {askingTutor ? '...' : 'Ask'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeepStudyView;

import React, { useState, useEffect } from 'react';
import { generateDeepStudy, askTutor, STUDY_LEVELS, detectSubjectType } from '../../services/deepStudyService';

/**
 * Deep Study View - Premium Design with Code & Math Formatting
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

    // Copy code to clipboard
    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
    };

    // Code Block Component
    const CodeBlock = ({ code, language = 'pseudocode' }) => (
        <div className="code-block">
            <div className="code-block-header">
                <span className="code-block-title">
                    <span>💻</span> {language}
                </span>
                <button className="code-block-copy" onClick={() => copyCode(code)}>
                    📋 Copy
                </button>
            </div>
            <pre>
                <code>{code}</code>
            </pre>
        </div>
    );

    // Math Block Component
    const MathBlock = ({ equation, label }) => (
        <div className="math-block">
            {label && <div style={{ fontSize: '0.9rem', color: 'var(--accent)', marginBottom: '0.5rem' }}>{label}</div>}
            <div className="math-equation">{equation}</div>
        </div>
    );

    // Parse and format AI response text
    const formatResponseText = (text) => {
        if (!text) return null;

        // Split by code blocks
        const parts = text.split(/```(\w*)\n?([\s\S]*?)```/g);
        const elements = [];

        for (let i = 0; i < parts.length; i++) {
            if (i % 3 === 0) {
                // Regular text - check for inline code and formulas
                const textContent = parts[i];
                if (textContent.trim()) {
                    // Check for formula patterns
                    const formulaMatch = textContent.match(/\b([A-Za-z_]+)\s*=\s*[^.]+/g);
                    const lines = textContent.split('\n');

                    elements.push(
                        <div key={i} style={{ marginBottom: '1rem', lineHeight: 1.8 }}>
                            {lines.map((line, j) => {
                                // Check if line looks like a formula
                                if (line.match(/^\s*-?\s*[A-Za-z_]+\s*[=:]\s*.+$/)) {
                                    return (
                                        <div key={j} className="math-block" style={{ padding: '0.75rem', margin: '0.5rem 0' }}>
                                            <code style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{line.trim()}</code>
                                        </div>
                                    );
                                }
                                // Regular text
                                return <span key={j}>{line}{j < lines.length - 1 && <br />}</span>;
                            })}
                        </div>
                    );
                }
            } else if (i % 3 === 1) {
                // Language identifier
                // Skip, handled with code content
            } else {
                // Code content
                const language = parts[i - 1] || 'code';
                elements.push(<CodeBlock key={i} code={parts[i].trim()} language={language} />);
            }
        }

        // If no code blocks found, just format the text
        if (elements.length === 0) {
            return formatPlainText(text);
        }

        return elements;
    };

    // Format plain text with formulas and structure
    const formatPlainText = (text) => {
        const paragraphs = text.split(/\n\n+/);
        return paragraphs.map((para, i) => {
            // Check if it's a list
            if (para.startsWith('- ') || para.match(/^\d+\./)) {
                const items = para.split('\n').filter(l => l.trim());
                return (
                    <ul key={i} style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
                        {items.map((item, j) => (
                            <li key={j} style={{ marginBottom: '0.5rem', lineHeight: 1.7 }}>
                                {item.replace(/^[-\d.]+\s*/, '')}
                            </li>
                        ))}
                    </ul>
                );
            }

            // Check if it's a formula/equation
            if (para.match(/^[A-Za-z_]+\s*[=:]/)) {
                return (
                    <div key={i} className="math-block" style={{ padding: '1rem', margin: '1rem 0' }}>
                        <pre style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem' }}>
                            {para}
                        </pre>
                    </div>
                );
            }

            // Regular paragraph
            return <p key={i} style={{ marginBottom: '1rem', lineHeight: 1.8 }}>{para}</p>;
        });
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
                        <div key={index} className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {block.type === 'definition' && <span>📖</span>}
                                {block.type === 'analogy' && <span>💡</span>}
                                {block.type === 'mechanism' && <span>⚙️</span>}
                                {block.type === 'connections' && <span>🔗</span>}
                                {block.type === 'advanced' && <span>🎯</span>}
                                <span style={{ textTransform: 'capitalize' }}>{block.type}</span>
                            </h4>
                            <div style={{ lineHeight: 1.8 }}>{formatPlainText(block.text)}</div>
                        </div>
                    );
                case 'keyPoints':
                case 'components':
                case 'commonMistakes':
                case 'edgeCases':
                case 'expertTips':
                    return (
                        <div key={index} className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {block.type === 'keyPoints' && <><span>🔑</span> Key Points</>}
                                {block.type === 'components' && <><span>🧩</span> Components</>}
                                {block.type === 'commonMistakes' && <><span>⚠️</span> Common Mistakes</>}
                                {block.type === 'edgeCases' && <><span>🔍</span> Edge Cases</>}
                                {block.type === 'expertTips' && <><span>💎</span> Expert Tips</>}
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {block.items?.map((item, i) => (
                                    <li key={i} style={{
                                        padding: '0.75rem 1rem',
                                        marginBottom: '0.5rem',
                                        background: 'rgba(99, 102, 241, 0.05)',
                                        borderRadius: '10px',
                                        borderLeft: '3px solid var(--accent)',
                                        lineHeight: 1.6
                                    }}>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                case 'process':
                    return (
                        <div key={index} className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>📋</span> Process
                            </h4>
                            <div className="math-steps">
                                {block.steps?.map((step, i) => (
                                    <div key={i} className="math-step">
                                        <div className="math-step-number">{i + 1}</div>
                                        <div style={{ lineHeight: 1.7 }}>{step}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                case 'realWorld':
                    return (
                        <div key={index} className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>🌍</span> Real-World Examples
                            </h4>
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {block.examples?.map((ex, i) => (
                                    <div key={i} style={{
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.05))',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '0.75rem'
                                    }}>
                                        <span style={{ color: '#10b981' }}>→</span>
                                        <span style={{ lineHeight: 1.6 }}>{ex}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                case 'exercise':
                    return (
                        <div key={index} className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', borderLeft: '4px solid var(--accent)' }}>
                            <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>🎯</span> Practice Exercise
                            </h4>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem' }}>
                                <strong style={{ color: 'var(--accent)' }}>Problem:</strong>
                                <p style={{ marginTop: '0.5rem', lineHeight: 1.7 }}>{block.problem}</p>
                            </div>
                            <details style={{ cursor: 'pointer' }}>
                                <summary style={{
                                    color: 'var(--accent)',
                                    fontWeight: 600,
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(6, 182, 212, 0.1)',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    👁️ Show Solution
                                </summary>
                                <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                    {formatResponseText(block.solution)}
                                </div>
                            </details>
                        </div>
                    );
                case 'funFact':
                    return (
                        <div key={index} style={{
                            padding: '1.25rem',
                            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(99, 102, 241, 0.08))',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem'
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>✨</span>
                            <div>
                                <strong style={{ color: 'var(--accent)' }}>Fun Fact:</strong>
                                <p style={{ marginTop: '0.25rem', lineHeight: 1.7 }}>{block.text}</p>
                            </div>
                        </div>
                    );
                case 'furtherStudy':
                    return (
                        <div key={index} className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                            <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>📚</span> Further Study
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {block.resources?.map((res, i) => (
                                    <span key={i} style={{
                                        padding: '0.6rem 1.2rem',
                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.15))',
                                        borderRadius: '25px',
                                        fontSize: '0.9rem',
                                        border: '1px solid rgba(99, 102, 241, 0.3)'
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <button className="btn-text" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ← Back
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🎓 Deep Study: <span className="accent-text">{topic}</span></h2>
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
                {levels.map((level) => (
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
                        <h3 style={{ marginBottom: '0.75rem' }}>{currentContent.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '1.05rem' }}>
                            {currentContent.keyQuestion}
                        </p>
                    </div>

                    {/* Content Blocks */}
                    {renderContent(currentContent)}

                    {/* Self Check */}
                    {currentContent.selfCheck && (
                        <div className="glass-card" style={{ padding: '1.5rem', marginTop: '2rem', borderLeft: '4px solid var(--primary)' }}>
                            <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>🧠</span> Self Check
                            </h4>
                            <p style={{ lineHeight: 1.7 }}>{currentContent.selfCheck}</p>
                        </div>
                    )}
                </div>
            ) : null}

            {/* AI Tutor Chat */}
            <div className="glass-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>💬</span> Ask the AI Tutor
                </h4>

                {/* Chat History */}
                {chatHistory.length > 0 && (
                    <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={msg.type === 'ai' ? 'ai-response' : ''} style={{
                                padding: '1.25rem',
                                marginBottom: '0.75rem',
                                borderRadius: '16px',
                                background: msg.type === 'user'
                                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1))'
                                    : undefined,
                                marginLeft: msg.type === 'user' ? '15%' : '0',
                                marginRight: msg.type === 'ai' ? '5%' : '0'
                            }}>
                                {msg.type === 'user' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#a5b4fc' }}>
                                        <span>👤</span> You asked:
                                    </div>
                                ) : (
                                    <div className="ai-response-header">
                                        <span>🤖</span> AI Tutor:
                                    </div>
                                )}
                                <div className="ai-response-content">
                                    {formatResponseText(msg.text)}
                                </div>
                                {msg.suggestions?.length > 0 && (
                                    <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', width: '100%', marginBottom: '0.25rem' }}>
                                            Related questions:
                                        </span>
                                        {msg.suggestions.map((s, j) => (
                                            <button
                                                key={j}
                                                onClick={() => setQuestion(s)}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.85rem',
                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                                    borderRadius: '25px',
                                                    cursor: 'pointer',
                                                    color: '#a5b4fc',
                                                    transition: 'all 0.2s'
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
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask anything about this topic..."
                        onKeyDown={(e) => e.key === 'Enter' && handleAskTutor()}
                        disabled={askingTutor}
                        style={{
                            flex: 1,
                            padding: '1rem 1.25rem',
                            borderRadius: '12px',
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
                        style={{ padding: '1rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {askingTutor ? '⏳' : '🚀'} {askingTutor ? 'Thinking...' : 'Ask'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeepStudyView;

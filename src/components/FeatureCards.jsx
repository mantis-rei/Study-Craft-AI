import React, { useState } from 'react';
import { openYouTubeSearch, searchYouTube } from '../services/youtubeService';
import { generateProjectIdeas } from '../services/projectIdeasService';
import { generateProjectTutorial, generateFullNotes } from '../services/gpt4oService';
import { getSettings } from '../services/settingsService';

/**
 * Feature Cards - Fixed modals with proper close buttons
 * All close buttons are fixed positioned and always accessible
 */
const FeatureCards = ({ onSelectFeature, currentTopic }) => {
    const [youtubeResults, setYoutubeResults] = useState(null);
    const [showYoutubeModal, setShowYoutubeModal] = useState(false);
    const [projectResults, setProjectResults] = useState(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectTutorial, setProjectTutorial] = useState(null);
    const [loadingTutorial, setLoadingTutorial] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [fullNotes, setFullNotes] = useState(null);
    const [loadingNotes, setLoadingNotes] = useState(false);

    const features = [
        { id: 'notes', icon: '📝', title: 'Generate\nNotes', description: 'Create comprehensive PDF notes', color: '#a78bfa', action: 'fullnotes' },
        { id: 'slides', icon: '🎯', title: 'Presentation\nSlides', description: 'Build engaging slide decks', color: '#60a5fa', action: 'generate' },
        { id: 'quiz', icon: '❓', title: 'Questions &\nAnswers', description: 'Test your knowledge', color: '#34d399', action: 'generate' },
        { id: 'projects', icon: '💡', title: 'Project\nIdeas', description: 'Get inspired with projects', color: '#f59e0b', action: 'projects' },
        { id: 'youtube', icon: '🎬', title: 'YouTube\nTutorials', description: 'Find video tutorials', color: '#ef4444', action: 'youtube' }
    ];

    const handleCardClick = async (feature) => {
        if (feature.action === 'youtube') {
            const topic = currentTopic || 'study tips';
            const results = await searchYouTube(topic);
            setYoutubeResults(results);
            setShowYoutubeModal(true);
        } else if (feature.action === 'projects') {
            const topic = currentTopic || 'programming';
            setLoadingProjects(true);
            setShowProjectModal(true);
            setSelectedProject(null);
            setProjectTutorial(null);
            try {
                const settings = getSettings();
                const results = await generateProjectIdeas(topic, settings.gemini_api_key);
                setProjectResults(results);
            } catch (error) {
                console.error('Project ideas error:', error);
            }
            setLoadingProjects(false);
        } else if (feature.action === 'fullnotes') {
            const topic = currentTopic || 'programming basics';
            setLoadingNotes(true);
            setShowNotesModal(true);
            setFullNotes(null);
            try {
                const notes = await generateFullNotes(topic);
                setFullNotes(notes);
            } catch (error) {
                console.error('Full notes error:', error);
            }
            setLoadingNotes(false);
        } else {
            onSelectFeature(feature.id);
        }
    };

    const handleGoDeeper = async (project) => {
        setSelectedProject(project);
        setLoadingTutorial(true);
        try {
            const tutorial = await generateProjectTutorial(project.title, project.description);
            setProjectTutorial(tutorial);
        } catch (error) {
            console.error('Tutorial error:', error);
        }
        setLoadingTutorial(false);
    };

    const downloadNotesAsPDF = () => {
        if (!fullNotes) return;
        let content = `# ${fullNotes.title}\n\n`;
        fullNotes.sections?.forEach(section => {
            content += `## ${section.heading}\n\n${section.content}\n\n`;
            if (section.codeExample) content += `\`\`\`\n${section.codeExample}\n\`\`\`\n\n`;
            if (section.mathSteps?.length) content += `Steps:\n${section.mathSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;
        });
        if (fullNotes.summary?.length) content += `## Summary\n${fullNotes.summary.map(s => `• ${s}`).join('\n')}\n\n`;

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fullNotes.title || 'notes'}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Fixed Close Button Component - Always visible and clickable
    const CloseButton = ({ onClick, style = {} }) => (
        <button
            onClick={onClick}
            style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.9)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: '#fff',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                transition: 'all 0.2s',
                ...style
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 1)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.9)'}
        >
            ✕
        </button>
    );

    // Modal Overlay Component
    const ModalOverlay = ({ children, onClose }) => (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '1rem',
                overflowY: 'auto'
            }}
        >
            {children}
        </div>
    );

    // Modal Content Component
    const ModalContent = ({ children, onClose, maxWidth = '600px' }) => (
        <div
            onClick={(e) => e.stopPropagation()}
            className="glass-card animate-slide-up"
            style={{
                position: 'relative',
                maxWidth: maxWidth,
                width: '100%',
                padding: '2rem',
                paddingTop: '3.5rem',
                maxHeight: '90vh',
                overflow: 'auto',
                background: 'rgba(15,23,42,0.98)',
                border: '1px solid rgba(6,182,212,0.3)',
                borderRadius: '16px'
            }}
        >
            <CloseButton onClick={onClose} />
            {children}
        </div>
    );

    const renderProjectCard = (project, index, difficulty) => (
        <div key={index} style={{
            padding: '1rem',
            marginBottom: '0.75rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>{project.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{project.description}</p>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', background: 'rgba(6,182,212,0.2)', borderRadius: '20px', whiteSpace: 'nowrap', color: 'var(--accent)' }}>
                    ⏱️ {project.timeEstimate}
                </span>
            </div>
            {project.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
                    {project.tags.map((tag, i) => (
                        <span key={i} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(99,102,241,0.15)', borderRadius: '4px', color: '#a5b4fc' }}>{tag}</span>
                    ))}
                </div>
            )}
            <button
                onClick={() => handleGoDeeper(project)}
                style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '0.6rem',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                }}
            >
                🚀 Go Deeper - Start Tutorial
            </button>
        </div>
    );

    const renderTutorial = () => (
        <div>
            <button
                onClick={() => { setSelectedProject(null); setProjectTutorial(null); }}
                className="btn-text"
                style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}
            >
                ← Back to Projects
            </button>
            <h2 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{projectTutorial.project}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{projectTutorial.overview}</p>
            {projectTutorial.steps?.map((step, i) => (
                <div key={i} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '3px solid var(--accent)' }}>
                    <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>Step {i + 1}: {step.title}</h4>
                    <p style={{ margin: 0, marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{step.description}</p>
                    {step.code && (
                        <pre style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.8rem' }}>
                            <code>{step.code}</code>
                        </pre>
                    )}
                    {step.tip && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#f59e0b' }}>💡 {step.tip}</div>}
                </div>
            ))}
        </div>
    );

    return (
        <>
            <div className="feature-cards-container">
                <div className="feature-cards-grid">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="feature-card glass-card"
                            onClick={() => handleCardClick(feature)}
                            style={{ '--card-color': feature.color }}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                            <div className="card-glow"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* YouTube Modal - FIXED with proper close button */}
            {showYoutubeModal && youtubeResults && (
                <ModalOverlay onClose={() => setShowYoutubeModal(false)}>
                    <ModalContent onClose={() => setShowYoutubeModal(false)} maxWidth="500px">
                        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>🎬 YouTube Tutorials</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
                            Topic: <strong style={{ color: 'var(--accent)' }}>{youtubeResults.topic}</strong>
                        </p>
                        <button
                            className="btn-primary"
                            onClick={() => { openYouTubeSearch(currentTopic || 'study tips'); setShowYoutubeModal(false); }}
                            style={{ width: '100%', marginBottom: '1rem', padding: '0.8rem' }}
                        >
                            🚀 Search YouTube
                        </button>
                        {youtubeResults.suggestions.map((s, i) => (
                            <a
                                key={i}
                                href={s.searchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'block',
                                    padding: '0.75rem',
                                    marginBottom: '0.5rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--glass-border)',
                                    textDecoration: 'none',
                                    color: 'var(--text-main)'
                                }}
                            >
                                <div style={{ fontWeight: 600 }}>{s.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.description}</div>
                            </a>
                        ))}
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* Project Ideas Modal - FIXED with proper close button */}
            {showProjectModal && (
                <ModalOverlay onClose={() => setShowProjectModal(false)}>
                    <ModalContent onClose={() => setShowProjectModal(false)} maxWidth="700px">
                        {loadingProjects ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                                <p style={{ color: 'var(--text-muted)' }}>AI is generating project ideas...</p>
                            </div>
                        ) : selectedProject && loadingTutorial ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                                <p style={{ color: 'var(--text-muted)' }}>Generating step-by-step tutorial...</p>
                            </div>
                        ) : selectedProject && projectTutorial ? (
                            renderTutorial()
                        ) : projectResults ? (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>💡 Project Ideas</h2>
                                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                                        Projects for: <strong style={{ color: 'var(--accent)' }}>{projectResults.topic}</strong>
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {/* Beginner */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem 1rem', background: 'rgba(52,211,153,0.15)', borderRadius: '8px' }}>
                                            <span>🌱</span>
                                            <span style={{ fontWeight: 600, color: '#34d399' }}>Beginner</span>
                                        </div>
                                        {projectResults.projects?.beginner?.map((p, i) => renderProjectCard(p, i, 'beginner'))}
                                    </div>

                                    {/* Intermediate */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem 1rem', background: 'rgba(245,158,11,0.15)', borderRadius: '8px' }}>
                                            <span>⚡</span>
                                            <span style={{ fontWeight: 600, color: '#f59e0b' }}>Intermediate</span>
                                        </div>
                                        {projectResults.projects?.intermediate?.map((p, i) => renderProjectCard(p, i, 'intermediate'))}
                                    </div>

                                    {/* Advanced */}
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.15)', borderRadius: '8px' }}>
                                            <span>🏆</span>
                                            <span style={{ fontWeight: 600, color: '#ef4444' }}>Advanced</span>
                                        </div>
                                        {projectResults.projects?.advanced?.map((p, i) => renderProjectCard(p, i, 'advanced'))}
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* Full Notes Modal - FIXED with proper close button */}
            {showNotesModal && (
                <ModalOverlay onClose={() => setShowNotesModal(false)}>
                    <ModalContent onClose={() => setShowNotesModal(false)} maxWidth="800px">
                        {loadingNotes ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                                <p style={{ color: 'var(--text-muted)' }}>Generating comprehensive notes...</p>
                            </div>
                        ) : fullNotes ? (
                            <>
                                <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>📝 {fullNotes.title}</h2>

                                {fullNotes.sections?.map((section, i) => (
                                    <div key={i} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                        <h3 style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>{section.heading}</h3>
                                        <p style={{ lineHeight: 1.7 }}>{section.content}</p>
                                        {section.codeExample && (
                                            <pre style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
                                                <code>{section.codeExample}</code>
                                            </pre>
                                        )}
                                        {section.mathSteps?.length > 0 && (
                                            <ol style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                                                {section.mathSteps.map((step, j) => (
                                                    <li key={j} style={{ marginBottom: '0.5rem' }}>{step}</li>
                                                ))}
                                            </ol>
                                        )}
                                    </div>
                                ))}

                                {fullNotes.summary?.length > 0 && (
                                    <div style={{ padding: '1rem', background: 'rgba(6,182,212,0.1)', borderRadius: '12px', marginBottom: '1rem' }}>
                                        <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>📌 Key Takeaways</h4>
                                        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                                            {fullNotes.summary.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    onClick={downloadNotesAsPDF}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    📥 Download as Markdown
                                </button>
                            </>
                        ) : null}
                    </ModalContent>
                </ModalOverlay>
            )}
        </>
    );
};

export default FeatureCards;

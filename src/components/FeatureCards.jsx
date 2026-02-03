import React, { useState } from 'react';
import { openYouTubeSearch, searchYouTube } from '../services/youtubeService';
import { generateProjectIdeas } from '../services/projectIdeasService';
import { generateProjectTutorial, generateFullNotes } from '../services/gpt4oService';
import { getSettings } from '../services/settingsService';

/**
 * Feature Cards - Premium Design with Code Formatting
 * Senior-level modals with proper styling
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
                // Service handles API keys internally now
                const results = await generateProjectIdeas(topic);
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

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
    };

    // Code Block Component with proper formatting
    const CodeBlock = ({ code, language = 'javascript' }) => (
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

    // Modal Components
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

    const renderProjectCard = (project, index, difficulty) => (
        <div key={index} className="project-card">
            <div className="project-card-header">
                <h4 className="project-card-title">{project.title}</h4>
                <span className="project-card-badge">⏱️ {project.timeEstimate}</span>
            </div>
            <p className="project-card-description">{project.description}</p>
            {project.tags && (
                <div className="project-card-tags">
                    {project.tags.map((tag, i) => (
                        <span key={i} className="project-card-tag">{tag}</span>
                    ))}
                </div>
            )}
            <button onClick={() => handleGoDeeper(project)} className="project-card-btn">
                🚀 Go Deeper - Start Tutorial
            </button>
        </div>
    );

    const renderTutorial = () => (
        <div>
            <button
                onClick={() => { setSelectedProject(null); setProjectTutorial(null); }}
                className="btn-text"
                style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                ← Back to Projects
            </button>
            <h2 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>{projectTutorial.project}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>{projectTutorial.overview}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {projectTutorial.steps?.map((step, i) => (
                    <div key={i} style={{
                        background: 'rgba(99, 102, 241, 0.05)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        borderLeft: '4px solid var(--accent)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '1rem'
                            }}>
                                {i + 1}
                            </div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{step.title}</h4>
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.7 }}>{step.description}</p>
                        {step.code && <CodeBlock code={step.code} language={step.language || 'javascript'} />}
                        {step.tip && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem 1rem',
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.5rem',
                                color: '#f59e0b',
                                fontSize: '0.9rem'
                            }}>
                                💡 <span>{step.tip}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            {/* Feature Cards Grid */}
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

            {/* YouTube Modal - Premium Design */}
            {showYoutubeModal && youtubeResults && (
                <ModalOverlay onClose={() => setShowYoutubeModal(false)}>
                    <div
                        className="modal-premium animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '550px', width: '100%', maxHeight: '85vh', overflow: 'hidden' }}
                    >
                        <div className="modal-header-premium">
                            <h2>🎬 YouTube Tutorials</h2>
                            <button className="modal-close-btn" onClick={() => setShowYoutubeModal(false)}>✕</button>
                        </div>
                        <div className="modal-body-premium">
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.05rem' }}>
                                Topic: <strong style={{ color: 'var(--accent)' }}>{youtubeResults.topic}</strong>
                            </p>

                            <button
                                className="btn-primary"
                                onClick={() => { openYouTubeSearch(currentTopic || 'study tips'); setShowYoutubeModal(false); }}
                                style={{ width: '100%', marginBottom: '1.5rem', padding: '1rem', fontSize: '1.05rem' }}
                            >
                                🚀 Search YouTube
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {youtubeResults.suggestions.map((s, i) => (
                                    <a
                                        key={i}
                                        href={s.searchUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="youtube-card"
                                    >
                                        <span className="youtube-icon">▶️</span>
                                        <div className="youtube-card-content">
                                            <div className="youtube-card-title">{s.title}</div>
                                            <div className="youtube-card-desc">{s.description}</div>
                                        </div>
                                        <span className="youtube-card-arrow">→</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* Project Ideas Modal - Premium Design */}
            {showProjectModal && (
                <ModalOverlay onClose={() => setShowProjectModal(false)}>
                    <div
                        className="modal-premium animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh', overflow: 'hidden' }}
                    >
                        <div className="modal-header-premium">
                            <h2>💡 Project Ideas</h2>
                            <button className="modal-close-btn" onClick={() => setShowProjectModal(false)}>✕</button>
                        </div>
                        <div className="modal-body-premium" style={{ maxHeight: '70vh' }}>
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
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center', fontSize: '1.05rem' }}>
                                        Projects for: <strong style={{ color: 'var(--accent)' }}>{projectResults.topic}</strong>
                                    </p>

                                    {/* Beginner Section */}
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div className="difficulty-badge difficulty-beginner" style={{ marginBottom: '1rem' }}>
                                            🌱 Beginner
                                        </div>
                                        {projectResults.projects?.beginner?.map((p, i) => renderProjectCard(p, i, 'beginner'))}
                                    </div>

                                    {/* Intermediate Section */}
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div className="difficulty-badge difficulty-intermediate" style={{ marginBottom: '1rem' }}>
                                            ⚡ Intermediate
                                        </div>
                                        {projectResults.projects?.intermediate?.map((p, i) => renderProjectCard(p, i, 'intermediate'))}
                                    </div>

                                    {/* Advanced Section */}
                                    <div>
                                        <div className="difficulty-badge difficulty-advanced" style={{ marginBottom: '1rem' }}>
                                            🏆 Advanced
                                        </div>
                                        {projectResults.projects?.advanced?.map((p, i) => renderProjectCard(p, i, 'advanced'))}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                </ModalOverlay>
            )}

            {/* Full Notes Modal - Premium Design */}
            {showNotesModal && (
                <ModalOverlay onClose={() => setShowNotesModal(false)}>
                    <div
                        className="modal-premium animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '850px', width: '100%', maxHeight: '90vh', overflow: 'hidden' }}
                    >
                        <div className="modal-header-premium">
                            <h2>📝 Study Notes</h2>
                            <button className="modal-close-btn" onClick={() => setShowNotesModal(false)}>✕</button>
                        </div>
                        <div className="modal-body-premium" style={{ maxHeight: '70vh' }}>
                            {loadingNotes ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                    <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                                    <p style={{ color: 'var(--text-muted)' }}>Generating comprehensive notes...</p>
                                </div>
                            ) : fullNotes ? (
                                <>
                                    <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--accent)' }}>{fullNotes.title}</h2>

                                    {fullNotes.sections?.map((section, i) => (
                                        <div key={i} style={{
                                            marginBottom: '2rem',
                                            padding: '1.5rem',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(6, 182, 212, 0.1)'
                                        }}>
                                            <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span>📌</span> {section.heading}
                                            </h3>
                                            <p style={{ lineHeight: 1.8, color: 'var(--text-main)' }}>{section.content}</p>
                                            {section.codeExample && <CodeBlock code={section.codeExample} />}
                                            {section.mathSteps?.length > 0 && (
                                                <div className="math-steps">
                                                    {section.mathSteps.map((step, j) => (
                                                        <div key={j} className="math-step">
                                                            <div className="math-step-number">{j + 1}</div>
                                                            <div>{step}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {fullNotes.summary?.length > 0 && (
                                        <div style={{
                                            padding: '1.5rem',
                                            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(99, 102, 241, 0.05))',
                                            borderRadius: '16px',
                                            marginBottom: '1.5rem'
                                        }}>
                                            <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span>📚</span> Key Takeaways
                                            </h4>
                                            <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                                                {fullNotes.summary.map((s, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    <button
                                        onClick={downloadNotesAsPDF}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            fontSize: '1.05rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        📥 Download as Markdown
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>
                </ModalOverlay>
            )}
        </>
    );
};

export default FeatureCards;

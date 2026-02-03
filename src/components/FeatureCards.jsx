import React, { useState } from 'react';
import { openYouTubeSearch, searchYouTube } from '../services/youtubeService';
import { generateProjectIdeas } from '../services/projectIdeasService';
import { generateProjectTutorial, generateFullNotes } from '../services/gpt4oService';
import { getSettings } from '../services/settingsService';

/**
 * Feature Cards - Enhanced with Go Deeper and PDF Notes
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
        // Create text content for download
        let content = `# ${fullNotes.title}\n\n`;
        fullNotes.sections?.forEach(section => {
            content += `## ${section.heading}\n\n${section.content}\n\n`;
            if (section.codeExample) content += `\`\`\`\n${section.codeExample}\n\`\`\`\n\n`;
            if (section.mathSteps?.length) content += `Steps:\n${section.mathSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;
        });
        if (fullNotes.summary?.length) content += `## Summary\n${fullNotes.summary.map(s => `• ${s}`).join('\n')}\n\n`;

        // Download as text file (PDF would need jsPDF library)
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fullNotes.title || 'notes'}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderProjectCard = (project, i, level) => (
        <div key={i} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem' }}>{project.title}</h4>
                <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', background: 'rgba(99,102,241,0.3)', borderRadius: '4px' }}>
                    ⏱️ {project.timeEstimate}
                </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0', lineHeight: 1.5 }}>
                {project.description}
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {project.skills?.slice(0, 3).map((skill, j) => (
                    <span key={j} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(6,182,212,0.2)', borderRadius: '4px', color: 'var(--accent)' }}>
                        {skill}
                    </span>
                ))}
            </div>
            <button
                onClick={() => handleGoDeeper(project)}
                style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                }}
                onMouseOver={e => e.target.style.transform = 'scale(1.02)'}
                onMouseOut={e => e.target.style.transform = 'scale(1)'}
            >
                🚀 Go Deeper - Start Tutorial
            </button>
        </div>
    );

    const renderTutorial = () => (
        <div style={{ padding: '1rem 0' }}>
            <button onClick={() => { setSelectedProject(null); setProjectTutorial(null); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginBottom: '1rem' }}>
                ← Back to Projects
            </button>
            <h3 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{projectTutorial.title}</h3>

            {projectTutorial.prerequisites?.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>📋 Prerequisites</h4>
                    <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                        {projectTutorial.prerequisites.map((p, i) => <li key={i} style={{ marginBottom: '0.25rem', color: 'var(--text-muted)' }}>{p}</li>)}
                    </ul>
                </div>
            )}

            {projectTutorial.steps?.map((step, i) => (
                <div key={i} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Step {step.stepNumber}: {step.title}</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{step.explanation}</p>
                    {step.code && (
                        <pre style={{ background: '#1a1a2e', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.8rem', color: '#22d3ee' }}>
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

            {/* YouTube Modal */}
            {showYoutubeModal && youtubeResults && (
                <div className="modal-overlay" onClick={() => setShowYoutubeModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="glass-card animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%', padding: '2rem', maxHeight: '85vh', overflow: 'auto' }}>
                        <h2 style={{ marginBottom: '1rem' }}>🎬 YouTube Tutorials</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Topic: <strong style={{ color: 'var(--accent)' }}>{youtubeResults.topic}</strong></p>
                        <button className="btn-primary" onClick={() => { openYouTubeSearch(currentTopic || 'study tips'); setShowYoutubeModal(false); }} style={{ width: '100%', marginBottom: '1rem', padding: '0.8rem' }}>🚀 Search YouTube</button>
                        {youtubeResults.suggestions.map((s, i) => (
                            <a key={i} href={s.searchUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '0.75rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)', textDecoration: 'none', color: 'var(--text-main)' }}>
                                <div style={{ fontWeight: 600 }}>{s.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.description}</div>
                            </a>
                        ))}
                        <button className="btn-text" onClick={() => setShowYoutubeModal(false)} style={{ width: '100%', marginTop: '1rem' }}>Close</button>
                    </div>
                </div>
            )}

            {/* Project Ideas Modal - IMPROVED LAYOUT */}
            {showProjectModal && (
                <div className="modal-overlay" onClick={() => setShowProjectModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="glass-card animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', width: '100%', padding: '1.5rem', maxHeight: '90vh', overflow: 'auto', background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(6,182,212,0.3)' }}>

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
                                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Projects for: <strong style={{ color: 'var(--accent)' }}>{projectResults.topic}</strong></p>
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

                        <button className="btn-text" onClick={() => setShowProjectModal(false)} style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem' }}>Close</button>
                    </div>
                </div>
            )}

            {/* Full Notes Modal */}
            {showNotesModal && (
                <div className="modal-overlay" onClick={() => setShowNotesModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="glass-card animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '100%', padding: '2rem', maxHeight: '90vh', overflow: 'auto' }}>
                        {loadingNotes ? (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                                <p style={{ color: 'var(--text-muted)' }}>Generating comprehensive notes...</p>
                            </div>
                        ) : fullNotes ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ margin: 0 }}>📝 {fullNotes.title}</h2>
                                    <button className="btn-primary" onClick={downloadNotesAsPDF} style={{ padding: '0.5rem 1rem' }}>📥 Download</button>
                                </div>
                                {fullNotes.sections?.map((section, i) => (
                                    <div key={i} style={{ marginBottom: '1.5rem' }}>
                                        <h3 style={{ color: 'var(--accent)', marginBottom: '0.75rem', fontSize: '1.1rem' }}>{section.heading}</h3>
                                        <p style={{ lineHeight: 1.7, color: 'var(--text-muted)' }}>{section.content}</p>
                                        {section.codeExample && (
                                            <pre style={{ background: '#1a1a2e', padding: '1rem', borderRadius: '8px', overflow: 'auto', margin: '1rem 0', fontSize: '0.85rem', color: '#22d3ee' }}>
                                                <code>{section.codeExample}</code>
                                            </pre>
                                        )}
                                        {section.mathSteps?.length > 0 && (
                                            <div style={{ background: 'rgba(99,102,241,0.1)', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                                                <strong>Step-by-step:</strong>
                                                <ol style={{ margin: '0.5rem 0 0 1.5rem' }}>
                                                    {section.mathSteps.map((step, j) => <li key={j}>{step}</li>)}
                                                </ol>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {fullNotes.practiceQuestions?.length > 0 && (
                                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(52,211,153,0.1)', borderRadius: '8px' }}>
                                        <h4 style={{ marginBottom: '1rem' }}>📚 Practice Questions</h4>
                                        {fullNotes.practiceQuestions.map((q, i) => (
                                            <details key={i} style={{ marginBottom: '0.5rem' }}>
                                                <summary style={{ cursor: 'pointer', fontWeight: 500 }}>{q.question}</summary>
                                                <p style={{ marginTop: '0.5rem', paddingLeft: '1rem', color: 'var(--text-muted)' }}>💡 {q.answer}</p>
                                            </details>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : null}
                        <button className="btn-text" onClick={() => setShowNotesModal(false)} style={{ width: '100%', marginTop: '1.5rem' }}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default FeatureCards;

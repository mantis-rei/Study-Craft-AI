import React, { useState } from 'react';
import { openYouTubeSearch, searchYouTube } from '../services/youtubeService';
import { generateProjectIdeas } from '../services/projectIdeasService';
import { getSettings } from '../services/settingsService';

/**
 * Feature Cards - Landing Page
 * ALL CARDS NOW FUNCTIONAL
 */
const FeatureCards = ({ onSelectFeature, currentTopic, onOpenDeepStudy }) => {
    const [youtubeResults, setYoutubeResults] = useState(null);
    const [showYoutubeModal, setShowYoutubeModal] = useState(false);
    const [projectResults, setProjectResults] = useState(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [loadingProjects, setLoadingProjects] = useState(false);

    const features = [
        {
            id: 'notes',
            icon: '📝',
            title: 'Generate\nNotes',
            description: 'Create comprehensive study notes',
            color: '#a78bfa',
            action: 'generate'
        },
        {
            id: 'slides',
            icon: '🎯',
            title: 'Presentation\nSlides',
            description: 'Build engaging slide decks',
            color: '#60a5fa',
            action: 'generate'
        },
        {
            id: 'quiz',
            icon: '❓',
            title: 'Questions &\nAnswers',
            description: 'Test your knowledge with quizzes',
            color: '#34d399',
            action: 'generate'
        },
        {
            id: 'projects',
            icon: '💡',
            title: 'Project\nIdeas',
            description: 'Get inspired with creative projects',
            color: '#f59e0b',
            action: 'projects'
        },
        {
            id: 'youtube',
            icon: '🎬',
            title: 'YouTube\nTutorials',
            description: 'Find video tutorials on the topic',
            color: '#ef4444',
            action: 'youtube'
        }
    ];

    const handleCardClick = async (feature) => {
        if (feature.action === 'youtube') {
            const topic = currentTopic || 'study tips';
            const results = await searchYouTube(topic);
            setYoutubeResults(results);
            setShowYoutubeModal(true);
        } else if (feature.action === 'projects') {
            // Project Ideas - FUNCTIONAL!
            const topic = currentTopic || 'programming';
            setLoadingProjects(true);
            setShowProjectModal(true);
            try {
                const settings = getSettings();
                const results = await generateProjectIdeas(topic, settings.openrouter_api_key);
                setProjectResults(results);
            } catch (error) {
                console.error('Project ideas error:', error);
            }
            setLoadingProjects(false);
        } else {
            onSelectFeature(feature.id);
        }
    };

    const handleQuickYouTubeSearch = () => {
        const topic = currentTopic || 'study tips educational';
        openYouTubeSearch(topic);
        setShowYoutubeModal(false);
    };

    const renderProjectLevel = (level, projects, emoji) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.75rem', color: 'var(--accent)' }}>{emoji} {level}</h4>
            {projects?.map((project, i) => (
                <div key={i} className="glass-card" style={{ padding: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{project.title}</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        {project.description}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(99,102,241,0.2)', borderRadius: '4px' }}>
                            ⏱️ {project.timeEstimate}
                        </span>
                        {project.skills?.map((skill, j) => (
                            <span key={j} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(6,182,212,0.2)', borderRadius: '4px' }}>
                                {skill}
                            </span>
                        ))}
                    </div>
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

                            {(feature.action === 'youtube' || feature.action === 'projects') && (
                                <span style={{
                                    position: 'absolute',
                                    bottom: '0.5rem',
                                    right: '0.5rem',
                                    fontSize: '0.7rem',
                                    color: 'var(--accent)',
                                    opacity: 0.7
                                }}>
                                    {feature.action === 'youtube' ? 'Opens search →' : 'AI generates →'}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* YouTube Modal */}
            {showYoutubeModal && youtubeResults && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowYoutubeModal(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem'
                    }}
                >
                    <div
                        className="glass-card animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '500px', width: '100%', padding: '2rem', maxHeight: '80vh', overflow: 'auto' }}
                    >
                        <h2 style={{ marginBottom: '1rem' }}>🎬 YouTube Tutorials</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Searching for: <strong style={{ color: 'var(--accent)' }}>{youtubeResults.topic}</strong>
                        </p>
                        <button className="btn-primary" onClick={handleQuickYouTubeSearch} style={{ width: '100%', marginBottom: '1.5rem', padding: '1rem' }}>
                            🚀 Search YouTube Now
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {youtubeResults.suggestions.map((suggestion, index) => (
                                <a key={index} href={suggestion.searchUrl} target="_blank" rel="noopener noreferrer"
                                    style={{
                                        display: 'block', padding: '1rem', background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '8px', border: '1px solid var(--glass-border)',
                                        textDecoration: 'none', color: 'var(--text-main)', transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                                >
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{suggestion.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{suggestion.description}</div>
                                </a>
                            ))}
                        </div>
                        <button className="btn-text" onClick={() => setShowYoutubeModal(false)} style={{ width: '100%', marginTop: '1.5rem' }}>Close</button>
                    </div>
                </div>
            )}

            {/* Project Ideas Modal */}
            {showProjectModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowProjectModal(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem'
                    }}
                >
                    <div
                        className="glass-card animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '600px', width: '100%', padding: '2rem', maxHeight: '80vh', overflow: 'auto' }}
                    >
                        <h2 style={{ marginBottom: '1rem' }}>💡 Project Ideas</h2>
                        {loadingProjects ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                                <p style={{ color: 'var(--text-muted)' }}>AI is generating project ideas...</p>
                            </div>
                        ) : projectResults ? (
                            <>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    Projects for: <strong style={{ color: 'var(--accent)' }}>{projectResults.topic}</strong>
                                </p>
                                {renderProjectLevel('Beginner', projectResults.projects?.beginner, '🌱')}
                                {renderProjectLevel('Intermediate', projectResults.projects?.intermediate, '⚡')}
                                {renderProjectLevel('Advanced', projectResults.projects?.advanced, '🏆')}
                            </>
                        ) : null}
                        <button className="btn-text" onClick={() => setShowProjectModal(false)} style={{ width: '100%', marginTop: '1rem' }}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default FeatureCards;

import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../services/settingsService';

const SettingsPanel = ({ isOpen, onClose }) => {
    const [settings, setSettings] = useState(getSettings());
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSettings(getSettings());
            setSaved(false);
        }
    }, [isOpen]);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 999,
                    animation: 'fadeIn 0.2s ease'
                }}
            />

            {/* Settings Modal */}
            <div
                className="glass-card"
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    width: '90%',
                    maxWidth: '600px',
                    maxHeight: '85vh',
                    overflow: 'auto',
                    padding: '2rem',
                    animation: 'slideUp 0.3s ease'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{
                        fontSize: '1.8rem',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem'
                    }}>
                        ⚙️ Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn-text"
                        style={{
                            margin: 0,
                            fontSize: '1.5rem',
                            width: '40px',
                            height: '40px',
                            padding: 0
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Learning Mode Section */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: '1rem',
                        color: 'var(--accent)'
                    }}>
                        🎯 Learning Mode
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem'
                    }}>
                        {/* Mock Mode Card */}
                        <div
                            onClick={() => handleChange('learning_mode', 'mock')}
                            className="glass-card"
                            style={{
                                padding: '1.2rem',
                                cursor: 'pointer',
                                border: settings.learning_mode === 'mock'
                                    ? '2px solid var(--accent)'
                                    : '1px solid var(--glass-border)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌐</div>
                            <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
                                Smart Mock
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Free • Wikipedia-powered
                            </div>
                        </div>

                        {/* AI Mode Card */}
                        <div
                            onClick={() => handleChange('learning_mode', 'ai')}
                            className="glass-card"
                            style={{
                                padding: '1.2rem',
                                cursor: 'pointer',
                                border: settings.learning_mode === 'ai'
                                    ? '2px solid var(--accent)'
                                    : '1px solid var(--glass-border)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
                            <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
                                AI Mode
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Gemini API • Advanced
                            </div>
                        </div>
                    </div>

                    {/* Mode Description */}
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        lineHeight: '1.6'
                    }}>
                        {settings.learning_mode === 'mock' ? (
                            <>
                                <strong>Smart Mock Mode:</strong> Fetches real information from Wikipedia.
                                Works for any topic without needing an API key. Great for quick study sessions!
                            </>
                        ) : (
                            <>
                                <strong>AI Mode:</strong> Uses Google Gemini for advanced, customized content.
                                Requires an API key but provides superior study materials.
                            </>
                        )}
                    </div>
                </section>

                {/* API Keys Section */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: '1rem',
                        color: 'var(--accent)'
                    }}>
                        🔑 API Configuration
                    </h3>

                    {/* Gemini API Key */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            Gemini API Key {settings.learning_mode === 'ai' && <span style={{ color: '#ef4444' }}>*</span>}
                        </label>
                        <input
                            type="password"
                            value={settings.gemini_api_key}
                            onChange={(e) => handleChange('gemini_api_key', e.target.value)}
                            placeholder="AIza..."
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                fontSize: '0.95rem',
                                fontFamily: 'monospace'
                            }}
                        />
                        <div style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.4rem'
                        }}>
                            Get your key from <a
                                href="https://makersuite.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--accent)' }}
                            >
                                Google AI Studio
                            </a>
                        </div>
                    </div>

                    {/* OpenRouter API Key */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            🤖 OpenRouter API Key <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#a5b4fc' }}>(⭐ Recommended - FREE!)</span>
                        </label>
                        <input
                            type="password"
                            value={settings.openrouter_api_key}
                            onChange={(e) => handleChange('openrouter_api_key', e.target.value)}
                            placeholder="sk-or-v1-..."
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(99,102,241,0.4)',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                fontSize: '0.95rem',
                                fontFamily: 'monospace'
                            }}
                        />
                        <div style={{
                            fontSize: '0.8rem',
                            color: 'rgba(165,180,252,0.9)',
                            marginTop: '0.4rem'
                        }}>
                            FREE: DeepSeek R1 (academic), Gemini 2.0, MiMo! Get from <a
                                href="https://openrouter.ai/keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: 'var(--accent)' }}
                            >
                                OpenRouter
                            </a>
                        </div>
                    </div>

                    {/* Unsplash API Key */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            Unsplash API Key <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
                        </label>
                        <input
                            type="password"
                            value={settings.unsplash_api_key}
                            onChange={(e) => handleChange('unsplash_api_key', e.target.value)}
                            placeholder="Leave empty for mock images"
                            style={{
                                width: '100%',
                                padding: '0.8rem 1rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                fontSize: '0.95rem',
                                fontFamily: 'monospace'
                            }}
                        />
                    </div>
                </section>

                {/* Preferences Section */}
                <section style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: '1rem',
                        color: 'var(--accent)'
                    }}>
                        🎨 Preferences
                    </h3>

                    {/* Auto-fetch Images Toggle */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>
                                Auto-fetch Images
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Automatically load educational images
                            </div>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={settings.auto_fetch_images}
                                onChange={(e) => handleChange('auto_fetch_images', e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {/* Default Difficulty */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.8rem',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            Default Difficulty Level
                        </label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '0.8rem'
                        }}>
                            {['beginner', 'intermediate', 'advanced'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => handleChange('default_difficulty', level)}
                                    className="btn-text"
                                    style={{
                                        margin: 0,
                                        padding: '0.6rem',
                                        background: settings.default_difficulty === level
                                            ? 'var(--primary)'
                                            : 'rgba(255,255,255,0.05)',
                                        border: settings.default_difficulty === level
                                            ? '1px solid var(--primary)'
                                            : '1px solid var(--glass-border)',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer Actions */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--glass-border)'
                }}>
                    <button
                        onClick={handleSave}
                        className="btn-primary"
                        style={{
                            flex: 1,
                            margin: 0
                        }}
                    >
                        {saved ? '✓ Saved!' : 'Save Settings'}
                    </button>
                    <button
                        onClick={onClose}
                        className="btn-text"
                        style={{
                            margin: 0,
                            padding: '0.8rem 1.5rem'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </>
    );
};

export default SettingsPanel;

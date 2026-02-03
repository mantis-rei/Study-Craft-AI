import React, { useState, useEffect } from 'react';
import speechService, { formatNotesForSpeech } from '../services/speechService';

const AudioPlayer = ({ notes }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [rate, setRate] = useState(1.0);
    const [selectedVoice, setSelectedVoice] = useState(0);
    const [voices, setVoices] = useState([]);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        // Load voices
        const loadVoices = () => {
            const availableVoices = speechService.getVoices();
            setVoices(availableVoices);
        };

        loadVoices();
        // Reload voices if they change (Chrome)
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Cleanup on unmount
        return () => {
            speechService.cancel();
        };
    }, []);

    const handlePlay = () => {
        if (isPaused) {
            speechService.resume();
            setIsPaused(false);
            setIsPlaying(true);
        } else {
            const text = formatNotesForSpeech(notes);
            speechService.speak(text, {
                rate,
                voiceIndex: selectedVoice,
                onStart: () => {
                    setIsPlaying(true);
                    setIsPaused(false);
                },
                onEnd: () => {
                    setIsPlaying(false);
                    setIsPaused(false);
                }
            });
        }
    };

    const handlePause = () => {
        speechService.pause();
        setIsPaused(true);
        setIsPlaying(false);
    };

    const handleStop = () => {
        speechService.cancel();
        setIsPlaying(false);
        setIsPaused(false);
    };

    const handleRateChange = (newRate) => {
        setRate(newRate);
        // If currently playing, restart with new rate
        if (isPlaying) {
            handleStop();
            setTimeout(() => {
                const text = formatNotesForSpeech(notes);
                speechService.speak(text, {
                    rate: newRate,
                    voiceIndex: selectedVoice,
                    onStart: () => setIsPlaying(true),
                    onEnd: () => setIsPlaying(false)
                });
            }, 100);
        }
    };

    if (!notes || notes.length === 0) return null;

    return (
        <div className="glass-card animate-fade-in" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{
                    fontSize: '1.1rem',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    🔊 Listen to Notes
                </h3>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="btn-text"
                    style={{ margin: 0, fontSize: '0.85rem' }}
                >
                    ⚙️ {showSettings ? 'Hide' : 'Settings'}
                </button>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="animate-fade-in" style={{
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px'
                }}>
                    {/* Speed Control */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                            Speed: {rate}x
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button
                                onClick={() => handleRateChange(0.5)}
                                className="btn-text"
                                style={{
                                    margin: 0,
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem',
                                    background: rate === 0.5 ? 'var(--primary)' : 'transparent'
                                }}
                            >
                                0.5x
                            </button>
                            <button
                                onClick={() => handleRateChange(0.75)}
                                className="btn-text"
                                style={{
                                    margin: 0,
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem',
                                    background: rate === 0.75 ? 'var(--primary)' : 'transparent'
                                }}
                            >
                                0.75x
                            </button>
                            <button
                                onClick={() => handleRateChange(1.0)}
                                className="btn-text"
                                style={{
                                    margin: 0,
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem',
                                    background: rate === 1.0 ? 'var(--primary)' : 'transparent'
                                }}
                            >
                                1x
                            </button>
                            <button
                                onClick={() => handleRateChange(1.25)}
                                className="btn-text"
                                style={{
                                    margin: 0,
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem',
                                    background: rate === 1.25 ? 'var(--primary)' : 'transparent'
                                }}
                            >
                                1.25x
                            </button>
                            <button
                                onClick={() => handleRateChange(1.5)}
                                className="btn-text"
                                style={{
                                    margin: 0,
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem',
                                    background: rate === 1.5 ? 'var(--primary)' : 'transparent'
                                }}
                            >
                                1.5x
                            </button>
                        </div>
                    </div>

                    {/* Voice Selection */}
                    {voices.length > 0 && (
                        <div>
                            <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                                Voice
                            </label>
                            <select
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '0.6rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '6px',
                                    color: 'var(--text)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {voices.map((voice, index) => (
                                    <option key={index} value={index}>
                                        {voice.name} ({voice.lang})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            {/* Playback Controls */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {!isPlaying && !isPaused ? (
                    <button
                        onClick={handlePlay}
                        className="btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.8rem 1.5rem',
                            fontSize: '1rem'
                        }}
                    >
                        ▶️ Play
                    </button>
                ) : (
                    <>
                        {isPlaying ? (
                            <button
                                onClick={handlePause}
                                className="btn-primary"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.8rem 1.5rem'
                                }}
                            >
                                ⏸️ Pause
                            </button>
                        ) : (
                            <button
                                onClick={handlePlay}
                                className="btn-primary"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.8rem 1.5rem'
                                }}
                            >
                                ▶️ Resume
                            </button>
                        )}
                        <button
                            onClick={handleStop}
                            className="btn-text"
                            style={{
                                margin: 0,
                                padding: '0.8rem 1.5rem',
                                border: '1px solid var(--glass-border)'
                            }}
                        >
                            ⏹️ Stop
                        </button>
                    </>
                )}
            </div>

            <p style={{
                marginTop: '1rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textAlign: 'center'
            }}>
                {isPlaying ? '🎙️ Currently reading...' : isPaused ? '⏸️ Paused' : '🎧 Auditory learning mode'}
            </p>
        </div>
    );
};

export default AudioPlayer;

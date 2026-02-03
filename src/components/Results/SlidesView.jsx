import React, { useState } from 'react';

const SlidesView = ({ slides }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    if (!slides || slides.length === 0) return null;

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    const slide = slides[currentSlide];

    return (
        <div className="glass-card animate-fade-in" style={{ padding: '0', overflow: 'hidden', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>

            {/* Slide Content Area */}
            <div style={{ flex: 1, padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="animate-slide-up" key={currentSlide}>
                    <h2 style={{
                        fontSize: '2rem',
                        marginBottom: '2rem',
                        background: 'linear-gradient(to right, #fff, #a5b4fc)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {slide.title}
                    </h2>

                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {slide.bulletPoints.map((point, idx) => (
                            <li key={idx} style={{
                                fontSize: '1.25rem',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'baseline',
                                color: 'var(--text-main)'
                            }}>
                                <span style={{
                                    display: 'inline-block',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--accent)',
                                    marginRight: '1rem',
                                    flexShrink: 0
                                }}></span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Controls Bar */}
            <div style={{
                padding: '1.5rem 2rem',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--glass-border)'
            }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Slide {currentSlide + 1} of {slides.length}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handlePrev}
                        disabled={currentSlide === 0}
                        className="btn-primary"
                        style={{
                            width: 'auto',
                            padding: '0.6rem 1.2rem',
                            opacity: currentSlide === 0 ? 0.3 : 1
                        }}
                    >
                        ← Prev
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentSlide === slides.length - 1}
                        className="btn-primary"
                        style={{
                            width: 'auto',
                            padding: '0.6rem 1.2rem',
                            opacity: currentSlide === slides.length - 1 ? 0.3 : 1
                        }}
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SlidesView;

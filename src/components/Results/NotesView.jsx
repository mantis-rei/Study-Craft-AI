import React, { useState } from 'react';
import AudioPlayer from '../AudioPlayer';

const ImageModal = ({ image, onClose }) => {
    if (!image) return null;

    return (
        <div
            className="image-modal-overlay"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                cursor: 'pointer'
            }}
        >
            <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                <img
                    src={image.url}
                    alt={image.description}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '90vh',
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: '1rem',
                    right: '1rem',
                    background: 'rgba(0,0,0,0.7)',
                    borderRadius: '8px',
                    padding: '0.8rem',
                    color: 'white',
                    backdropFilter: 'blur(10px)'
                }}>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{image.description}</p>
                    <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>
                        Photo by {image.photographer}
                    </p>
                </div>
            </div>
        </div>
    );
};

const ImageGallery = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState(null);

    if (!images || images.length === 0) return null;

    return (
        <>
            <div style={{ marginTop: '2rem' }}>
                <h3 style={{
                    fontSize: '1.1rem',
                    marginBottom: '1rem',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    🖼️ Visual Learning
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                }}>
                    {images.map((image, index) => (
                        <div
                            key={index}
                            onClick={() => setSelectedImage(image)}
                            className="glass-card animate-fade-in"
                            style={{
                                padding: '0.5rem',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                overflow: 'hidden',
                                animationDelay: `${index * 0.1}s`
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                width: '100%',
                                paddingBottom: '66.67%',
                                position: 'relative',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={image.url}
                                    alt={image.description}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                            <p style={{
                                marginTop: '0.5rem',
                                fontSize: '0.85rem',
                                color: 'var(--text-muted)',
                                textAlign: 'center'
                            }}>
                                {image.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <ImageModal
                image={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </>
    );
};

const NotesView = ({ notes, images }) => {
    if (!notes || notes.length === 0) return null;

    return (
        <div className="glass-card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>📚 Study Notes</h2>
                <button
                    className="btn-text"
                    style={{ margin: 0, fontSize: '0.9rem' }}
                    onClick={() => navigator.clipboard.writeText(notes.join('\n\n'))}
                >
                    📋 Copy
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notes.map((note, index) => (
                    <div key={index} style={{
                        paddingLeft: '1rem',
                        borderLeft: '2px solid var(--primary)',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '0.8rem 1rem',
                        borderRadius: '0 8px 8px 0',
                        fontSize: '1.05rem'
                    }}>
                        {note}
                    </div>
                ))}
            </div>

            {/* Visual Learning Gallery */}
            <ImageGallery images={images} />

            {/* Audio Player for Auditory Learning */}
            <AudioPlayer notes={notes} />
        </div>
    );
};

export default NotesView;

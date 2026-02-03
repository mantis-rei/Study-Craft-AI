import React, { useState } from 'react';
import { signInWithGoogle } from '../services/authService';

/**
 * Login Page - Animated Background
 * Uses Animating_BG.gif as background
 */
const LoginPage = () => {
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Google sign-in error:', error);
            alert('Failed to sign in with Google');
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            {/* Animated GIF Background */}
            <div className="login-background">
                <img
                    src="/Animating_BG.gif"
                    alt="Animated tech background"
                    className="login-bg-gif"
                />
                <div className="login-gradient-overlay"></div>
            </div>

            {/* Login Card */}
            <div className="login-container">
                <div className="login-card glass-card">
                    {/* Logo/Brand */}
                    <div className="login-header">
                        <h1 className="login-title">
                            <span className="neon-text">Study Craft AI</span>
                        </h1>
                        <p className="login-subtitle">
                            Transform any topic into comprehensive study materials instantly
                        </p>
                    </div>

                    {/* Feature Highlights */}
                    <div className="login-features">
                        <div className="login-feature">
                            <span className="feature-emoji">📝</span>
                            <span>AI-Generated Notes</span>
                        </div>
                        <div className="login-feature">
                            <span className="feature-emoji">🎯</span>
                            <span>Interactive Quizzes</span>
                        </div>
                        <div className="login-feature">
                            <span className="feature-emoji">🎬</span>
                            <span>Video Tutorials</span>
                        </div>
                    </div>

                    {/* Login Button */}
                    <div className="login-buttons">
                        <button
                            className="btn-primary login-btn"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            style={{ width: '100%' }}
                        >
                            {loading ? '⏳ Signing in...' : '🚀 Sign in with Google'}
                        </button>
                    </div>

                    {/* Footer Info */}
                    <div className="login-footer">
                        <p>Free to use • No credit card required • Instant access</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

import React, { useState, useRef, useEffect } from 'react';
import { signOutUser } from '../services/authService';

const UserProfile = ({ user, compact = false }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const handleSignOut = async () => {
        try {
            await signOutUser();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    // Compact mode for header
    if (compact) {
        return (
            <div className="user-profile-compact" ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    style={{
                        background: 'none',
                        border: '2px solid var(--glass-border)',
                        borderRadius: '50%',
                        padding: 0,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    {user.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.displayName}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                display: 'block'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: 'white'
                        }}>
                            {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                        </div>
                    )}
                </button>

                {/* Dropdown */}
                {showDropdown && (
                    <div
                        className="glass-card animate-slide-down"
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            minWidth: '220px',
                            padding: '1rem',
                            zIndex: 100,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                        }}
                    >
                        <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                {user.displayName || 'Student'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                                {user.email}
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="btn-text"
                            style={{
                                width: '100%',
                                padding: '0.6rem 1rem',
                                fontSize: '0.9rem',
                                textAlign: 'center'
                            }}
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Full mode (legacy, for backwards compatibility)
    return (
        <div className="glass-card" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            marginBottom: '2rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={user.displayName}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: '2px solid var(--primary)'
                        }}
                    />
                ) : (
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 700
                    }}>
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                    </div>
                )}
                <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {user.displayName || 'Student'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {user.email}
                    </div>
                </div>
            </div>
            <button
                onClick={handleSignOut}
                className="btn-text"
                style={{ margin: 0, padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
                Sign Out
            </button>
        </div>
    );
};

export default UserProfile;

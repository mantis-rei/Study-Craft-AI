import React, { useState } from 'react';
import { trackPerformance } from '../../services/adaptiveService';

const QuizItem = ({ item, index, onAnswer }) => {
    const [selectedIndex, setSelectedIndex] = useState(null);

    const handleSelect = (idx) => {
        if (selectedIndex !== null) return; // Lock answer
        setSelectedIndex(idx);
        const isCorrect = idx === item.correctIndex;
        onAnswer({ question: item.question, correct: isCorrect, userAnswer: idx });
    };

    const isAnswered = selectedIndex !== null;
    const isCorrect = selectedIndex === item.correctIndex;

    return (
        <div style={{
            marginBottom: '2rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--glass-border)'
        }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
                {index + 1}. {item.question}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {item.options.map((option, optIdx) => {
                    let style = {
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid transparent'
                    };

                    if (isAnswered) {
                        if (optIdx === item.correctIndex) {
                            style.background = 'rgba(16, 185, 129, 0.2)';
                            style.border = '1px solid #10b981';
                        } else if (optIdx === selectedIndex && selectedIndex !== item.correctIndex) {
                            style.background = 'rgba(239, 68, 68, 0.2)';
                            style.border = '1px solid #ef4444';
                        } else {
                            style.opacity = 0.5;
                        }
                        style.cursor = 'default';
                    }

                    return (
                        <div
                            key={optIdx}
                            onClick={() => handleSelect(optIdx)}
                            style={style}
                            className={!isAnswered ? "quiz-option-hover" : ""}
                        >
                            {option}
                        </div>
                    );
                })}
            </div>

            {isAnswered && (
                <div className="animate-fade-in" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 600, color: isCorrect ? '#10b981' : '#ef4444', marginBottom: '0.4rem' }}>
                        {isCorrect ? '✅ Correct — nice work!' : '❌ Not quite — here’s why:'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {item.explanation}
                    </div>
                </div>
            )}
        </div>
    );
};

const QuizView = ({ quiz, topic }) => {
    const [score, setScore] = useState(0);
    const [answeredCount, setAnsweredCount] = useState(0);
    const [showScorecard, setShowScorecard] = useState(false);
    const [quizResults, setQuizResults] = useState([]);

    if (!quiz || quiz.length === 0) return null;

    const handleAnswer = (result) => {
        if (result.correct) setScore(prev => prev + 1);

        setQuizResults(prev => [...prev, result]);

        setAnsweredCount(prev => {
            const newCount = prev + 1;
            if (newCount === quiz.length) {
                // Track performance for adaptive learning
                const allResults = [...quizResults, result];
                if (topic) {
                    trackPerformance(topic, allResults);
                }
                setTimeout(() => setShowScorecard(true), 1500); // Delay for effect
            }
            return newCount;
        });
    };

    return (
        <div className="glass-card animate-fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Check Your Understanding</h2>

            {!showScorecard ? (
                <div>
                    {quiz.map((item, index) => (
                        <QuizItem key={index} item={item} index={index} onAnswer={handleAnswer} />
                    ))}
                </div>
            ) : (
                <div className="animate-slide-up" style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                        {score === quiz.length ? '🌟' : score > quiz.length / 2 ? '👍' : '📚'}
                    </div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Quiz Complete!</h3>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        You scored <strong style={{ color: 'var(--accent)' }}>{score}</strong> out of {quiz.length}
                    </p>
                    <button
                        className="btn-primary"
                        onClick={() => setShowScorecard(false)}
                        style={{ maxWidth: '200px', margin: '0 auto' }}
                    >
                        Review Answers
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizView;

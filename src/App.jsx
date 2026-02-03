import React, { useState, useEffect, lazy, Suspense } from 'react';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';
import SettingsPanel from './components/SettingsPanel';
import MagneticParticles from './components/MagneticParticles';
import FeatureCards from './components/FeatureCards';
import InputSection from './components/InputSection';
import { generateContent } from './services/geminiService';
import { generateWithOpenRouter } from './services/openRouterService';
import { generateWithGPT4o } from './services/gpt4oService';
import { fetchEducationalMedia } from './services/pexelsService';
import { generateFlashcards } from './services/flashcardService';
import { generateFromWikipedia } from './services/wikipediaService';
import { getSettings } from './services/settingsService';
import { onAuthChange } from './services/authService';
import { downloadMarkdown, printMaterials } from './services/exportService';


// Lazy load heavy result components
const NotesView = lazy(() => import('./components/Results/NotesView'));
const QuizView = lazy(() => import('./components/Results/QuizView'));
const SlidesView = lazy(() => import('./components/Results/SlidesView'));
const FlashcardsView = lazy(() => import('./components/Results/FlashcardsView'));
const AdaptiveFeedback = lazy(() => import('./components/AdaptiveFeedback'));
const DeepStudyView = lazy(() => import('./components/Results/DeepStudyView'));

// View State Machine
const VIEWS = {
  LANDING: 'landing',
  GENERATING: 'generating',
  RESULTS: 'results',
  DEEP_STUDY: 'deep_study',
  ERROR: 'error'
};

function App() {
  // Auth
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // UI State
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState(VIEWS.LANDING);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Data State
  const [topic, setTopic] = useState('');
  const [data, setData] = useState(null);
  const [intents, setIntents] = useState({
    notes: true,
    slides: true,
    quiz: true,
    flashcards: true
  });

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGenerate = async (searchTopic) => {
    const currentTopic = searchTopic || topic;
    if (!currentTopic.trim()) return;

    setCurrentView(VIEWS.GENERATING);
    setData(null);

    try {
      const settings = getSettings();
      const useAI = settings.learning_mode === 'ai';
      let result;

      // Priority: GPT-4o → Gemini → Wikipedia (smart fallback)
      if (useAI) {
        // Try GPT-4o Mini first (RapidAPI - most reliable)
        try {
          console.log('🚀 Using GPT-4o Mini API');
          result = await generateWithGPT4o(currentTopic, settings.rapidapi_key);
        } catch (gptError) {
          console.warn('⚠️ GPT-4o failed:', gptError.message);

          // Fallback to Gemini
          if (settings.gemini_api_key) {
            try {
              console.log('🌟 Falling back to Gemini API');
              result = await generateContent(currentTopic, settings.gemini_api_key);
            } catch (geminiError) {
              console.warn('⚠️ Gemini also failed:', geminiError.message);

              // Fallback to OpenRouter if available
              if (settings.openrouter_api_key) {
                try {
                  console.log('🤖 Trying OpenRouter API');
                  result = await generateWithOpenRouter(currentTopic, settings.openrouter_api_key);
                } catch (routerError) {
                  console.warn('⚠️ OpenRouter failed, using Wikipedia');
                  result = await generateFromWikipedia(currentTopic);
                }
              } else {
                result = await generateFromWikipedia(currentTopic);
              }
            }
          } else {
            console.log('📚 Using Wikipedia as fallback');
            result = await generateFromWikipedia(currentTopic);
          }
        }
      } else {
        // Mock mode - use Wikipedia
        console.log('📚 Using Wikipedia mode');
        result = await generateFromWikipedia(currentTopic);
      }

      // Fetch media from Pexels
      if (settings.auto_fetch_images) {
        const pexelsKey = settings.pexels_api_key || '';
        console.log(`🎬 Fetching media for: "${currentTopic}"`);
        const media = await fetchEducationalMedia(currentTopic.trim(), pexelsKey);
        result.images = media.images;
        result.videos = media.videos;
      }

      // Generate flashcards
      result.flashcards = generateFlashcards(result.notes, result.quiz);

      setData(result);
      setCurrentView(VIEWS.RESULTS);
    } catch (error) {
      console.error('Generation error:', error);
      setCurrentView(VIEWS.ERROR);
    }
  };

  const handleReset = () => {
    setCurrentView(VIEWS.LANDING);
    setData(null);
    setTopic('');
  };

  const handleGoDeeper = () => {
    setCurrentView(VIEWS.DEEP_STUDY);
  };

  const handleExport = (format) => {
    if (!data || !topic) return;
    if (format === 'markdown') {
      downloadMarkdown(topic, data);
    } else if (format === 'print') {
      printMaterials(topic, data);
    }
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--accent)' }}>Loading Study Craft AI...</p>
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return <LoginPage />;
  }

  // Main App
  return (
    <div className="app-root">
      {/* Optimized Background */}
      <div className="app-background" style={{ backgroundImage: 'url("/assets/hero-bg.png")' }} />
      <MagneticParticles />

      {/* Settings Modal */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Main Container */}
      <div className="app-main">

        {/* Compact Header */}
        <header className="app-header">
          <div className="header-brand" onClick={handleReset} style={{ cursor: 'pointer' }}>
            <h1>Study Craft AI</h1>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setSettingsOpen(true)} title="Settings">
              ⚙️
            </button>
            <UserProfile user={user} compact />
          </div>
        </header>

        {/* Hero Section - Always Visible */}
        <section className="hero-section">
          {currentView === VIEWS.LANDING && (
            <>
              <div className="hero-text animate-fade-in">
                <h2>Master Any Topic <span className="accent-text">Instantly</span></h2>
                <p>Transform complex subjects into study notes, quizzes, slides, and flashcards.</p>
              </div>

              {/* Feature Cards */}
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <FeatureCards
                  currentTopic={topic}
                  onSelectFeature={(id) => {
                    console.log('Selected:', id);
                    document.querySelector('.pro-search-container input')?.focus();
                  }}
                />
              </div>
            </>
          )}

          {currentView === VIEWS.GENERATING && (
            <div className="generating-state animate-fade-in">
              <div className="generating-animation">
                <div className="pulse-ring"></div>
                <span style={{ fontSize: '3rem' }}>🧠</span>
              </div>
              <h3>Crafting your study materials...</h3>
              <p style={{ color: 'var(--text-muted)' }}>Analyzing "{topic}" with AI</p>
            </div>
          )}

          {currentView === VIEWS.ERROR && (
            <div className="error-state animate-fade-in">
              <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>⚠️</span>
              <h3>Something went wrong</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Please check your API settings or try a different topic.
              </p>
              <button className="btn-primary" onClick={handleReset}>Try Again</button>
            </div>
          )}
        </section>

        {/* Input Section - Always Visible on Landing/Generating */}
        {(currentView === VIEWS.LANDING || currentView === VIEWS.GENERATING) && (
          <section className="input-section animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <InputSection
              topic={topic}
              setTopic={setTopic}
              onGenerate={(t) => {
                setTopic(t);
                handleGenerate(t);
              }}
              status={currentView === VIEWS.GENERATING ? 'loading' : 'idle'}
              intents={intents}
              setIntents={setIntents}
              onDemo={() => {
                setTopic('Photosynthesis');
                handleGenerate('Photosynthesis');
              }}
            />
          </section>
        )}

        {/* Results Section */}
        {currentView === VIEWS.RESULTS && data && (
          <section className="results-section animate-fade-in">
            <div className="results-header">
              <button className="btn-text" onClick={handleReset}>
                ← Back to Search
              </button>
              <h3>Results for: <span className="accent-text">{topic}</span></h3>
              <div className="results-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-primary"
                  onClick={handleGoDeeper}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  🎓 Go Deeper
                </button>
                <button
                  className="btn-export"
                  onClick={() => handleExport('markdown')}
                  title="Download as Markdown"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)'; }}
                  onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)'; }}
                >
                  📥 Download
                </button>
                <button
                  className="btn-export"
                  onClick={() => handleExport('print')}
                  title="Print Materials"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.6rem 1rem',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)'; }}
                  onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)'; }}
                >
                  🖨️ Print
                </button>
              </div>
            </div>

            <Suspense fallback={<div className="loading-spinner" style={{ margin: '2rem auto' }}></div>}>
              <div className="results-grid">
                {intents.notes && data.notes && (
                  <NotesView notes={data.notes} images={data.images} />
                )}
                {intents.quiz && data.quiz && (
                  <>
                    <QuizView quiz={data.quiz} topic={topic} />
                    <AdaptiveFeedback topic={topic} />
                  </>
                )}
                {intents.slides && data.slides && (
                  <SlidesView slides={data.slides} />
                )}
                {intents.flashcards && data.flashcards && (
                  <FlashcardsView flashcards={data.flashcards} />
                )}
              </div>
            </Suspense>
          </section>
        )}

        {/* Deep Study Section */}
        {currentView === VIEWS.DEEP_STUDY && topic && (
          <section className="deep-study-section animate-fade-in">
            <Suspense fallback={<div className="loading-spinner" style={{ margin: '2rem auto' }}></div>}>
              <DeepStudyView
                topic={topic}
                onBack={() => setCurrentView(VIEWS.RESULTS)}
              />
            </Suspense>
          </section>
        )}

        {/* Footer */}
        <footer className="app-footer" style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid var(--glass-border)',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Powered by AI • Built by <span style={{ color: 'var(--accent)' }}>Nazli Tech School</span>
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <button
              onClick={() => setShowPrivacy(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
              onMouseOver={e => e.target.style.color = 'var(--accent)'}
              onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
            >
              Privacy Policy
            </button>
            <span style={{ color: 'var(--glass-border)' }}>•</span>
            <button
              onClick={() => setShowPrivacy(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
              onMouseOver={e => e.target.style.color = 'var(--accent)'}
              onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
            >
              Terms of Use
            </button>
          </div>
        </footer>

        {/* Privacy Policy Modal */}
        {showPrivacy && (
          <div
            onClick={() => setShowPrivacy(false)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.9)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              className="glass-card animate-slide-up"
              style={{ maxWidth: '600px', width: '100%', padding: '2rem', maxHeight: '85vh', overflow: 'auto' }}
            >
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>🔒 Privacy Policy</h2>

              <div style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                <p style={{ marginBottom: '1rem' }}><strong>Effective Date:</strong> February 2026</p>

                <h4 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Information We Collect</h4>
                <p>We collect minimal data to provide our service:</p>
                <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li>Google account info (name, email) for authentication</li>
                  <li>Topics you search to generate educational content</li>
                  <li>Your learning progress and quiz scores</li>
                </ul>

                <h4 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. How We Use Your Data</h4>
                <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li>To generate personalized study materials</li>
                  <li>To track your learning progress</li>
                  <li>To improve our AI recommendations</li>
                </ul>

                <h4 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Data Storage</h4>
                <p>Your data is stored securely using Firebase services. We do not sell or share your personal information with third parties.</p>

                <h4 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. AI Services</h4>
                <p>We use GPT-4o Mini, Gemini, and OpenRouter APIs to generate educational content. Your search topics are sent to these services to create personalized materials.</p>

                <h4 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>5. Your Rights</h4>
                <p>You can request deletion of your account and data at any time by contacting us.</p>

                <h4 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>6. Contact</h4>
                <p>For questions about this policy, contact: <span style={{ color: 'var(--accent)' }}>nazlitechschool@gmail.com</span></p>
              </div>

              <button
                className="btn-primary"
                onClick={() => setShowPrivacy(false)}
                style={{ width: '100%', marginTop: '2rem', padding: '0.75rem' }}
              >
                I Understand
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect, lazy, Suspense } from 'react';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';
import SettingsPanel from './components/SettingsPanel';
import MagneticParticles from './components/MagneticParticles';
import FeatureCards from './components/FeatureCards';
import InputSection from './components/InputSection';
import { generateContent } from './services/geminiService';
import { generateWithOpenRouter } from './services/openRouterService';
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

      // Priority: OpenRouter > Gemini > Wikipedia
      if (useAI && settings.openrouter_api_key) {
        console.log('🤖 Using OpenRouter API');
        result = await generateWithOpenRouter(currentTopic, settings.openrouter_api_key);
      } else if (useAI && settings.gemini_api_key) {
        console.log('🌟 Using Gemini API');
        result = await generateContent(currentTopic, settings.gemini_api_key);
      } else {
        console.log('📚 Using Wikipedia mock mode');
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
                <button className="btn-secondary" onClick={() => handleExport('markdown')} title="Download as Markdown">
                  📥
                </button>
                <button className="btn-secondary" onClick={() => handleExport('print')} title="Print">
                  🖨️
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
        <footer className="app-footer">
          <p>Powered by AI • Built by Nazli Tech School</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

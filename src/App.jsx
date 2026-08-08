import React, { useState, useCallback } from 'react';
import StartStopControls from './components/StartStopControls';
import LiveTranscriptBar from './components/LiveTranscriptBar';
import VisualCard from './components/VisualCard';
import SummaryScreen from './components/SummaryScreen';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useIntervalExtraction } from './hooks/useIntervalExtraction';
import { summarize } from './lib/api';

import './styles/tokens.css';

export default function App() {
  const [view, setView] = useState('lecture'); // 'lecture' | 'summary'
  const [currentVisualData, setCurrentVisualData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const {
    transcript,
    isListening,
    error,
    start,
    stop,
    clearTranscript,
    addManualText,
    isSupported
  } = useSpeechRecognition();

  // Receives extracted result (or null if low confidence) and updates the on-screen card
  const handleExtractionResult = useCallback((result) => {
    setCurrentVisualData(result);
  }, []);

  // Set up the 30-second interval extraction loop (can run while transcribing is active)
  const { isExtracting, triggerExtraction } = useIntervalExtraction(
    transcript,
    isListening,
    handleExtractionResult,
    30000 // 30 seconds interval
  );

  const handleEndSession = async () => {
    stop();
    setView('summary');
    
    const words = transcript.trim().split(/\s+/).filter(Boolean);
    if (words.length < 50) {
      // Guard: not enough content yet, let SummaryScreen handle the view gracefully
      return;
    }

    setIsSummaryLoading(true);
    try {
      const data = await summarize(transcript);
      setSummaryData(data);
    } catch (err) {
      console.error('Failed to summarize session:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleRestart = () => {
    clearTranscript();
    setCurrentVisualData(null);
    setSummaryData(null);
    setView('lecture');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <span className="logo-chalk">Chalk</span>
          <span className="logo-dot">.</span>
        </div>
        <div className="header-tagline">Your Classroom AI Companion</div>
      </header>

      <main className="app-content">
        {view === 'lecture' ? (
          <div className="lecture-layout">
            <div className="layout-left">
              <div className="welcome-section">
                <h1 className="main-title">Live Blackboard</h1>
                <p className="main-subtitle">
                  AI-assisted lecture visuals. Speak or paste text to spark relevant diagrams & fun facts instantly!
                </p>
              </div>

              <StartStopControls
                isListening={isListening}
                onStart={start}
                onStop={stop}
                isSupported={isSupported}
              />

              <LiveTranscriptBar
                transcript={transcript}
                onSimulateSpeech={addManualText}
                isListening={isListening}
                onClear={clearTranscript}
              />

              {transcript && (
                <div className="action-row">
                  <button 
                    className="extract-now-btn" 
                    onClick={triggerExtraction}
                    disabled={isExtracting}
                  >
                    {isExtracting ? 'Analyzing...' : '⚡ Instant Visual Sync'}
                  </button>
                  <button className="end-session-btn" onClick={handleEndSession}>
                    🏁 End Session & Summarize
                  </button>
                </div>
              )}
            </div>

            <div className="layout-right">
              {currentVisualData ? (
                <VisualCard data={currentVisualData} />
              ) : (
                <div className="empty-visuals-slate">
                  <div className="empty-icon">💡</div>
                  <h3>Visual Slate Ready</h3>
                  <p>When the teacher speaks about a topic (like "photosynthesis" or "black holes"), educational images and rich facts will materialize here in real-time!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <SummaryScreen
            summaryData={summaryData}
            fullTranscript={transcript}
            onRestart={handleRestart}
            isLoading={isSummaryLoading}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2026 Chalk Assistant. Real-time NLP powered by Gemini 3.6-Flash.</p>
      </footer>

      <style>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--board);
          color: var(--chalk);
          position: relative;
        }

        /* Blackboard chalk texture */
        .app-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(242, 239, 227, 0.03) 1px, transparent 0);
          background-size: 24px 24px;
          pointer-events: none;
          z-index: 0;
        }

        .app-header {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(242, 239, 227, 0.08);
          z-index: 10;
        }

        .logo-section {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .logo-chalk {
          color: var(--chalk);
        }

        .logo-dot {
          color: var(--highlight);
        }

        .header-tagline {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--slate);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .app-content {
          flex: 1;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          z-index: 10;
        }

        .lecture-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2.5rem;
        }

        @media (max-width: 900px) {
          .lecture-layout {
            grid-template-columns: 1fr;
          }
        }

        .welcome-section {
          margin-bottom: 1.5rem;
        }

        .main-title {
          font-size: 2.2rem;
          color: var(--chalk);
          margin-bottom: 0.25rem;
        }

        .main-subtitle {
          color: var(--slate);
          font-size: 1rem;
          line-height: 1.5;
        }

        .action-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .extract-now-btn {
          background-color: transparent;
          border: 1px dashed var(--highlight);
          color: var(--highlight);
          padding: 0.75rem 1.25rem;
          font-size: 1rem;
          border-radius: 8px;
          flex: 1;
        }

        .extract-now-btn:hover:not(:disabled) {
          background-color: rgba(232, 201, 77, 0.1);
        }

        .end-session-btn {
          background-color: var(--chalk);
          color: var(--board);
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          border-radius: 8px;
          flex: 1.2;
          font-weight: bold;
        }

        .end-session-btn:hover {
          background-color: var(--highlight);
          transform: scale(1.02);
        }

        .layout-right {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .empty-visuals-slate {
          border: 2px dashed rgba(242, 239, 227, 0.15);
          border-radius: 12px;
          padding: 4rem 2rem;
          text-align: center;
          background-color: rgba(0, 0, 0, 0.1);
          color: var(--slate);
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 350px;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.6;
        }

        .empty-visuals-slate h3 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          color: var(--chalk);
          margin-bottom: 0.5rem;
        }

        .empty-visuals-slate p {
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 320px;
          margin: 0 auto;
        }

        .app-footer {
          padding: 1.5rem 2rem;
          text-align: center;
          border-top: 1px solid rgba(242, 239, 227, 0.05);
          color: var(--slate);
          font-size: 0.8rem;
          font-family: var(--font-mono);
          z-index: 10;
        }
      `}</style>
    </div>
  );
}

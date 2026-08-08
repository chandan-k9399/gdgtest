import React from 'react';

export default function StartStopControls({ isListening, onStart, onStop, isSupported }) {
  return (
    <div className="controls-container">
      {!isSupported && (
        <div className="unsupported-banner">
          ⚠️ Web Speech API is not fully supported in this browser. You can still type in the Live Transcript box below to simulate classroom speech!
        </div>
      )}
      
      <div className="btn-group">
        <button
          className={`control-btn start-btn ${isListening ? 'active' : ''}`}
          onClick={onStart}
          disabled={isListening}
          aria-label="Start Lecture"
        >
          <span className="dot-icon green"></span>
          Start Lecture
        </button>
        
        <button
          className={`control-btn stop-btn ${!isListening ? 'active' : ''}`}
          onClick={onStop}
          disabled={!isListening}
          aria-label="Stop Lecture"
        >
          <span className="dot-icon red"></span>
          Pause Lecture
        </button>
      </div>

      <style>{`
        .controls-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .unsupported-banner {
          background-color: rgba(217, 105, 79, 0.15);
          border: 1px solid var(--marker);
          color: var(--chalk);
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          max-width: 600px;
          text-align: center;
          font-family: var(--font-body);
        }

        .btn-group {
          display: flex;
          gap: 1rem;
        }

        .control-btn {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          background-color: transparent;
          border: 2px solid var(--chalk);
          color: var(--chalk);
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .control-btn:hover:not(:disabled) {
          background-color: rgba(242, 239, 227, 0.1);
          transform: translateY(-2px);
        }

        .control-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .start-btn.active {
          border-color: var(--highlight);
          color: var(--highlight);
          box-shadow: 0 0 12px rgba(232, 201, 77, 0.3);
        }

        .stop-btn.active {
          border-color: var(--slate);
          color: var(--slate);
        }

        .dot-icon {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot-icon.green {
          background-color: #2ec4b6;
        }

        .start-btn.active .dot-icon.green {
          animation: pulse 1.5s infinite;
        }

        .dot-icon.red {
          background-color: var(--marker);
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(46, 196, 182, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(46, 196, 182, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(46, 196, 182, 0);
          }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';

export default function LiveTranscriptBar({ transcript, onSimulateSpeech, isListening, onClear }) {
  const [inputText, setInputText] = useState('');
  const containerEndRef = useRef(null);

  // Auto-scroll to the bottom when transcript updates
  useEffect(() => {
    if (containerEndRef.current) {
      containerEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  const handleSimulateSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSimulateSpeech(inputText.trim());
    setInputText('');
  };

  const loadPreset = (topic) => {
    let presetText = '';
    if (topic === 'photosynthesis') {
      presetText = 'Welcome class. Today we are exploring photosynthesis. Photosynthesis is the amazing process by which green plants utilize solar energy from sunlight to synthesize glucose and oxygen. This chemical conversion occurs inside the chloroplasts containing chlorophyll molecules, absorbing red and blue light, while reflecting green. This biochemical reaction converts water and carbon dioxide into simple sugars.';
    } else if (topic === 'blackhole') {
      presetText = 'Let us discuss astrophysics, specifically black holes. A black hole is formed when massive stars collapse under gravity. Inside the event horizon, gravitational attraction is so strong that nothing, not even electromagnetic radiation or light, can escape from the singularity at the core.';
    } else if (topic === 'pythagoras') {
      presetText = 'Let us solve some geometry today. The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides. This ancient equation is fundamental to mathematical distance formula.';
    }
    onSimulateSpeech(presetText);
  };

  return (
    <div className="transcript-box">
      <div className="transcript-header">
        <h3 className="transcript-title">Teacher's Live Transcript</h3>
        <div className="transcript-actions">
          {transcript && (
            <button className="clear-btn" onClick={onClear}>
              Clear
            </button>
          )}
          <span className={`status-indicator ${isListening ? 'listening' : ''}`}>
            {isListening ? '● LIVE' : '○ PAUSED'}
          </span>
        </div>
      </div>

      <div className="transcript-body">
        {transcript ? (
          <div className="transcript-text">
            {transcript}
            <div ref={containerEndRef} />
          </div>
        ) : (
          <div className="transcript-placeholder">
            {isListening 
              ? "Listening for voice input... Speak into your microphone or inject a simulation preset below!" 
              : "Transcription paused. Click 'Start Lecture' to begin listening."}
          </div>
        )}
      </div>

      <form className="simulation-form" onSubmit={handleSimulateSubmit}>
        <input
          type="text"
          className="simulation-input"
          placeholder="Type or paste text to simulate teacher's speech..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="simulate-btn">
          Simulate Speech
        </button>
      </form>

      <div className="preset-row">
        <span className="preset-label">Quick Demo Presets:</span>
        <button type="button" className="preset-btn" onClick={() => loadPreset('photosynthesis')}>
          🌱 Photosynthesis
        </button>
        <button type="button" className="preset-btn" onClick={() => loadPreset('blackhole')}>
          🕳️ Black Hole
        </button>
        <button type="button" className="preset-btn" onClick={() => loadPreset('pythagoras')}>
          📐 Pythagoras
        </button>
      </div>

      <style>{`
        .transcript-box {
          background-color: rgba(31, 46, 40, 0.6);
          border: 2px dashed var(--slate);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
          box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .transcript-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid rgba(242, 239, 227, 0.1);
          padding-bottom: 0.5rem;
        }

        .transcript-title {
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--slate);
          font-family: var(--font-body);
        }

        .transcript-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .clear-btn {
          font-size: 0.8rem;
          background-color: transparent;
          color: var(--marker);
          border: 1px solid var(--marker);
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
        }

        .clear-btn:hover {
          background-color: rgba(219, 105, 79, 0.1);
        }

        .status-indicator {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-weight: bold;
          color: var(--slate);
        }

        .status-indicator.listening {
          color: var(--highlight);
        }

        .transcript-body {
          min-height: 120px;
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background-color: rgba(0, 0, 0, 0.15);
          border-radius: 4px;
        }

        .transcript-text {
          font-family: var(--font-mono);
          font-size: 0.95rem;
          color: var(--chalk);
          white-space: pre-wrap;
          word-break: break-word;
          line-height: 1.6;
        }

        .transcript-placeholder {
          font-family: var(--font-body);
          font-style: italic;
          color: var(--slate);
          text-align: center;
          margin-top: 2rem;
          font-size: 0.9rem;
        }

        .simulation-form {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .simulation-input {
          flex: 1;
          background-color: rgba(251, 249, 250, 0.05);
          border: 1px solid var(--slate);
          border-radius: 4px;
          color: var(--chalk);
          padding: 0.5rem 0.75rem;
          font-family: var(--font-body);
          font-size: 0.9rem;
        }

        .simulation-input:focus {
          outline: none;
          border-color: var(--highlight);
        }

        .simulate-btn {
          background-color: var(--slate);
          color: var(--chalk);
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .simulate-btn:hover {
          background-color: rgba(110, 124, 118, 0.8);
        }

        .preset-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }

        .preset-label {
          color: var(--slate);
        }

        .preset-btn {
          background-color: transparent;
          border: 1px solid rgba(242, 239, 227, 0.2);
          color: var(--chalk);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .preset-btn:hover {
          background-color: rgba(242, 239, 227, 0.1);
          border-color: var(--highlight);
        }
      `}</style>
    </div>
  );
}

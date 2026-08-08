import React, { useState } from 'react';

export default function SummaryScreen({ summaryData, fullTranscript, onRestart, isLoading }) {
  const [copied, setCopied] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIndex: optionText }
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  if (isLoading) {
    return (
      <div className="summary-loading">
        <div className="chalk-spinner"></div>
        <p>Creating summary & interactive quiz with Gemini 3.6-Flash...</p>
        <style>{`
          .summary-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            text-align: center;
            color: var(--chalk);
          }
          .chalk-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(242, 239, 227, 0.2);
            border-top: 5px solid var(--highlight);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1.5rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Check word count guard (50 words)
  const words = (fullTranscript || '').trim().split(/\s+/).filter(Boolean);
  const hasEnoughContent = words.length >= 50;

  if (!hasEnoughContent) {
    return (
      <div className="not-enough-content">
        <h3>Class Ended — Board Cleared</h3>
        <p className="warning-desc">
          There is not enough lecture content to generate a summary yet (currently only {words.length}/50 words). 
          Please speak into the mic or use the simulation presets to add more text, then end the session again.
        </p>
        <button className="back-btn" onClick={onRestart}>
          Return to Lecture
        </button>

        <style>{`
          .not-enough-content {
            border: 2px dashed var(--marker);
            border-radius: 12px;
            padding: 3rem 2rem;
            text-align: center;
            background-color: rgba(217, 105, 79, 0.05);
            max-width: 600px;
            margin: 2rem auto;
          }
          .not-enough-content h3 {
            color: var(--marker);
            font-size: 1.8rem;
            margin-bottom: 1rem;
          }
          .warning-desc {
            color: var(--chalk);
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .back-btn {
            background-color: var(--chalk);
            color: var(--board);
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
          }
          .back-btn:hover {
            background-color: var(--highlight);
          }
        `}</style>
      </div>
    );
  }

  // If we have enough content but no summaryData was generated (silent fail), show a friendly generic summary
  const summaryText = summaryData?.summary || 'No summary was generated due to a network error. Please review the live transcript below.';
  const keyPoints = summaryData?.key_points || [];
  const quiz = summaryData?.quiz || [];

  const handleCopy = () => {
    const textToCopy = `CLASS LESSON SUMMARY\n\nSUMMARY:\n${summaryText}\n\nKEY TAKEAWAYS:\n${keyPoints.map(p => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = `CLASS LESSON SUMMARY\n\nSUMMARY:\n${summaryText}\n\nKEY TAKEAWAYS:\n${keyPoints.map(p => `• ${p}`).join('\n')}\n\nTRANSCRIPT:\n${fullTranscript}`;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chalk_lesson_summary.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectOption = (qIndex, option) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: option
    }));
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="summary-screen">
      <div className="summary-header-row">
        <h1 className="summary-page-title">Session Review</h1>
        <div className="summary-actions">
          <button className="summary-btn copy" onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy Summary'}
          </button>
          <button className="summary-btn download" onClick={handleDownload}>
            💾 Download File
          </button>
          <button className="summary-btn restart" onClick={onRestart}>
            🔄 New Session
          </button>
        </div>
      </div>

      <div className="review-grid">
        {/* Left Side: Summary and Key Points on Chalkboard */}
        <div className="review-left">
          <div className="chalk-board-card">
            <h2 className="section-title text-chalk">Summary</h2>
            <p className="summary-paragraph">{summaryText}</p>
          </div>

          <div className="chalk-board-card">
            <h2 className="section-title text-chalk">Key Takeaways</h2>
            {keyPoints.length > 0 ? (
              <ul className="takeaways-list">
                {keyPoints.map((point, index) => (
                  <li key={index} className="takeaway-item">{point}</li>
                ))}
              </ul>
            ) : (
              <p className="no-points-msg">No bullet points extracted.</p>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Quiz on School Paper */}
        <div className="review-right">
          {quiz.length > 0 ? (
            <div className="quiz-paper">
              <div className="quiz-paper-header">
                <span className="subject-label">CLASS RECAP QUIZ</span>
                <span className="grade-label">
                  {quizSubmitted ? `SCORE: ${calculateScore()}/${quiz.length}` : 'STUDENT REVIEW'}
                </span>
              </div>

              <div className="quiz-questions">
                {quiz.map((q, qIdx) => {
                  const selectedOption = selectedAnswers[qIdx];
                  const isCorrect = selectedOption === q.answer;

                  return (
                    <div key={qIdx} className="quiz-question-item">
                      <p className="quiz-question-text">
                        <strong>Q{qIdx + 1}.</strong> {q.question}
                      </p>
                      
                      <div className="quiz-options">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOption === opt;
                          const isThisCorrectOption = opt === q.answer;
                          
                          let optionClass = '';
                          if (isOptionSelected) optionClass = 'selected';
                          if (quizSubmitted) {
                            if (isThisCorrectOption) optionClass = 'correct';
                            else if (isOptionSelected) optionClass = 'incorrect';
                          }

                          return (
                            <button
                              key={optIdx}
                              className={`quiz-option-btn ${optionClass}`}
                              onClick={() => selectOption(qIdx, opt)}
                              disabled={quizSubmitted}
                            >
                              <span className="option-letter">
                                {String.fromCharCode(65 + optIdx)})
                              </span>
                              <span className="option-text">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="quiz-feedback">
                          {isCorrect ? (
                            <span className="feedback-correct">✓ Correct!</span>
                          ) : (
                            <span className="feedback-incorrect">
                              ✗ Incorrect. Correct: <strong>{q.answer}</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="quiz-footer-actions">
                {!quizSubmitted ? (
                  <button
                    className="submit-quiz-btn"
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(selectedAnswers).length < quiz.length}
                  >
                    Grade Quiz
                  </button>
                ) : (
                  <button
                    className="retake-quiz-btn"
                    onClick={() => {
                      setSelectedAnswers({});
                      setQuizSubmitted(false);
                    }}
                  >
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="no-quiz-paper">
              <h3>No Quiz Available</h3>
              <p>There was not enough specific content covered to generate multiple-choice questions.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .summary-screen {
          width: 100%;
          animation: fadeIn 0.8s ease;
        }

        .summary-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .summary-page-title {
          font-family: var(--font-display);
          font-size: 2.5rem;
          color: var(--chalk);
        }

        .summary-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .summary-btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .summary-btn.copy {
          background-color: transparent;
          border: 1px solid var(--highlight);
          color: var(--highlight);
        }

        .summary-btn.copy:hover {
          background-color: rgba(232, 201, 77, 0.1);
        }

        .summary-btn.download {
          background-color: transparent;
          border: 1px solid var(--chalk);
          color: var(--chalk);
        }

        .summary-btn.download:hover {
          background-color: rgba(242, 239, 227, 0.1);
        }

        .summary-btn.restart {
          background-color: var(--marker);
          color: var(--paper);
        }

        .summary-btn.restart:hover {
          background-color: #be563f;
        }

        .review-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 900px) {
          .review-grid {
            grid-template-columns: 1fr;
          }
        }

        .review-left {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .chalk-board-card {
          border: 2px solid var(--slate);
          border-radius: 10px;
          padding: 1.5rem;
          background-color: rgba(251, 249, 242, 0.02);
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px dashed rgba(242, 239, 227, 0.15);
          padding-bottom: 0.5rem;
        }

        .text-chalk {
          color: var(--chalk);
        }

        .summary-paragraph {
          font-family: var(--font-body);
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--chalk);
        }

        .takeaways-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .takeaway-item {
          position: relative;
          padding-left: 1.5rem;
          font-family: var(--font-body);
          font-size: 1rem;
          line-height: 1.5;
        }

        .takeaway-item::before {
          content: '★';
          position: absolute;
          left: 0;
          color: var(--highlight);
        }

        .no-points-msg, .no-quiz-paper {
          color: var(--slate);
          font-style: italic;
        }

        /* SCHOOL PAPER STYLING FOR QUIZ */
        .quiz-paper {
          background-color: var(--paper);
          color: #2b2d42;
          padding: 2rem;
          border-radius: 4px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          position: relative;
          min-height: 400px;
        }

        /* Lined school paper effect */
        .quiz-paper::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 35px;
          width: 2px;
          background-color: rgba(217, 105, 79, 0.3);
          pointer-events: none;
        }

        .quiz-paper-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #2b2d42;
          padding-bottom: 0.5rem;
          margin-bottom: 1.5rem;
          padding-left: 1.5rem; /* Push past the red margin line */
        }

        .subject-label {
          font-family: var(--font-mono);
          font-weight: bold;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          color: #6c757d;
        }

        .grade-label {
          font-family: var(--font-display);
          font-weight: bold;
          font-size: 1.2rem;
          color: var(--marker);
          border: 2px dashed var(--marker);
          padding: 0.2rem 0.5rem;
          transform: rotate(-5deg);
        }

        .quiz-questions {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-left: 1.5rem; /* Push past the red margin line */
        }

        .quiz-question-item {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .quiz-question-text {
          font-family: var(--font-body);
          font-size: 1rem;
          line-height: 1.4;
          color: #1d3557;
        }

        .quiz-options {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }

        .quiz-option-btn {
          background-color: transparent;
          border: 1px solid #ced4da;
          color: #2b2d42;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          text-align: left;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quiz-option-btn:hover:not(:disabled) {
          background-color: rgba(0, 0, 0, 0.05);
          border-color: #2b2d42;
        }

        .quiz-option-btn.selected {
          background-color: rgba(232, 201, 77, 0.2);
          border-color: var(--highlight);
        }

        .quiz-option-btn.correct {
          background-color: rgba(46, 196, 182, 0.15);
          border-color: #2ec4b6;
          color: #1b4d3e;
          font-weight: 600;
        }

        .quiz-option-btn.incorrect {
          background-color: rgba(217, 105, 79, 0.15);
          border-color: var(--marker);
          color: #5e2a2a;
        }

        .option-letter {
          font-family: var(--font-mono);
          color: #6c757d;
        }

        .quiz-feedback {
          font-family: var(--font-body);
          font-size: 0.85rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          display: inline-block;
        }

        .feedback-correct {
          color: #1b4d3e;
          font-weight: 600;
        }

        .feedback-incorrect {
          color: #5e2a2a;
        }

        .quiz-footer-actions {
          margin-top: 2rem;
          padding-left: 1.5rem;
          display: flex;
          justify-content: flex-end;
        }

        .submit-quiz-btn {
          background-color: #2b2d42;
          color: var(--paper);
          padding: 0.6rem 1.5rem;
          border-radius: 4px;
          font-size: 0.95rem;
        }

        .submit-quiz-btn:hover:not(:disabled) {
          background-color: #1d3557;
        }

        .retake-quiz-btn {
          background-color: transparent;
          border: 1px solid #2b2d42;
          color: #2b2d42;
          padding: 0.5rem 1.2rem;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .retake-quiz-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}

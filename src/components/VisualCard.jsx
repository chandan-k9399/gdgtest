import React, { useState, useEffect } from 'react';

export default function VisualCard({ data }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reset active image index when topic changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [data?.topic]);

  if (!data || !data.topic || data.confidence < 0.4) {
    return null; // Keep the board clean when there is no low-confidence or active topic
  }

  const hasImages = data.images && data.images.length > 0;

  return (
    <div className="visual-card slide-in">
      <div className="card-chalk-border">
        <div className="topic-header">
          <span className="live-badge">Topic Spotted</span>
          <h2 className="topic-title">{data.topic}</h2>
        </div>

        {hasImages ? (
          <div className="image-carousel">
            <img
              src={data.images[activeImageIndex].url}
              alt={data.topic}
              className="carousel-image"
              onError={(e) => {
                // If image fails to load, gracefully hide it
                e.target.style.display = 'none';
              }}
            />
            {data.images.length > 1 && (
              <div className="carousel-dots">
                {data.images.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`Show image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="no-image-fallback">
            {/* Graceful degradation: show fact without broken state */}
          </div>
        )}

        <div className="fact-box">
          <h4 className="fact-title">Did You Know?</h4>
          <p className="fact-text">{data.fun_fact}</p>
        </div>
      </div>

      <style>{`
        .visual-card {
          margin-bottom: 2.5rem;
          animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .card-chalk-border {
          background-color: rgba(251, 249, 242, 0.04);
          border: 3px solid var(--chalk);
          border-radius: 12px;
          padding: 1.5rem;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        /* Chalkboard style overlay */
        .card-chalk-border::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 10px;
          border: 1px dashed rgba(242, 239, 227, 0.15);
          pointer-events: none;
        }

        .topic-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 1.25rem;
        }

        .live-badge {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          background-color: var(--marker);
          color: var(--paper);
          padding: 0.2rem 0.6rem;
          border-radius: 99px;
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .topic-title {
          color: var(--highlight);
          font-family: var(--font-display);
          font-size: 2rem;
          line-height: 1.2;
        }

        .image-carousel {
          position: relative;
          width: 100%;
          max-height: 350px;
          overflow: hidden;
          border-radius: 8px;
          margin-bottom: 1.25rem;
          border: 1px solid rgba(242, 239, 227, 0.1);
        }

        .carousel-image {
          width: 100%;
          height: 100%;
          min-height: 200px;
          max-height: 350px;
          object-fit: cover;
          display: block;
          transition: opacity 0.3s ease;
          animation: fadeIn 0.5s ease;
        }

        .carousel-dots {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          background-color: rgba(0, 0, 0, 0.5);
          padding: 4px 8px;
          border-radius: 12px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          border: none;
          padding: 0;
          cursor: pointer;
        }

        .dot.active {
          background-color: var(--highlight);
        }

        .fact-box {
          background-color: rgba(251, 249, 242, 0.03);
          border-left: 4px solid var(--highlight);
          padding: 1rem;
          border-radius: 0 6px 6px 0;
          margin-top: 1rem;
        }

        .fact-title {
          font-family: var(--font-display);
          color: var(--chalk);
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }

        .fact-text {
          font-family: var(--font-body);
          color: var(--chalk);
          font-size: 1rem;
          line-height: 1.5;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

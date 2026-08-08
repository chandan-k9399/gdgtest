import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef('');

  // Keeps track of speech recognition session
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setError(null);
      };

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
        }

        // Set state to full accumulated final transcript plus any current interim words
        setTranscript((finalTranscriptRef.current + interimTranscript).trim());
      };

      rec.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setError(event.error);
        }
      };

      rec.onend = () => {
        // Automatically restart if we are supposed to be listening (robustness quirk handling)
        if (isListeningRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.warn('Failed to restart recognition:', e);
          }
        }
      };

      recognitionRef.current = rec;
    } else {
      console.warn('Web Speech API is not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const start = useCallback(() => {
    if (isListening) return;
    setError(null);
    setIsListening(true);
    isListeningRef.current = true;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
      }
    }
  }, [isListening]);

  const stop = useCallback(() => {
    if (!isListening) return;
    setIsListening(false);
    isListeningRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Failed to stop speech recognition:', e);
      }
    }
  }, [isListening]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  // For simulation / demoing / testing
  const addManualText = useCallback((text) => {
    if (!text) return;
    setTranscript((prev) => {
      const prefix = prev ? prev + ' ' : '';
      const updated = prefix + text;
      finalTranscriptRef.current = updated + ' ';
      return updated;
    });
  }, []);

  return {
    transcript,
    isListening,
    error,
    start,
    stop,
    clearTranscript,
    addManualText,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
}

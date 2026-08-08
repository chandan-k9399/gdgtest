import { useEffect, useRef, useCallback, useState } from 'react';
import { extract, searchImages } from '../lib/api';

export function useIntervalExtraction(transcript, isListening, onExtractionResult, intervalMs = 30000) {
  const [isExtracting, setIsExtracting] = useState(false);
  const lastProcessedLengthRef = useRef(0);

  // Helper to trigger extraction on the current new chunk of transcript
  const triggerExtraction = useCallback(async () => {
    if (isExtracting) return;
    
    const currentText = transcript || '';
    const lastLength = lastProcessedLengthRef.current;
    
    // Get the rolling chunk of transcript since last extraction
    const chunk = currentText.substring(lastLength).trim();
    
    if (!chunk) {
      console.log('No new transcript content to extract.');
      return;
    }

    setIsExtracting(true);
    // Update the index of what we have processed
    lastProcessedLengthRef.current = currentText.length;

    try {
      console.log(`Extracting rolling chunk: "${chunk}"`);
      const extractResult = await extract(chunk);
      
      if (extractResult && extractResult.confidence >= 0.4 && extractResult.topic) {
        console.log(`Topic extracted: "${extractResult.topic}". Fetching images...`);
        const imageResult = await searchImages(extractResult.search_query);
        
        onExtractionResult({
          topic: extractResult.topic,
          search_query: extractResult.search_query,
          fun_fact: extractResult.fun_fact,
          confidence: extractResult.confidence,
          images: imageResult.images || []
        });
      } else {
        console.log(`Extraction confidence too low or no topic: ${extractResult?.confidence || 0}`);
        // Clear/graceful degradation: if confidence is low, show nothing
        onExtractionResult(null);
      }
    } catch (err) {
      console.error('Failed to run interval extraction:', err);
      onExtractionResult(null);
    } finally {
      setIsExtracting(false);
    }
  }, [transcript, isExtracting, onExtractionResult]);

  // Set up the interval polling
  useEffect(() => {
    if (!isListening) {
      // Reset processed length when we stop listening, so next start starts fresh
      lastProcessedLengthRef.current = 0;
      return;
    }

    // Set up the interval
    const intervalId = setInterval(() => {
      triggerExtraction();
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [isListening, triggerExtraction, intervalMs]);

  return {
    isExtracting,
    triggerExtraction
  };
}

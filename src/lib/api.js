/**
 * API client for Chalk
 * Interacts with Netlify Functions through /api redirects
 */

export async function extract(transcriptChunk) {
  try {
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcriptChunk })
    });
    
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }
    
    return await res.json();
  } catch (err) {
    console.warn('Failed to call extract API:', err);
    // Quiet, visible-but-non-disruptive failure state
    return { topic: '', search_query: '', fun_fact: '', confidence: 0 };
  }
}

export async function searchImages(query) {
  try {
    if (!query || !query.trim()) {
      return { images: [] };
    }
    
    const res = await fetch(`/api/image-search?q=${encodeURIComponent(query)}`);
    
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }
    
    return await res.json();
  } catch (err) {
    console.warn('Failed to call image-search API:', err);
    // Graceful degradation
    return { images: [] };
  }
}

export async function summarize(fullTranscript) {
  try {
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullTranscript })
    });
    
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }
    
    return await res.json();
  } catch (err) {
    console.warn('Failed to call summarize API:', err);
    return { summary: '', key_points: [], quiz: [] };
  }
}

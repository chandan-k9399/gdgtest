import { GoogleGenAI } from '@google/genai';

export async function handler(event, context) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  let transcriptChunk = '';
  try {
    const body = JSON.parse(event.body || '{}');
    transcriptChunk = body.transcriptChunk || '';
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback / offline mock data if API key is not present
  if (!apiKey) {
    const chunkLower = transcriptChunk.toLowerCase();
    let mockResult = {
      topic: '',
      search_query: '',
      fun_fact: '',
      confidence: 0
    };

    if (chunkLower.includes('photosynthesis') || chunkLower.includes('plant') || chunkLower.includes('light')) {
      mockResult = {
        topic: 'Photosynthesis',
        search_query: 'photosynthesis plant process diagram',
        fun_fact: 'Plants look green because chlorophyll absorbs red and blue light but reflects green light!',
        confidence: 0.95
      };
    } else if (chunkLower.includes('black hole') || chunkLower.includes('space') || chunkLower.includes('gravity')) {
      mockResult = {
        topic: 'Black Holes',
        search_query: 'black hole space universe physics',
        fun_fact: 'At the center of a black hole, gravity is so strong that even light cannot escape!',
        confidence: 0.9
      };
    } else if (chunkLower.includes('pythagoras') || chunkLower.includes('triangle') || chunkLower.includes('math')) {
      mockResult = {
        topic: 'Pythagorean Theorem',
        search_query: 'pythagorean theorem triangle formula',
        fun_fact: 'The Pythagorean theorem was known to Babylonians and Indians hundreds of years before Pythagoras lived!',
        confidence: 0.88
      };
    } else if (transcriptChunk.trim().split(/\s+/).length > 3) {
      // General default mock to ensure working end-to-end flow
      mockResult = {
        topic: 'General Science',
        search_query: 'science experiment classroom',
        fun_fact: 'The word "science" comes from the Latin word "scientia," which means knowledge.',
        confidence: 0.7
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockResult)
    };
  }

  // Real Gemini call
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Transcript chunk to analyze:\n"${transcriptChunk}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            topic: { type: 'STRING' },
            search_query: { type: 'STRING' },
            fun_fact: { type: 'STRING' },
            confidence: { type: 'NUMBER' }
          },
          required: ['topic', 'search_query', 'fun_fact', 'confidence']
        },
        systemInstruction: `You are analyzing a live, rolling chunk of a teacher's spoken lecture transcript. Identify the single main topic being discussed right now in this chunk.
Return a short 2-4 word search_query suitable for an image search engine that would find a genuinely relevant educational image for this exact topic — not a generic or overly broad term.
Return one short, accurate 'fun_fact' (under 25 words) directly related to this specific topic. Do not invent facts not reasonably true — if unsure, prefer a safer, more general true statement over a specific but risky one.
Return a confidence score between 0 and 1 reflecting how clearly a single topic is identifiable in this transcript chunk. If the chunk is too short, off-topic chatter, or ambiguous between multiple topics, return a low confidence score (below 0.4) rather than guessing.
Base this only on the transcript chunk provided. Do not use outside context or assume information not present in the text.`
      }
    });

    const outputText = response.text;
    const parsed = JSON.parse(outputText || '{}');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        topic: parsed.topic || '',
        search_query: parsed.search_query || '',
        fun_fact: parsed.fun_fact || '',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0
      })
    };
  } catch (err) {
    console.error('Error in Gemini extract API call:', err);
    // Silent fail state per specifications
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        topic: '',
        search_query: '',
        fun_fact: '',
        confidence: 0
      })
    };
  }
}

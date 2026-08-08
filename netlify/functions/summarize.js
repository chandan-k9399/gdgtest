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

  let fullTranscript = '';
  try {
    const body = JSON.parse(event.body || '{}');
    fullTranscript = body.fullTranscript || '';
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  // Guard: if fullTranscript is under ~50 words, return empty-shape response per specifications
  const words = fullTranscript.trim().split(/\s+/).filter(Boolean);
  if (words.length < 50) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        summary: '',
        key_points: [],
        quiz: []
      })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback / offline mock data if API key is not present
  if (!apiKey) {
    const transcriptLower = fullTranscript.toLowerCase();
    let mockSummary = 'This is a summary of the class discussion.';
    let mockPoints = ['Point number one of interest.', 'Point number two of interest.'];
    let mockQuiz = [
      {
        question: 'What is the default topic of this mock?',
        options: ['Science', 'History', 'Math', 'Art'],
        answer: 'Science'
      }
    ];

    if (transcriptLower.includes('photosynthesis')) {
      mockSummary = 'Today we discussed the biological process of photosynthesis, by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water. We looked at light-dependent reactions, chlorophyll, and chemical products like glucose and oxygen.';
      mockPoints = [
        'Plants absorb light through pigment molecules known as chlorophyll.',
        'Light reactions convert light energy into chemical energy (ATP and NADPH).',
        'Carbon dioxide is converted into glucose in the Calvin Cycle.',
        'Oxygen is released as a byproduct into the atmosphere.'
      ];
      mockQuiz = [
        {
          question: 'What pigment absorbs light in plants?',
          options: ['Carotene', 'Chlorophyll', 'Anthocyanin', 'Melanin'],
          answer: 'Chlorophyll'
        },
        {
          question: 'Which of the following is a product of photosynthesis?',
          options: ['Nitrogen', 'Helium', 'Glucose', 'Carbon dioxide'],
          answer: 'Glucose'
        },
        {
          question: 'Where does the carbon dioxide used in photosynthesis come from?',
          options: ['Soil water', 'The atmosphere', 'Inside the plant roots', 'Plant mitochondria'],
          answer: 'The atmosphere'
        },
        {
          question: 'Which cycle in photosynthesis converts carbon dioxide to glucose?',
          options: ['Krebs Cycle', 'Calvin Cycle', 'Nitrogen Cycle', 'Water Cycle'],
          answer: 'Calvin Cycle'
        },
        {
          question: 'What is released as a byproduct during photosynthesis?',
          options: ['Oxygen', 'Carbon monoxide', 'Argon', 'Hydrogen'],
          answer: 'Oxygen'
        }
      ];
    } else if (transcriptLower.includes('black hole')) {
      mockSummary = 'We studied the exotic properties of black holes in astrophysics. A black hole is formed when massive stars collapse under their own gravity at the end of their lifecycle, creating a singularity where gravitational forces are infinitely dense and not even light can escape beyond the event horizon.';
      mockPoints = [
        'A black hole is formed when a supermassive star collapses.',
        'The boundary surrounding a black hole is called the event horizon.',
        'The mathematical center of a black hole is known as a singularity.',
        'Supermassive black holes are hypothesized to exist at the centers of most galaxies.'
      ];
      mockQuiz = [
        {
          question: 'What is the boundary surrounding a black hole called?',
          options: ['Singularity', 'Event Horizon', 'Oort Cloud', 'Accretion Disk'],
          answer: 'Event Horizon'
        },
        {
          question: 'Which force causes a star to collapse into a black hole?',
          options: ['Electromagnetism', 'Strong nuclear force', 'Weak nuclear force', 'Gravity'],
          answer: 'Gravity'
        },
        {
          question: 'What is at the absolute center of a black hole?',
          options: ['Singularity', 'Wormhole', 'Neutron star', 'White dwarf'],
          answer: 'Singularity'
        },
        {
          question: 'Can light escape from inside a black horizon boundary?',
          options: ['Yes, always', 'Only blue light', 'No, never', 'Only ultraviolet light'],
          answer: 'No, never'
        },
        {
          question: 'Where do supermassive black holes typically reside?',
          options: ['Outside our solar system only', 'At the center of galaxies', 'Inside nebulae only', 'Scattered randomly in empty space'],
          answer: 'At the center of galaxies'
        }
      ];
    } else {
      mockSummary = `In this session, we reviewed general academic concepts, discussing core terms and identifying patterns. Students explored key definitions and participated in interactive questions to reinforce learning across the curriculum.`;
      mockPoints = [
        'The teacher introduced fundamental concepts and vocabulary.',
        'Real-world examples were discussed to illustrate the theory.',
        'Students engaged in answering comprehensive recap questions.',
        'A summary of key takeaways was formulated for review.'
      ];
      mockQuiz = [
        {
          question: 'What was the main purpose of this lesson?',
          options: ['Introduce and review core concepts', 'Learn to code in React', 'Perform a laboratory experiment', 'Take a final exam'],
          answer: 'Introduce and review core concepts'
        },
        {
          question: 'Which of the following is recommended after class?',
          options: ['Go to sleep', 'Review the summary and quiz', 'Discard all notes', 'Start a new unrelated topic'],
          answer: 'Review the summary and quiz'
        },
        {
          question: 'How were real-world examples utilized?',
          options: ['To confuse the students', 'To illustrate academic theory', 'To pass time', 'To test microphone quality'],
          answer: 'To illustrate academic theory'
        },
        {
          question: 'What does the term "Chalk" stand for in this app?',
          options: ['A classroom blackboard tool', 'A heavy metal', 'A type of cloud', 'Chemical formula for salt'],
          answer: 'A classroom blackboard tool'
        },
        {
          question: 'How is the session summary generated?',
          options: ['Manual typing', 'Automatically by AI based on transcript', 'Using predefined textbooks', 'Random word generation'],
          answer: 'Automatically by AI based on transcript'
        }
      ];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        summary: mockSummary,
        key_points: mockPoints,
        quiz: mockQuiz
      })
    };
  }

  // Real Gemini call
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Full transcript to summarize:\n"${fullTranscript}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            summary: { type: 'STRING' },
            key_points: {
              type: 'ARRAY',
              items: { type: 'STRING' }
            },
            quiz: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  question: { type: 'STRING' },
                  options: {
                    type: 'ARRAY',
                    items: { type: 'STRING' }
                  },
                  answer: { type: 'STRING' }
                },
                required: ['question', 'options', 'answer']
              }
            }
          },
          required: ['summary', 'key_points', 'quiz']
        },
        systemInstruction: `You are summarizing a full lecture transcript for students to review after class.
Write a summary of 3-5 sentences covering what was actually discussed, in plain language.
Extract 4-8 key_points as short, distinct bullet-point statements — no duplicates, no restating the summary.
Generate exactly 5 multiple-choice quiz questions based only on content that was actually covered in the transcript. Do not invent facts or ask about anything not present in the transcript. Each question must have exactly 4 options, and the 'answer' field must be an exact copy of the correct option's text.
Base all of this strictly on the transcript provided — do not add outside knowledge beyond what's needed to phrase the summary clearly.`
      }
    });

    const outputText = response.text;
    const parsed = JSON.parse(outputText || '{}');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        summary: parsed.summary || '',
        key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [],
        quiz: Array.isArray(parsed.quiz) ? parsed.quiz : []
      })
    };
  } catch (err) {
    console.error('Error in Gemini summarize API call:', err);
    // Silent fail state per specifications
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        summary: '',
        key_points: [],
        quiz: []
      })
    };
  }
}

/**
 * Gemini Service - Direct REST API implementation
 * Supports user-provided API keys from Google AI Studio
 * 
 * Models tried in order: gemini-2.0-flash-exp → gemini-1.5-flash → gemini-pro
 */

export const MASTER_PROMPT = `
You are Study Craft AI, an educational content generator designed for students.

Your goal:
- Convert a given topic into clear, structured, student-friendly learning materials.
- Focus on clarity, accuracy, and exam usefulness.
- Use simple language, but do not oversimplify concepts.

Topic: {USER_INPUT}

Generate educational content suitable for a student.

Return:
1. Notes – clear bullet points or short paragraphs.
2. ImageKeywords – 2-3 specific search terms for educational images.
3. Slides – presentation-style breakdown (title + bullet points).
4. Quiz – multiple-choice questions with explanations.

Difficulty level: Beginner to Intermediate.
Tone: Clear, academic, student-friendly.

IMPORTANT:
Return ONLY valid JSON in the following structure (no markdown formatting, just raw JSON):

{
  "notes": string[],
  "imageKeywords": string[],
  "slides": {
    "title": string,
    "bulletPoints": string[]
  }[],
  "quiz": {
    "question": string,
    "options": string[],
    "correctIndex": number,
    "explanation": string
  }[]
}
`;

const MOCK_DATA = {
  "notes": [
    "Photosynthesis is the process by which green plants make their own food using sunlight.",
    "It occurs mainly in the leaves of plants, inside specialized structures called chloroplasts.",
    "Chlorophyll absorbs light energy, which is used to convert carbon dioxide and water into glucose.",
    "Oxygen is released as a byproduct of photosynthesis.",
    "Photosynthesis is essential for life on Earth because it provides oxygen and forms the base of most food chains."
  ],
  "imageKeywords": [
    "photosynthesis diagram",
    "chloroplast structure",
    "plant cell"
  ],
  "slides": [
    {
      "title": "What is Photosynthesis?",
      "bulletPoints": [
        "Process used by plants to make food",
        "Requires sunlight, water, and carbon dioxide",
        "Produces glucose and oxygen"
      ]
    },
    {
      "title": "Where Does It Happen?",
      "bulletPoints": [
        "Occurs in chloroplasts",
        "Mainly in leaf cells",
        "Chlorophyll captures light energy"
      ]
    },
    {
      "title": "Why Is It Important?",
      "bulletPoints": [
        "Provides food for plants",
        "Supplies oxygen for respiration",
        "Supports all life on Earth"
      ]
    }
  ],
  "quiz": [
    {
      "question": "What is the main purpose of photosynthesis?",
      "options": [
        "To produce oxygen only",
        "To create energy for animals",
        "To make food for the plant",
        "To absorb carbon dioxide"
      ],
      "correctIndex": 2,
      "explanation": "Photosynthesis allows plants to produce glucose, which is their main source of energy and food."
    },
    {
      "question": "Which part of the plant cell is responsible for photosynthesis?",
      "options": [
        "Nucleus",
        "Mitochondria",
        "Chloroplast",
        "Cell wall"
      ],
      "correctIndex": 2,
      "explanation": "Chloroplasts contain chlorophyll, which captures sunlight needed for photosynthesis."
    }
  ]
};

// Models to try in order of preference
const GEMINI_MODELS = [
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-pro'
];

/**
 * Call Gemini API directly via REST
 */
async function callGeminiAPI(apiKey, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error?.message || `HTTP ${response.status}`;
    throw new Error(`${model}: ${errorMsg}`);
  }

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error(`${model}: No content in response`);
  }

  return data.candidates[0].content.parts[0].text;
}

/**
 * Generate content using Gemini API
 * Tries multiple models in sequence until one works
 */
export const generateContent = async (topic, apiKey = null) => {
  console.log("🌟 Gemini: Generating content for:", topic, "Has Key:", !!apiKey);

  if (!apiKey || apiKey.trim() === '') {
    console.log("📚 No Gemini key, returning mock data");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return MOCK_DATA;
  }

  const prompt = MASTER_PROMPT.replace('{USER_INPUT}', topic);
  let lastError = null;

  // Try each model in sequence
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`🌟 Trying Gemini model: ${model}...`);
      const text = await callGeminiAPI(apiKey.trim(), model, prompt);

      // Clean up markdown code blocks if present
      const jsonString = text.replace(/```json/gi, '').replace(/```/g, '').trim();

      const result = JSON.parse(jsonString);
      console.log(`✅ Gemini ${model}: SUCCESS`);
      return result;
    } catch (error) {
      console.warn(`⚠️ Gemini ${model} failed:`, error.message);
      lastError = error;

      // If quota exceeded, don't try other models (same key will fail)
      if (error.message.includes('quota') || error.message.includes('429')) {
        break;
      }
    }
  }

  // All models failed
  throw new Error(`Gemini API failed: ${lastError?.message || 'Unknown error'}`);
};

/**
 * Validate a Gemini API key
 * Returns { valid: boolean, model?: string, error?: string }
 */
export const validateGeminiKey = async (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, error: 'No API key provided' };
  }

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say "OK" if working' }] }]
        })
      });

      const data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return { valid: true, model };
      }
    } catch (error) {
      // Continue to next model
    }
  }

  return { valid: false, error: 'Key invalid or quota exceeded' };
};

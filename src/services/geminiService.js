import { GoogleGenerativeAI } from "@google/generative-ai";

export const MASTER_PROMPT = `
You are Study Craft AI, an educational content generator designed for students.

Your goal:
- Convert a given topic OR content from a link into clear, structured, student-friendly learning materials.
- Focus on clarity, accuracy, and exam usefulness.
- Avoid unnecessary verbosity.
- Use simple language, but do not oversimplify concepts.

Rules:
- Output MUST follow the exact JSON structure provided.
- Notes must be concise and study-ready.
- Quiz questions must test understanding, not memorization.
- Each quiz answer must include a short educational explanation.
- Slides must be minimal: title + bullet points only.
- Include 2-3 image keywords that would help students visualize the concept.
- If the input is a URL, do your best to summarize the likely content of that page based on your training data.

Topic/Link: {USER_INPUT}

Generate educational content suitable for a student.

Return:
1. Notes – clear bullet points or short paragraphs.
2. ImageKeywords – 2-3 specific search terms for educational images (e.g., "photosynthesis diagram", "cell structure labeled").
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

export const generateContent = async (topic, apiKey = null) => {
  console.log("Generating content for:", topic, "Has Key:", !!apiKey);

  if (!apiKey) {
    // Simulate network delay for realistic "Crafting..." state
    await new Promise(resolve => setTimeout(resolve, 2000));
    return MOCK_DATA;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.0-flash - the new default as of January 2025
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = MASTER_PROMPT.replace('{USER_INPUT}', topic);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown code blocks if the model includes them
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate content.");
  }
};

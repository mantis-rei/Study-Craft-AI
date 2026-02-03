/**
 * OpenRouter AI Service
 * Fixed: 2026-02-02 - Corrected model names and fallback chain
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Available models - VERIFIED WORKING
 */
export const OPENROUTER_MODELS = {
    TRINITY_LARGE: 'arcee-ai/trinity-large-preview:free',
    GEMINI_FLASH: 'google/gemini-2.0-flash-exp:free',
    LLAMA_3: 'meta-llama/llama-3.2-3b-instruct:free',
    QWEN: 'qwen/qwen-2-7b-instruct:free',
};

const DEFAULT_MODEL = OPENROUTER_MODELS.TRINITY_LARGE;

/**
 * Master prompt for educational content generation
 */
const EDUCATIONAL_PROMPT = `You are an expert educational content creator. Based on the topic, create comprehensive study materials.

Topic: {TOPIC}

IMPORTANT: Respond ONLY with valid JSON, no markdown code blocks. Generate:
{
  "notes": [
    "6-8 clear educational notes about the topic"
  ],
  "slides": [
    {
      "title": "Slide Title",
      "bulletPoints": ["3-4 bullet points per slide"]
    }
  ],
  "quiz": [
    {
      "question": "Clear multiple choice question",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctIndex": 0,
      "explanation": "Explanation of the correct answer"
    }
  ]
}`;

/**
 * Generate educational content using OpenRouter
 */
export const generateWithOpenRouter = async (topic, apiKey, model = DEFAULT_MODEL) => {
    console.log(`🤖 OpenRouter: Generating content for "${topic}"`);

    // Validate inputs
    if (!topic || !apiKey) {
        throw new Error('Topic and API key are required');
    }

    // Models to try in order (fallback chain) - ALL DEFINED
    const modelsToTry = [
        model,
        OPENROUTER_MODELS.GEMINI_FLASH,
        OPENROUTER_MODELS.LLAMA_3,
        OPENROUTER_MODELS.QWEN
    ].filter(m => m); // Remove any undefined

    let lastError = null;

    for (const currentModel of modelsToTry) {
        if (!currentModel) continue;

        try {
            console.log(`🔄 Trying model: ${currentModel}`);
            const prompt = EDUCATIONAL_PROMPT.replace('{TOPIC}', topic);

            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Study Craft AI'
                },
                body: JSON.stringify({
                    model: currentModel,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 4000
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.warn(`⚠️ Model ${currentModel} failed:`, errorData.error?.message || response.status);
                lastError = errorData.error?.message || `HTTP ${response.status}`;
                continue;
            }

            const data = await response.json();

            if (!data.choices?.[0]?.message?.content) {
                console.warn(`⚠️ Model ${currentModel}: No content in response`);
                continue;
            }

            const content = data.choices[0].message.content;
            console.log(`✅ OpenRouter: Success with ${currentModel}`);

            // Extract JSON from response
            let jsonString = content
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonString = jsonMatch[0];
            }

            const result = JSON.parse(jsonString);
            result.source = `🤖 AI (${currentModel.split('/')[1]?.split(':')[0] || 'OpenRouter'})`;
            result.sourceUrl = 'https://openrouter.ai';

            return result;

        } catch (error) {
            console.warn(`⚠️ Model ${currentModel} error:`, error.message);
            lastError = error.message;
            continue;
        }
    }

    throw new Error(`OpenRouter failed: ${lastError || 'All models unavailable'}`);
};

/**
 * Test OpenRouter API key
 */
export const testOpenRouterKey = async (apiKey) => {
    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Study Craft AI'
            },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                messages: [{ role: 'user', content: 'Say "OK" if working.' }],
                max_tokens: 10
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.error?.message || 'API key invalid' };
        }

        return { success: true, message: 'API key valid' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export default { generateWithOpenRouter, testOpenRouterKey, OPENROUTER_MODELS };

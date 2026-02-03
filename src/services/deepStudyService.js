/**
 * Deep Study Service - FINAL EDITION
 * Uses OpenRouter API with user's key from settings
 * Fallback chain: OpenRouter → Gemini → Generated Content
 */

import { getSettings } from './settingsService';

// Learning Levels
export const STUDY_LEVELS = {
    FOUNDATION: 'foundation',
    UNDERSTANDING: 'understanding',
    APPLICATION: 'application',
    MASTERY: 'mastery'
};

// Subject Types
export const SUBJECT_TYPES = {
    SCIENCE: 'science',
    MATHEMATICS: 'mathematics',
    CODING: 'coding',
    HISTORY: 'history',
    GEOGRAPHY: 'geography',
    GENERAL: 'general'
};

/**
 * Auto-detect subject type from topic
 */
export const detectSubjectType = (topic) => {
    const topicLower = topic.toLowerCase();

    if (/physics|chemistry|biology|quantum|atom|molecule|cell|dna|evolution|gravity|energy|force|buoyancy/.test(topicLower)) {
        return SUBJECT_TYPES.SCIENCE;
    }
    if (/math|calculus|algebra|geometry|equation|theorem|integral|derivative|statistics|probability/.test(topicLower)) {
        return SUBJECT_TYPES.MATHEMATICS;
    }
    if (/programming|code|javascript|python|react|algorithm|function|variable|loop|api|database/.test(topicLower)) {
        return SUBJECT_TYPES.CODING;
    }
    if (/war|century|ancient|empire|king|revolution|civilization|era|dynasty|historical/.test(topicLower)) {
        return SUBJECT_TYPES.HISTORY;
    }
    if (/country|continent|ocean|mountain|river|climate|population|capital|region|map/.test(topicLower)) {
        return SUBJECT_TYPES.GEOGRAPHY;
    }

    return SUBJECT_TYPES.GENERAL;
};

/**
 * Get teaching style based on subject
 */
const getTeachingStyle = (subjectType) => {
    const styles = {
        [SUBJECT_TYPES.SCIENCE]: 'Use visual analogies, real-world examples, and explain the "why" behind phenomena.',
        [SUBJECT_TYPES.MATHEMATICS]: 'Show step-by-step solutions, explain the logic, use visual representations.',
        [SUBJECT_TYPES.CODING]: 'Include code examples with syntax highlighting. Explain with practical use cases.',
        [SUBJECT_TYPES.HISTORY]: 'Provide timeline context, cause-and-effect relationships, key figures.',
        [SUBJECT_TYPES.GEOGRAPHY]: 'Include spatial relationships, statistics, cultural context.',
        [SUBJECT_TYPES.GENERAL]: 'Use clear explanations, relevant examples, and logical connections.'
    };
    return styles[subjectType] || styles[SUBJECT_TYPES.GENERAL];
};

/**
 * Generate prompt for each learning level
 */
const getLevelPrompt = (topic, level, subjectType) => {
    const style = getTeachingStyle(subjectType);

    const prompts = {
        [STUDY_LEVELS.FOUNDATION]: `You are teaching "${topic}" to someone with ZERO prior knowledge.

STYLE: ${style}

Return ONLY valid JSON:
{
    "level": "foundation",
    "title": "Understanding the Basics of ${topic}",
    "keyQuestion": "What is ${topic} and why does it matter?",
    "content": [
        { "type": "definition", "text": "Simple, clear definition" },
        { "type": "analogy", "text": "Real-world analogy" },
        { "type": "keyPoints", "items": ["Point 1", "Point 2", "Point 3"] },
        { "type": "funFact", "text": "Interesting fact" }
    ],
    "selfCheck": "A simple question to verify understanding"
}`,

        [STUDY_LEVELS.UNDERSTANDING]: `Explain HOW "${topic}" works in depth.

STYLE: ${style}

Return ONLY valid JSON:
{
    "level": "understanding",
    "title": "How ${topic} Works",
    "keyQuestion": "What are the mechanisms behind ${topic}?",
    "content": [
        { "type": "mechanism", "text": "Detailed explanation of how it works" },
        { "type": "components", "items": ["Component 1", "Component 2"] },
        { "type": "process", "steps": ["Step 1", "Step 2", "Step 3"] }
    ],
    "selfCheck": "A question about the mechanism"
}`,

        [STUDY_LEVELS.APPLICATION]: `Show PRACTICAL applications of "${topic}".

STYLE: ${style}

Return ONLY valid JSON:
{
    "level": "application",
    "title": "Applying ${topic}",
    "keyQuestion": "How is ${topic} used in the real world?",
    "content": [
        { "type": "realWorld", "examples": ["Example 1", "Example 2", "Example 3"] },
        { "type": "exercise", "problem": "A practical problem", "solution": "Step by step solution" }
    ],
    "selfCheck": "An application-based question"
}`,

        [STUDY_LEVELS.MASTERY]: `Provide EXPERT-LEVEL knowledge about "${topic}".

STYLE: ${style}

Return ONLY valid JSON:
{
    "level": "mastery",
    "title": "Mastering ${topic}",
    "keyQuestion": "What do experts know about ${topic}?",
    "content": [
        { "type": "advanced", "text": "Advanced concepts" },
        { "type": "commonMistakes", "items": ["Mistake 1", "Mistake 2"] },
        { "type": "expertTips", "items": ["Tip 1", "Tip 2"] },
        { "type": "furtherStudy", "resources": ["Topic 1", "Topic 2"] }
    ],
    "selfCheck": "A challenging question"
}`
    };

    return prompts[level];
};

/**
 * Call OpenRouter API - PRIMARY
 */
async function callOpenRouter(prompt, apiKey) {
    console.log('🚀 Calling OpenRouter API...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Study Craft AI'
        },
        body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('OpenRouter error:', response.status, error);
        throw new Error(`OpenRouter API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

/**
 * Call Gemini API - FALLBACK
 */
async function callGemini(prompt, apiKey) {
    console.log('🌟 Calling Gemini API...');

    const models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash', 'gemini-pro'];

    for (const model of models) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
                    })
                }
            );

            const data = await response.json();
            if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                return data.candidates[0].content.parts[0].text;
            }
        } catch (error) {
            console.warn(`Gemini ${model} failed:`, error.message);
        }
    }
    throw new Error('Gemini API failed');
}

/**
 * Generate fallback content when all APIs fail
 */
function generateFallbackContent(topic, level, subjectType) {
    console.log('📚 Using fallback content generation');

    const fallbacks = {
        [STUDY_LEVELS.FOUNDATION]: {
            level,
            title: `Introduction to ${topic}`,
            keyQuestion: `What is ${topic}?`,
            content: [
                { type: 'definition', text: `${topic} is a fundamental concept that forms the basis of understanding in this field. It represents key principles that help us make sense of related phenomena and applications.` },
                { type: 'analogy', text: `Think of ${topic} like learning to ride a bicycle - once you understand the basic principles, everything else builds upon that foundation.` },
                {
                    type: 'keyPoints', items: [
                        `${topic} has practical applications in everyday life`,
                        `Understanding ${topic} helps build deeper knowledge`,
                        `${topic} connects to many other important concepts`
                    ]
                },
                { type: 'funFact', text: `Many groundbreaking discoveries have been made by studying ${topic} from different perspectives!` }
            ],
            selfCheck: `Can you explain ${topic} in your own words?`
        },
        [STUDY_LEVELS.UNDERSTANDING]: {
            level,
            title: `How ${topic} Works`,
            keyQuestion: `What mechanisms drive ${topic}?`,
            content: [
                { type: 'mechanism', text: `${topic} operates through a series of interconnected processes that work together to produce observable outcomes.` },
                { type: 'components', items: ['Core principles', 'Supporting elements', 'Interaction patterns'] },
                { type: 'process', steps: ['Identify the basic elements', 'Understand relationships', 'Apply to new situations'] }
            ],
            selfCheck: `What are the key components of ${topic}?`
        },
        [STUDY_LEVELS.APPLICATION]: {
            level,
            title: `Applying ${topic}`,
            keyQuestion: `How is ${topic} used in practice?`,
            content: [
                { type: 'realWorld', examples: ['Professional applications', 'Everyday uses', 'Research contexts'] },
                { type: 'exercise', problem: `Apply your knowledge of ${topic} to solve a real-world problem`, solution: 'Analyze the situation, identify key principles, apply systematically, verify results' }
            ],
            selfCheck: `Give an example of ${topic} in action`
        },
        [STUDY_LEVELS.MASTERY]: {
            level,
            title: `Mastering ${topic}`,
            keyQuestion: `What separates experts from beginners in ${topic}?`,
            content: [
                { type: 'advanced', text: `Expert-level understanding of ${topic} involves recognizing subtle patterns and making connections that aren't immediately obvious.` },
                { type: 'commonMistakes', items: ['Overlooking fundamentals', 'Rushing through basics', 'Not practicing enough'] },
                { type: 'expertTips', items: ['Practice regularly', 'Teach others', 'Connect to related fields'] },
                { type: 'furtherStudy', resources: ['Advanced textbooks', 'Research papers', 'Expert tutorials'] }
            ],
            selfCheck: `What aspects of ${topic} are most challenging?`
        }
    };

    return {
        ...fallbacks[level],
        subjectType,
        topic
    };
}

/**
 * Main function - Generate Deep Study content
 */
export const generateDeepStudy = async (topic, level = STUDY_LEVELS.FOUNDATION) => {
    const subjectType = detectSubjectType(topic);
    const prompt = getLevelPrompt(topic, level, subjectType);
    const settings = getSettings();

    console.log(`📚 Deep Study: ${topic} | Level: ${level} | Subject: ${subjectType}`);

    try {
        let content = null;

        // Try OpenRouter first (if user has key)
        if (settings.openrouter_api_key && settings.openrouter_api_key.trim()) {
            try {
                content = await callOpenRouter(prompt, settings.openrouter_api_key);
            } catch (error) {
                console.warn('⚠️ OpenRouter failed:', error.message);
            }
        }

        // Fallback to Gemini
        if (!content && settings.gemini_api_key && settings.gemini_api_key.trim()) {
            try {
                content = await callGemini(prompt, settings.gemini_api_key);
            } catch (error) {
                console.warn('⚠️ Gemini failed:', error.message);
            }
        }

        // Parse JSON response
        if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                result.subjectType = subjectType;
                result.topic = topic;
                return result;
            }
        }

        // Fallback to generated content
        return generateFallbackContent(topic, level, subjectType);

    } catch (error) {
        console.error('Deep Study Error:', error);
        return generateFallbackContent(topic, level, subjectType);
    }
};

/**
 * Ask the AI Tutor a question
 */
export const askTutor = async (topic, question, context) => {
    const settings = getSettings();
    const prompt = `You are an expert tutor teaching about "${topic}".

CONTEXT: The student has been learning about: ${context}

STUDENT'S QUESTION: ${question}

Provide a helpful, clear answer. If the question involves code, format it properly with \`\`\` blocks.
If it involves math, show the formula clearly.

Format response as JSON:
{
    "answer": "Your detailed answer with proper formatting",
    "followUpSuggestions": ["Related question 1", "Related question 2"]
}`;

    try {
        let content = null;

        // Try OpenRouter first
        if (settings.openrouter_api_key && settings.openrouter_api_key.trim()) {
            try {
                content = await callOpenRouter(prompt, settings.openrouter_api_key);
            } catch (error) {
                console.warn('⚠️ Tutor OpenRouter failed:', error.message);
            }
        }

        // Fallback to Gemini
        if (!content && settings.gemini_api_key && settings.gemini_api_key.trim()) {
            try {
                content = await callGemini(prompt, settings.gemini_api_key);
            } catch (error) {
                console.warn('⚠️ Tutor Gemini failed:', error.message);
            }
        }

        if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { answer: content, followUpSuggestions: [] };
        }

        return {
            answer: `I can help you understand more about ${topic}. Please ensure you have an API key configured in Settings for the best experience!`,
            followUpSuggestions: [`What is the main concept of ${topic}?`, `How is ${topic} used in real life?`]
        };

    } catch (error) {
        console.error('Tutor Error:', error);
        return {
            answer: `I encountered an issue answering your question. Please check your API keys in Settings.`,
            followUpSuggestions: []
        };
    }
};

export default { generateDeepStudy, askTutor, STUDY_LEVELS, SUBJECT_TYPES, detectSubjectType };

/**
 * Deep Study Service
 * Zero to Hero Learning - Uses GPT-4o / Gemini fallback
 * Supports: Science, Math, Coding, History, General Knowledge
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
        [SUBJECT_TYPES.SCIENCE]: 'Use visual analogies, real-world examples, and explain the "why" behind phenomena. Include relevant experiments.',
        [SUBJECT_TYPES.MATHEMATICS]: 'Show step-by-step solutions, explain the logic, use visual representations.',
        [SUBJECT_TYPES.CODING]: 'Include code examples. Explain with practical use cases.',
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
        { "type": "mechanism", "text": "How it works explanation" },
        { "type": "components", "items": ["Component 1", "Component 2"] },
        { "type": "process", "steps": ["Step 1", "Step 2", "Step 3"] },
        { "type": "connections", "text": "Related concepts" }
    ],
    "selfCheck": "A deeper question"
}`,

        [STUDY_LEVELS.APPLICATION]: `Show practical applications of "${topic}".

STYLE: ${style}

Return ONLY valid JSON:
{
    "level": "application",
    "title": "Applying ${topic} in Practice",
    "keyQuestion": "How is ${topic} used in real life?",
    "content": [
        { "type": "realWorld", "examples": ["Example 1", "Example 2", "Example 3"] },
        { "type": "exercise", "problem": "A practice problem", "solution": "Step-by-step solution" },
        { "type": "commonMistakes", "items": ["Mistake 1", "Mistake 2"] }
    ],
    "selfCheck": "An application question"
}`,

        [STUDY_LEVELS.MASTERY]: `Advanced concepts of "${topic}" for mastery.

STYLE: ${style}

Return ONLY valid JSON:
{
    "level": "mastery",
    "title": "Mastering ${topic}",
    "keyQuestion": "What are the advanced aspects of ${topic}?",
    "content": [
        { "type": "advanced", "text": "Advanced concepts" },
        { "type": "edgeCases", "items": ["Edge case 1", "Edge case 2"] },
        { "type": "expertTips", "items": ["Tip 1", "Tip 2"] },
        { "type": "furtherStudy", "resources": ["Topic 1", "Topic 2"] }
    ],
    "selfCheck": "A challenging question"
}`
    };

    return prompts[level];
};

/**
 * Call GPT-4o Mini via RapidAPI
 */
async function callGPT4o(prompt, apiKey) {
    const response = await fetch('https://gpt-4o-mini2.p.rapidapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'gpt-4o-mini2.p.rapidapi.com',
            'x-rapidapi-key': apiKey
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            stream: false
        })
    });

    if (!response.ok) {
        throw new Error('GPT-4o API failed');
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

/**
 * Call Gemini API
 */
async function callGemini(prompt, apiKey) {
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
 * Generate fallback content when APIs fail
 */
function generateFallbackContent(topic, level, subjectType) {
    return {
        level,
        title: `Learning about ${topic}`,
        keyQuestion: `What is ${topic}?`,
        content: [
            { type: 'definition', text: `${topic} is an important concept that helps us understand the world better.` },
            {
                type: 'keyPoints', items: [
                    `${topic} has many practical applications`,
                    `Understanding ${topic} helps build foundational knowledge`,
                    `${topic} connects to many other subjects`
                ]
            },
            { type: 'funFact', text: `${topic} is studied by millions of students worldwide!` }
        ],
        selfCheck: `Can you explain ${topic} in your own words?`,
        subjectType,
        topic,
        _fallback: true
    };
}

/**
 * Generate deep study content for a topic at a specific level
 * Uses GPT-4o → Gemini → Fallback chain
 */
export const generateDeepStudy = async (topic, level = STUDY_LEVELS.FOUNDATION) => {
    const subjectType = detectSubjectType(topic);
    const prompt = getLevelPrompt(topic, level, subjectType);
    const settings = getSettings();

    console.log(`📚 Deep Study: ${topic} | Level: ${level} | Subject: ${subjectType}`);

    try {
        let content = null;

        // Try GPT-4o Mini first (built-in key)
        if (settings.rapidapi_key) {
            try {
                console.log('🚀 Deep Study: Using GPT-4o Mini');
                content = await callGPT4o(prompt, settings.rapidapi_key);
            } catch (error) {
                console.warn('⚠️ GPT-4o failed:', error.message);
            }
        }

        // Fallback to Gemini
        if (!content && settings.gemini_api_key) {
            try {
                console.log('🌟 Deep Study: Falling back to Gemini');
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
        console.log('📚 Using fallback content');
        return generateFallbackContent(topic, level, subjectType);

    } catch (error) {
        console.error('Deep Study Error:', error);
        return generateFallbackContent(topic, level, subjectType);
    }
};

/**
 * AI Tutor - Answer follow-up questions
 * Uses GPT-4o → Gemini → Basic response
 */
export const askTutor = async (topic, question, context) => {
    const settings = getSettings();
    const prompt = `You are an expert tutor teaching about "${topic}".

CONTEXT: The student has been learning about: ${context}

STUDENT'S QUESTION: ${question}

Provide a helpful, clear answer. Format as JSON:
{
    "answer": "Your detailed answer",
    "followUpSuggestions": ["Related question 1", "Related question 2"]
}`;

    try {
        let content = null;

        // Try GPT-4o Mini
        if (settings.rapidapi_key) {
            try {
                content = await callGPT4o(prompt, settings.rapidapi_key);
            } catch (error) {
                console.warn('⚠️ Tutor GPT-4o failed:', error.message);
            }
        }

        // Fallback to Gemini
        if (!content && settings.gemini_api_key) {
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
            answer: `I can help you understand more about ${topic}. Please try asking a more specific question, or check your API settings for better responses.`,
            followUpSuggestions: [`What is the main concept of ${topic}?`, `How is ${topic} used in real life?`]
        };

    } catch (error) {
        console.error('Tutor Error:', error);
        return {
            answer: `I encountered an issue answering your question. Please check your settings and try again.`,
            followUpSuggestions: []
        };
    }
};

export default {
    generateDeepStudy,
    askTutor,
    detectSubjectType,
    STUDY_LEVELS,
    SUBJECT_TYPES
};

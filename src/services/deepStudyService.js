/**
 * Deep Study Service - FINAL EDITION
 * Fallback chain: OpenRouter → Gemini → GPT-4o Mini → Generated Content
 */

import { getSettings } from './settingsService';

// Embedded RapidAPI key for GPT-4o Mini - THE SAVIOUR
const RAPIDAPI_KEY = '628a008275msh65a3ab23b2318d4p1f4a2cjsn481bddb5b5ae';

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

export const detectSubjectType = (topic) => {
    const topicLower = topic.toLowerCase();
    if (/physics|chemistry|biology|quantum|atom|molecule|cell|dna|evolution|gravity|energy|force|buoyancy/.test(topicLower)) return SUBJECT_TYPES.SCIENCE;
    if (/math|calculus|algebra|geometry|equation|theorem|integral|derivative|statistics|probability/.test(topicLower)) return SUBJECT_TYPES.MATHEMATICS;
    if (/programming|code|javascript|python|react|algorithm|function|variable|loop|api|database/.test(topicLower)) return SUBJECT_TYPES.CODING;
    if (/war|century|ancient|empire|king|revolution|civilization|era|dynasty|historical/.test(topicLower)) return SUBJECT_TYPES.HISTORY;
    if (/country|continent|ocean|mountain|river|climate|population|capital|region|map/.test(topicLower)) return SUBJECT_TYPES.GEOGRAPHY;
    return SUBJECT_TYPES.GENERAL;
};

const getTeachingStyle = (subjectType) => {
    const styles = {
        [SUBJECT_TYPES.SCIENCE]: 'Use visual analogies, real-world examples.',
        [SUBJECT_TYPES.MATHEMATICS]: 'Show step-by-step solutions.',
        [SUBJECT_TYPES.CODING]: 'Include code examples.',
        [SUBJECT_TYPES.HISTORY]: 'Provide timeline context.',
        [SUBJECT_TYPES.GEOGRAPHY]: 'Include spatial relationships.',
        [SUBJECT_TYPES.GENERAL]: 'Use clear explanations.'
    };
    return styles[subjectType] || styles[SUBJECT_TYPES.GENERAL];
};

const getLevelPrompt = (topic, level, subjectType) => {
    const style = getTeachingStyle(subjectType);
    const prompts = {
        [STUDY_LEVELS.FOUNDATION]: `Teach "${topic}" to a beginner. ${style} Return JSON: {"level":"foundation","title":"Basics of ${topic}","keyQuestion":"What is ${topic}?","content":[{"type":"definition","text":"..."},{"type":"analogy","text":"..."},{"type":"keyPoints","items":["..."]},{"type":"funFact","text":"..."}],"selfCheck":"..."}`,
        [STUDY_LEVELS.UNDERSTANDING]: `Explain HOW "${topic}" works. ${style} Return JSON: {"level":"understanding","title":"How ${topic} Works","keyQuestion":"How does ${topic} work?","content":[{"type":"mechanism","text":"..."},{"type":"components","items":["..."]},{"type":"process","steps":["..."]}],"selfCheck":"..."}`,
        [STUDY_LEVELS.APPLICATION]: `Show practical uses of "${topic}". ${style} Return JSON: {"level":"application","title":"Applying ${topic}","keyQuestion":"How is ${topic} used?","content":[{"type":"realWorld","examples":["..."]},{"type":"exercise","problem":"...","solution":"..."}],"selfCheck":"..."}`,
        [STUDY_LEVELS.MASTERY]: `Expert-level "${topic}". ${style} Return JSON: {"level":"mastery","title":"Mastering ${topic}","keyQuestion":"What do experts know?","content":[{"type":"advanced","text":"..."},{"type":"commonMistakes","items":["..."]},{"type":"expertTips","items":["..."]},{"type":"furtherStudy","resources":["..."]}],"selfCheck":"..."}`
    };
    return prompts[level];
};

// API 1: OpenRouter
async function callOpenRouter(prompt, apiKey) {
    console.log('🚀 Trying OpenRouter...');
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
    if (!response.ok) throw new Error(`OpenRouter: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

// API 2: Gemini
async function callGemini(prompt, apiKey) {
    console.log('🌟 Trying Gemini...');
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
        } catch (e) { console.warn(`Gemini ${model} failed`); }
    }
    throw new Error('Gemini failed');
}

// API 3: GPT-4o Mini via RapidAPI - THE SAVIOUR
async function callGPT4oMini(prompt) {
    console.log('💎 Trying GPT-4o Mini (saviour)...');
    const response = await fetch('https://gpt-4o-mini2.p.rapidapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'gpt-4o-mini2.p.rapidapi.com',
            'x-rapidapi-key': RAPIDAPI_KEY
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            stream: false
        })
    });
    if (!response.ok) throw new Error(`GPT-4o Mini: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

// Fallback content generator
function generateFallbackContent(topic, level, subjectType) {
    console.log('📚 Using generated fallback content');
    const baseContent = {
        level, subjectType, topic,
        title: `Learning about ${topic}`,
        keyQuestion: `What is ${topic}?`,
        selfCheck: `Can you explain ${topic}?`
    };

    const contentByLevel = {
        [STUDY_LEVELS.FOUNDATION]: [
            { type: 'definition', text: `${topic} is a fundamental concept that helps us understand important principles in this field.` },
            { type: 'analogy', text: `Think of ${topic} like building blocks - each piece connects to form a bigger picture.` },
            { type: 'keyPoints', items: [`${topic} has practical applications`, `Understanding ${topic} builds a foundation`, `${topic} connects to other concepts`] },
            { type: 'funFact', text: `Many discoveries have been made by studying ${topic} from different angles!` }
        ],
        [STUDY_LEVELS.UNDERSTANDING]: [
            { type: 'mechanism', text: `${topic} works through interconnected processes that produce observable outcomes.` },
            { type: 'components', items: ['Core principles', 'Supporting elements', 'Interaction patterns'] },
            { type: 'process', steps: ['Identify basic elements', 'Understand relationships', 'Apply to new situations'] }
        ],
        [STUDY_LEVELS.APPLICATION]: [
            { type: 'realWorld', examples: ['Professional applications', 'Everyday uses', 'Research contexts'] },
            { type: 'exercise', problem: `Apply ${topic} to solve a real problem`, solution: 'Analyze, identify principles, apply systematically' }
        ],
        [STUDY_LEVELS.MASTERY]: [
            { type: 'advanced', text: `Expert-level ${topic} involves recognizing subtle patterns and connections.` },
            { type: 'commonMistakes', items: ['Overlooking fundamentals', 'Rushing through basics', 'Not practicing enough'] },
            { type: 'expertTips', items: ['Practice regularly', 'Teach others', 'Connect to related fields'] },
            { type: 'furtherStudy', resources: ['Advanced textbooks', 'Research papers', 'Expert tutorials'] }
        ]
    };

    return { ...baseContent, content: contentByLevel[level] || contentByLevel[STUDY_LEVELS.FOUNDATION] };
}

/**
 * Main: Generate Deep Study content
 * Fallback chain: OpenRouter → Gemini → GPT-4o Mini → Generated
 */
export const generateDeepStudy = async (topic, level = STUDY_LEVELS.FOUNDATION) => {
    const subjectType = detectSubjectType(topic);
    const prompt = getLevelPrompt(topic, level, subjectType);
    const settings = getSettings();

    console.log(`📚 Deep Study: ${topic} | Level: ${level}`);

    let content = null;

    // 1. Try OpenRouter
    if (!content && settings.openrouter_api_key?.trim()) {
        try {
            content = await callOpenRouter(prompt, settings.openrouter_api_key);
        } catch (e) { console.warn('⚠️ OpenRouter failed:', e.message); }
    }

    // 2. Try Gemini
    if (!content && settings.gemini_api_key?.trim()) {
        try {
            content = await callGemini(prompt, settings.gemini_api_key);
        } catch (e) { console.warn('⚠️ Gemini failed:', e.message); }
    }

    // 3. Try GPT-4o Mini (THE SAVIOUR)
    if (!content) {
        try {
            content = await callGPT4oMini(prompt);
        } catch (e) { console.warn('⚠️ GPT-4o Mini failed:', e.message); }
    }

    // Parse JSON response
    if (content) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                result.subjectType = subjectType;
                result.topic = topic;
                return result;
            }
        } catch (e) { console.warn('JSON parse failed'); }
    }

    // 4. Fallback to generated content
    return generateFallbackContent(topic, level, subjectType);
};

/**
 * Ask the AI Tutor
 * Fallback chain: OpenRouter → Gemini → GPT-4o Mini → Generic response
 */
export const askTutor = async (topic, question, context) => {
    const settings = getSettings();
    const prompt = `You are an expert tutor teaching "${topic}".
Context: ${context}
Question: ${question}

Answer clearly. Format code with \`\`\` blocks. Return JSON: {"answer":"...","followUpSuggestions":["..."]}`;

    let content = null;

    // 1. Try OpenRouter
    if (!content && settings.openrouter_api_key?.trim()) {
        try { content = await callOpenRouter(prompt, settings.openrouter_api_key); }
        catch (e) { console.warn('⚠️ Tutor OpenRouter failed'); }
    }

    // 2. Try Gemini
    if (!content && settings.gemini_api_key?.trim()) {
        try { content = await callGemini(prompt, settings.gemini_api_key); }
        catch (e) { console.warn('⚠️ Tutor Gemini failed'); }
    }

    // 3. Try GPT-4o Mini (THE SAVIOUR)
    if (!content) {
        try { content = await callGPT4oMini(prompt); }
        catch (e) { console.warn('⚠️ Tutor GPT-4o Mini failed'); }
    }

    // Parse response
    if (content) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            return { answer: content, followUpSuggestions: [] };
        } catch (e) { return { answer: content, followUpSuggestions: [] }; }
    }

    return {
        answer: `I can help with ${topic}. Please check your API settings for better responses!`,
        followUpSuggestions: [`What is ${topic}?`, `How is ${topic} used?`]
    };
};

export default { generateDeepStudy, askTutor, STUDY_LEVELS, SUBJECT_TYPES, detectSubjectType };

/**
 * Deep Study Service
 * Zero to Hero Learning - Progressive knowledge building
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

    // Science keywords
    if (/physics|chemistry|biology|quantum|atom|molecule|cell|dna|evolution|gravity|energy|force/.test(topicLower)) {
        return SUBJECT_TYPES.SCIENCE;
    }

    // Math keywords
    if (/math|calculus|algebra|geometry|equation|theorem|integral|derivative|statistics|probability/.test(topicLower)) {
        return SUBJECT_TYPES.MATHEMATICS;
    }

    // Coding keywords
    if (/programming|code|javascript|python|react|algorithm|function|variable|loop|api|database/.test(topicLower)) {
        return SUBJECT_TYPES.CODING;
    }

    // History keywords
    if (/war|century|ancient|empire|king|revolution|civilization|era|dynasty|historical/.test(topicLower)) {
        return SUBJECT_TYPES.HISTORY;
    }

    // Geography keywords
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
        [SUBJECT_TYPES.SCIENCE]: 'Use visual analogies, real-world examples, and explain the "why" behind phenomena. Include relevant experiments or observations.',
        [SUBJECT_TYPES.MATHEMATICS]: 'Show step-by-step solutions, explain the logic, use visual representations. Build from simple to complex.',
        [SUBJECT_TYPES.CODING]: 'Include code examples with syntax highlighting markers. Explain with practical use cases. Show before/after comparisons.',
        [SUBJECT_TYPES.HISTORY]: 'Provide timeline context, cause-and-effect relationships, key figures, and lasting impacts.',
        [SUBJECT_TYPES.GEOGRAPHY]: 'Include spatial relationships, statistics, cultural context, and environmental factors.',
        [SUBJECT_TYPES.GENERAL]: 'Use clear explanations, relevant examples, and build logical connections between concepts.'
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

TEACHING STYLE: ${style}

Generate a JSON response with:
{
    "level": "foundation",
    "title": "Understanding the Basics of ${topic}",
    "keyQuestion": "What is ${topic} and why does it matter?",
    "content": [
        {
            "type": "definition",
            "text": "Simple, clear definition"
        },
        {
            "type": "analogy", 
            "text": "Real-world analogy to make it relatable"
        },
        {
            "type": "keyPoints",
            "items": ["3-4 fundamental concepts"]
        },
        {
            "type": "funFact",
            "text": "Interesting fact to spark curiosity"
        }
    ],
    "selfCheck": "A simple question to verify understanding"
}`,

        [STUDY_LEVELS.UNDERSTANDING]: `Building on foundation knowledge, explain HOW "${topic}" works in depth.

TEACHING STYLE: ${style}

Generate a JSON response with:
{
    "level": "understanding",
    "title": "How ${topic} Works",
    "keyQuestion": "What are the mechanisms and principles behind ${topic}?",
    "content": [
        {
            "type": "mechanism",
            "text": "Detailed explanation of how it works"
        },
        {
            "type": "components",
            "items": ["Key components/parts with explanations"]
        },
        {
            "type": "process",
            "steps": ["Step-by-step process if applicable"]
        },
        {
            "type": "connections",
            "text": "How this connects to related concepts"
        }
    ],
    "selfCheck": "A deeper question to verify understanding"
}`,

        [STUDY_LEVELS.APPLICATION]: `Show practical applications and examples of "${topic}".

TEACHING STYLE: ${style}

Generate a JSON response with:
{
    "level": "application",
    "title": "Applying ${topic} in Practice",
    "keyQuestion": "How is ${topic} used in real life?",
    "content": [
        {
            "type": "realWorld",
            "examples": ["3-4 real-world applications"]
        },
        {
            "type": "exercise",
            "problem": "A practice problem or scenario",
            "solution": "Step-by-step solution"
        },
        {
            "type": "commonMistakes",
            "items": ["Common misconceptions to avoid"]
        }
    ],
    "selfCheck": "An application-based question"
}`,

        [STUDY_LEVELS.MASTERY]: `Advanced concepts and edge cases of "${topic}" for mastery.

TEACHING STYLE: ${style}

Generate a JSON response with:
{
    "level": "mastery",
    "title": "Mastering ${topic}",
    "keyQuestion": "What are the advanced aspects and nuances of ${topic}?",
    "content": [
        {
            "type": "advanced",
            "text": "Advanced concepts and nuances"
        },
        {
            "type": "edgeCases",
            "items": ["Edge cases, exceptions, or special scenarios"]
        },
        {
            "type": "expertTips",
            "items": ["Tips from expert perspective"]
        },
        {
            "type": "furtherStudy",
            "resources": ["Suggested topics for further exploration"]
        }
    ],
    "selfCheck": "A challenging mastery-level question"
}`,
    };

    return prompts[level];
};

/**
 * Generate deep study content for a topic at a specific level
 */
export const generateDeepStudy = async (topic, level = STUDY_LEVELS.FOUNDATION, apiKey) => {
    const subjectType = detectSubjectType(topic);
    const prompt = getLevelPrompt(topic, level, subjectType);

    console.log(`📚 Deep Study: ${topic} | Level: ${level} | Subject: ${subjectType}`);

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Study Craft AI - Deep Study'
            },
            body: JSON.stringify({
                model: 'arcee-ai/trinity-large-preview:free',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            result.subjectType = subjectType;
            result.topic = topic;
            return result;
        }

        throw new Error('Could not parse response');
    } catch (error) {
        console.error('Deep Study Error:', error);
        throw error;
    }
};

/**
 * AI Tutor - Answer follow-up questions
 */
export const askTutor = async (topic, question, context, apiKey) => {
    const prompt = `You are an expert tutor teaching about "${topic}".

CONTEXT: The student has been learning about: ${context}

STUDENT'S QUESTION: ${question}

Provide a helpful, clear answer. If the question is unclear, ask for clarification.
Format your response as JSON:
{
    "answer": "Your detailed answer",
    "followUpSuggestions": ["2-3 related questions they might want to ask next"]
}`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Study Craft AI - Tutor'
            },
            body: JSON.stringify({
                model: 'arcee-ai/trinity-large-preview:free',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        const content = data.choices[0].message.content;

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return { answer: content, followUpSuggestions: [] };
    } catch (error) {
        console.error('Tutor Error:', error);
        throw error;
    }
};

export default {
    generateDeepStudy,
    askTutor,
    detectSubjectType,
    STUDY_LEVELS,
    SUBJECT_TYPES
};

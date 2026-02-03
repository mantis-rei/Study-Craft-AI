/**
 * Wikipedia Service - Enhanced with Multi-Source Intelligence
 * Fetches real information from MULTIPLE sources for smart mock mode
 * NOW ALWAYS uses intelligent source selection!
 */

import {
    aggregateContent,
    detectDeepSearch,
    extractTopic
} from './multiSourceService.js';

const WIKIPEDIA_API = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const SIMPLE_WIKIPEDIA_API = 'https://simple.wikipedia.org/api/rest_v1/page/summary/';

/**
 * Fetch Wikipedia summary for a topic
 */
export const fetchWikipediaSummary = async (topic) => {
    try {
        const encodedTopic = encodeURIComponent(topic);
        const response = await fetch(`${WIKIPEDIA_API}${encodedTopic}`);

        if (!response.ok) {
            // Try Simple Wikipedia as fallback
            console.log('Trying Simple Wikipedia...');
            const simpleResponse = await fetch(`${SIMPLE_WIKIPEDIA_API}${encodedTopic}`);
            if (!simpleResponse.ok) {
                throw new Error('Topic not found on Wikipedia');
            }
            const simpleData = await simpleResponse.json();
            return {
                title: simpleData.title,
                summary: simpleData.extract,
                description: simpleData.description,
                url: simpleData.content_urls?.desktop?.page,
                source: 'Simple Wikipedia'
            };
        }

        const data = await response.json();
        return {
            title: data.title,
            summary: data.extract,
            description: data.description,
            url: data.content_urls?.desktop?.page,
            source: 'Wikipedia'
        };
    } catch (error) {
        console.error('Wikipedia fetch error:', error);
        return null;
    }
};

/**
 * Extract meaningful sentences from text
 */
const extractSentences = (text) => {
    if (!text) return [];

    // Split by period, exclamation, or question mark
    const sentences = text
        .split(/[.!?]\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 20); // Filter out very short fragments

    return sentences;
};

/**
 * Extract key facts from sentences
 */
const extractKeyFacts = (sentences) => {
    // Prioritize sentences with numbers, definitions, or important keywords
    const scored = sentences.map(sentence => {
        let score = 0;

        // Contains numbers or dates
        if (/\d+/.test(sentence)) score += 2;

        // Definition patterns
        if (/is\s+a\s+|are\s+|refers\s+to|defined\s+as/i.test(sentence)) score += 3;

        // Important keywords
        if (/important|significant|main|primary|key|essential|fundamental/i.test(sentence)) score += 2;

        // Not too long
        if (sentence.length < 150) score += 1;

        return { sentence, score };
    });

    return scored
        .sort((a, b) => b.score - a.score)
        .map(item => item.sentence);
};

/**
 * MAIN FUNCTION: Generate study materials
 * NOW ALWAYS uses multi-source intelligence for better content!
 */
export const generateFromWikipedia = async (topic) => {
    // ALWAYS use multi-source approach for better content!
    console.log(`📚 Intelligent Multi-Source Search: "${topic}"`);

    try {
        const aggregated = await aggregateContent(topic);

        if (!aggregated || !aggregated.introduction) {
            console.warn('⚠️ No content from multi-source, using generic fallback');
            return generateGenericContent(extractTopic(topic));
        }

        // Combine content from all sources
        const allContent = [
            aggregated.introduction,
            aggregated.mainContent,
            aggregated.deepDive
        ].filter(Boolean);

        console.log(`✅ Retrieved from ${allContent.length} sources:`, allContent.map(c => c.sourceName).join(', '));

        // Extract all sentences from all sources
        const allSentences = allContent
            .map(content => extractSentences(content.content))
            .flat();

        const keyFacts = extractKeyFacts(allSentences);

        // Generate notes (more for deep search)
        const noteCount = aggregated.isDeepSearch ? 8 : 6;
        const notes = keyFacts.slice(0, noteCount).map(s => s.endsWith('.') ? s : s + '.');

        // Generate slides from multiple sources
        const slides = [
            {
                title: `${aggregated.introduction.title} - Introduction`,
                bulletPoints: [
                    aggregated.introduction.description || 'Overview of the topic',
                    ...extractSentences(aggregated.introduction.content).slice(0, 2)
                ]
            },
            {
                title: 'Key Concepts',
                bulletPoints: keyFacts.slice(0, 3).map(s => s.substring(0, 100) + (s.length > 100 ? '...' : ''))
            }
        ];

        // Add deep dive slide if available
        if (aggregated.deepDive) {
            slides.push({
                title: `Advanced - ${aggregated.deepDive.sourceName}`,
                bulletPoints: extractSentences(aggregated.deepDive.content).slice(0, 3)
            });
        }

        // Add sources slide
        slides.push({
            title: `Sources Used (${aggregated.sourcesUsed})`,
            bulletPoints: aggregated.allSources.map(s =>
                `📚 ${s.sourceName}: ${s.title}`
            ).slice(0, 4)
        });

        // Generate quiz from comprehensive content
        const quiz = generateEnhancedQuiz(
            aggregated.mainContent.title,
            keyFacts,
            extractTopic(topic)
        );

        const imageKeywords = [
            extractTopic(topic),
            `${extractTopic(topic)} diagram`,
            aggregated.mainContent.description || extractTopic(topic)
        ];

        return {
            notes,
            imageKeywords,
            slides,
            quiz,
            source: `📚 Multi-Source (${aggregated.sourcesUsed} sources)`,
            sourceUrl: aggregated.mainContent.url,
            deepSearch: aggregated.isDeepSearch,
            sources: aggregated.allSources.map(s => s.sourceName)
        };
    } catch (error) {
        console.error('❌ Error in multi-source generation:', error);
        return generateGenericContent(topic);
    }
};

/**
 * Generate enhanced quiz questions from content
 */
const generateEnhancedQuiz = (title, facts, topic) => {
    const quiz = [];

    // Question 1: Main concept
    if (facts.length > 0) {
        const mainFact = facts[0];
        quiz.push({
            question: `What best describes ${title}?`,
            options: [
                mainFact.substring(0, 100),
                `A type of computer algorithm`,
                `A historical event from ancient times`,
                `A mathematical theorem`
            ].sort(() => Math.random() - 0.5), // Shuffle
            correctIndex: mainFact.substring(0, 100),
            explanation: mainFact
        });
    }

    // Question 2: Specific detail
    if (facts.length > 1) {
        const detail = facts[1];
        quiz.push({
            question: `Which statement about ${title} is true?`,
            options: [
                detail.substring(0, 100),
                `It was discovered last year`,
                `It only exists in theory`,
                `It has no practical applications`
            ].sort(() => Math.random() - 0.5),
            correctIndex: detail.substring(0, 100),
            explanation: detail
        });
    }

    // Question 3: Application/Importance
    if (facts.length > 2) {
        quiz.push({
            question: `Why is ${title} important?`,
            options: [
                `According to the source: ${facts[2].substring(0, 80)}...`,
                `It's not actually important`,
                `Only for entertainment purposes`,
                `Unknown significance`
            ].sort(() => Math.random() - 0.5),
            correctIndex: `According to the source: ${facts[2].substring(0, 80)}...`,
            explanation: facts[2]
        });
    }

    // Fix correctIndex to be actual index
    quiz.forEach(q => {
        const correctOption = q.correctIndex;
        q.correctIndex = q.options.findIndex(opt => opt === correctOption);
    });

    return quiz;
};

/**
 * Fallback for topics not on Wikipedia
 */
const generateGenericContent = (topic) => {
    return {
        notes: [
            `${topic} is an important subject worth studying.`,
            `To learn more about ${topic}, try enabling AI mode in settings.`,
            `Wikipedia doesn't have detailed information on this specific topic.`,
            `Consider searching for related terms or broader categories.`,
            `AI mode (with Gemini API) can provide more comprehensive content.`
        ],
        imageKeywords: [
            `${topic} concept`,
            `${topic} diagram`,
            `education learning`
        ],
        slides: [
            {
                title: `About ${topic}`,
                bulletPoints: [
                    `You're studying: ${topic}`,
                    'Limited info available in mock mode',
                    'Enable AI mode for better results'
                ]
            },
            {
                title: 'Recommendations',
                bulletPoints: [
                    'Try a more specific or common topic',
                    'Enable AI mode in settings (⚙️)',
                    'Search online resources for this topic'
                ]
            }
        ],
        quiz: [
            {
                question: `What are you currently studying?`,
                options: [
                    topic,
                    'General knowledge',
                    'Random topics',
                    'Nothing specific'
                ],
                correctIndex: 0,
                explanation: `You selected "${topic}" as your study topic. For comprehensive quiz questions, please enable AI mode.`
            }
        ],
        source: 'Generic Fallback',
        sourceUrl: null
    };
};

/**
 * Multi-Source Content Aggregator
 * Intelligently routes search queries to appropriate open-source search engines
 * Supports "deep search" mode for comprehensive information gathering
 */

// ============================================
// SOURCE CONFIGURATIONS
// ============================================

const SOURCES = {
    // Wikipedia - General knowledge, encyclopedia
    // Using Action API to bypass ad blockers (ERR_BLOCKED_BY_CLIENT)
    WIKIPEDIA: {
        name: 'Wikipedia',
        api: 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=',
        type: 'action_api',
        strengths: ['general', 'science', 'history', 'geography', 'biography']
    },

    // Simple Wikipedia - Easier explanations
    SIMPLE_WIKI: {
        name: 'Simple Wikipedia',
        api: 'https://simple.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=',
        type: 'action_api',
        strengths: ['beginner', 'simple', 'basics']
    },

    // Wikibooks - Structured learning materials
    WIKIBOOKS: {
        name: 'Wikibooks',
        api: 'https://en.wikibooks.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=',
        type: 'action_api',
        strengths: ['tutorial', 'learning', 'course', 'textbook', 'programming']
    },

    // Wikiversity - Educational resources
    WIKIVERSITY: {
        name: 'Wikiversity',
        api: 'https://en.wikiversity.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=',
        type: 'action_api',
        strengths: ['education', 'lesson', 'course', 'study']
    },

    // Wiktionary - Definitions and language
    WIKTIONARY: {
        name: 'Wiktionary',
        api: 'https://en.wiktionary.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=',
        type: 'action_api',
        strengths: ['definition', 'language', 'meaning', 'etymology']
    }
};

// ============================================
// INTELLIGENT SOURCE SELECTOR
// ============================================

/**
 * Detect if user wants deep/comprehensive search
 */
export const detectDeepSearch = (query) => {
    const deepSearchKeywords = [
        'deep search',
        'detailed',
        'comprehensive',
        'in-depth',
        'thorough',
        'complete guide',
        'everything about',
        'all about',
        'full information',
        'detailed analysis'
    ];

    const lowerQuery = query.toLowerCase();
    return deepSearchKeywords.some(keyword => lowerQuery.includes(keyword));
};

/**
 * Extract clean topic from query (remove deep search keywords)
 */
export const extractTopic = (query) => {
    const cleanQuery = query
        .toLowerCase()
        .replace(/deep search|detailed|comprehensive|in-depth|thorough/gi, '')
        .replace(/complete guide to|everything about|all about|full information on/gi, '')
        .trim();

    return cleanQuery || query;
};

/**
 * Determine content type from query
 */
export const detectContentType = (query) => {
    const lowerQuery = query.toLowerCase();

    // Programming/Code
    if (/\b(python|javascript|java|code|programming|algorithm|software)\b/i.test(query)) {
        return 'programming';
    }

    // Mathematics
    if (/\b(math|calculus|algebra|geometry|equation|theorem)\b/i.test(query)) {
        return 'mathematics';
    }

    // Science
    if (/\b(physics|chemistry|biology|science|molecule|atom|cell)\b/i.test(query)) {
        return 'science';
    }

    // History
    if (/\b(history|war|civilization|ancient|medieval|century)\b/i.test(query)) {
        return 'history';
    }

    // Language/Definition
    if (/\b(meaning|definition|what is|what does|etymology)\b/i.test(query)) {
        return 'definition';
    }

    // Tutorial/Learning
    if (/\b(how to|tutorial|learn|guide|course|lesson)\b/i.test(query)) {
        return 'tutorial';
    }

    return 'general';
};

/**
 * Select best sources for query based on content type
 */
export const selectSources = (query, isDeepSearch = false) => {
    const contentType = detectContentType(query);
    const sources = [];

    // Always include Wikipedia as primary source
    sources.push(SOURCES.WIKIPEDIA);

    // Add type-specific sources
    switch (contentType) {
        case 'programming':
        case 'tutorial':
            sources.push(SOURCES.WIKIBOOKS);
            sources.push(SOURCES.WIKIVERSITY);
            break;

        case 'definition':
            sources.push(SOURCES.WIKTIONARY);
            sources.push(SOURCES.SIMPLE_WIKI);
            break;

        case 'mathematics':
        case 'science':
            sources.push(SOURCES.WIKIBOOKS);
            sources.push(SOURCES.SIMPLE_WIKI);
            break;

        default:
            sources.push(SOURCES.SIMPLE_WIKI);
    }

    // Deep search: add all relevant sources
    if (isDeepSearch) {
        sources.push(SOURCES.WIKIBOOKS, SOURCES.WIKIVERSITY);
    }

    // Remove duplicates
    return [...new Set(sources)];
};

// ============================================
// CONTENT FETCHING
// ============================================

/**
 * Fetch content from a single source
 */
const fetchFromSource = async (source, topic) => {
    try {
        // Use Action API (not blocked by ad blockers!)
        const url = `${source.api}${encodeURIComponent(topic)}&origin=*`;
        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`${source.name} API returned ${response.status}`);
            return null;
        }

        const data = await response.json();

        // Handle Action API response format
        if (!data.query || !data.query.pages) {
            return null;
        }

        // Get the first (and usually only) page
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];

        // Check if page exists
        if (pageId === '-1' || !page.extract) {
            console.warn(`${source.name}: No content found for "${topic}"`);
            return null;
        }

        return {
            sourceName: source.name,
            sourceType: source.type,
            title: page.title,
            content: page.extract,
            description: page.extract.substring(0, 200) + '...',
            url: `https://en.${source.name.toLowerCase().replace(' ', '')}.org/wiki/${encodeURIComponent(page.title)}`,
            thumbnail: null
        };
    } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error.message);
        return null;
    }
};

/**
 * Fetch content from multiple sources in parallel
 */
export const fetchFromMultipleSources = async (topic, sources) => {
    console.log(`Fetching from ${sources.length} sources for: ${topic}`);

    const promises = sources.map(source => fetchFromSource(source, topic));
    const results = await Promise.all(promises);

    // Filter out null results (failed fetches)
    return results.filter(result => result !== null);
};

// ============================================
// CONTENT ORGANIZATION
// ============================================

/**
 * Score content by quality and relevance
 */
const scoreContent = (content, topic) => {
    let score = 0;

    // Length (prefer moderate length)
    const contentLength = content.content?.length || 0;
    if (contentLength > 100 && contentLength < 2000) score += 3;
    else if (contentLength >= 2000) score += 2;
    else if (contentLength > 50) score += 1;

    // Has description
    if (content.description) score += 2;

    // Has thumbnail
    if (content.thumbnail) score += 1;

    // Topic match in title
    const titleMatch = content.title?.toLowerCase().includes(topic.toLowerCase());
    if (titleMatch) score += 3;

    // Prefer educational sources for learning
    if (content.sourceName.includes('Wikibooks') || content.sourceName.includes('Wikiversity')) {
        score += 2;
    }

    return score;
};

/**
 * Organize content for step-by-step learning
 */
export const organizeForLearning = (contentArray, topic) => {
    if (!contentArray || contentArray.length === 0) {
        return null;
    }

    // Score and sort content
    const scoredContent = contentArray.map(content => ({
        ...content,
        score: scoreContent(content, topic)
    })).sort((a, b) => b.score - a.score);

    // Organize into learning sequence
    const organized = {
        // 1. Introduction (Simple Wikipedia or best general source)
        introduction: scoredContent.find(c => c.sourceName === 'Simple Wikipedia') || scoredContent[0],

        // 2. Main content (Wikipedia or highest scored)
        mainContent: scoredContent.find(c => c.sourceName === 'Wikipedia') || scoredContent[0],

        // 3. Deep dive (Wikibooks/Wikiversity if available)
        deepDive: scoredContent.find(c =>
            c.sourceName === 'Wikibooks' || c.sourceName === 'Wikiversity'
        ),

        // 4. All sources for reference
        allSources: scoredContent
    };

    return organized;
};

// ============================================
// MAIN AGGREGATION FUNCTION
// ============================================

/**
 * Intelligently aggregate content from multiple sources
 */
export const aggregateContent = async (query) => {
    // Detect deep search mode
    const isDeepSearch = detectDeepSearch(query);

    // Extract clean topic
    const topic = extractTopic(query);

    // Select appropriate sources
    const sources = selectSources(topic, isDeepSearch);

    console.log(`Mode: ${isDeepSearch ? 'DEEP SEARCH' : 'NORMAL'}`);
    console.log(`Topic: "${topic}"`);
    console.log(`Using ${sources.length} sources: ${sources.map(s => s.name).join(', ')}`);

    // Fetch from all sources
    const contentArray = await fetchFromMultipleSources(topic, sources);

    if (contentArray.length === 0) {
        return null;
    }

    // Organize content for learning
    const organized = organizeForLearning(contentArray, topic);

    return {
        topic,
        isDeepSearch,
        sourcesUsed: contentArray.length,
        ...organized
    };
};

// ============================================
// EXPORT FOR USE IN WIKIPEDIA SERVICE
// ============================================

export default {
    detectDeepSearch,
    extractTopic,
    detectContentType,
    selectSources,
    aggregateContent,
    organizeForLearning
};

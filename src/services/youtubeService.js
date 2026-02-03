/**
 * YouTube Search Service
 * Philosophy: "Intent Before Pixels" - every feature serves a purpose
 * This makes the YouTube Tutorials card FUNCTIONAL
 */

/**
 * Search YouTube for educational videos on a topic
 * Uses YouTube's public search endpoint (no API key needed for basic search)
 */
export const searchYouTube = async (topic, maxResults = 5) => {
    console.log(`🎬 Searching YouTube for: "${topic}"`);

    // Construct educational search query
    const searchQuery = encodeURIComponent(`${topic} tutorial explained`);

    // YouTube search URL (opens in new tab)
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

    // Generate curated video suggestions based on topic
    // These are pre-formatted links that will work
    const suggestions = [
        {
            title: `${topic} - Complete Tutorial`,
            description: 'Comprehensive video explanation',
            searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' complete tutorial')}`,
            directSearchUrl: youtubeSearchUrl
        },
        {
            title: `${topic} for Beginners`,
            description: 'Start from scratch with basics',
            searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' for beginners explained')}`,
        },
        {
            title: `${topic} in 10 Minutes`,
            description: 'Quick overview of key concepts',
            searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' explained in 10 minutes')}`,
        },
        {
            title: `${topic} - Crash Course`,
            description: 'Fast-paced comprehensive lesson',
            searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' crash course')}`,
        },
        {
            title: `${topic} Study Guide`,
            description: 'Perfect for exam preparation',
            searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' study guide exam')}`,
        }
    ];

    return {
        topic,
        mainSearchUrl: youtubeSearchUrl,
        suggestions: suggestions.slice(0, maxResults)
    };
};

/**
 * Open YouTube search in new tab
 */
export const openYouTubeSearch = (topic) => {
    const searchQuery = encodeURIComponent(`${topic} tutorial explained`);
    const url = `https://www.youtube.com/results?search_query=${searchQuery}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    return url;
};

/**
 * Generate YouTube embed URL (for future modal/preview feature)
 */
export const getYouTubeEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}`;
};

export default {
    searchYouTube,
    openYouTubeSearch,
    getYouTubeEmbedUrl
};

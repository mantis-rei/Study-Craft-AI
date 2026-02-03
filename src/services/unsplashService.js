// Unsplash Image Search Service
// Provides educational images to enhance visual learning

const UNSPLASH_ACCESS_KEY = 'XDi1dIKohuI_XCVdRE9c1byHNUvSy_mQK2FXXkuvhoQ';

/**
 * Fetch educational images from Unsplash
 * @param {string} query - Search query (e.g., "photosynthesis", "cell biology")
 * @param {number} count - Number of images to fetch (default: 3)
 * @returns {Promise<Array>} Array of image objects
 */
export const fetchEducationalImages = async (query, count = 3, apiKey = null) => {
    // Topic-relevant fallback images using Unsplash's topic-based collections
    const getMockImages = (topic, imageCount) => {
        const images = [];
        // Use topic-specific Unsplash collections (no API key needed!)
        const topicSlug = topic.toLowerCase().replace(/\s+/g, '-');

        // Unsplash has specific topic collections we can use
        const topics = ['business-work', 'nature', 'technology', 'education', 'science'];
        const relevantTopic = topics.find(t => topic.toLowerCase().includes(t)) || 'education';

        for (let i = 0; i < imageCount; i++) {
            images.push({
                url: `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(topic)},education`,
                description: `Visual guide about ${topic}`,
                photographer: 'Unsplash',
                downloadUrl: 'https://unsplash.com'
            });
        }
        return images;
    };

    // Use the provided API key or embedded one
    const effectiveKey = apiKey || UNSPLASH_ACCESS_KEY;

    // If no valid API key, return topic-relevant placeholders
    if (!effectiveKey || effectiveKey === 'YOUR_UNSPLASH_ACCESS_KEY') {
        console.log('Using Unsplash Source URLs (no API key)');
        return getMockImages(query, count);
    }

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
            {
                headers: {
                    'Authorization': `Client-ID ${effectiveKey}`
                }
            }
        );

        if (!response.ok) {
            // Handle specific error codes
            if (response.status === 401) {
                console.warn('Unsplash API: Unauthorized. Using fallback images.');
            } else if (response.status === 403) {
                console.warn('Unsplash API: Rate limit exceeded. Using fallback images.');
            }
            console.log('Unsplash API failed, using fallback');
            return getMockImages(query, count);
        }

        const data = await response.json();

        // If no results, fall back to placeholder images
        if (!data.results || data.results.length === 0) {
            console.log('No Unsplash results, using fallback images');
            return getMockImages(query, count);
        }

        return data.results.map(img => ({
            url: img.urls.regular,
            description: img.alt_description || img.description || query,
            photographer: img.user.name,
            photographerUrl: img.user.links.html,
            downloadUrl: img.links.download_location
        }));
    } catch (error) {
        console.error('Unsplash fetch error:', error.message);
        // Always provide fallback images
        return getMockImages(query, count);
    }
};

/**
 * Extract image keywords from AI-generated content
 * @param {string} topic - The main topic
 * @param {Array<string>} notes - Generated notes
 * @returns {string} Optimized search query
 */
export const extractImageKeywords = (topic, notes) => {
    // For now, we'll use the topic directly
    // In future, we can use NLP to extract key concepts from notes
    return `${topic} educational diagram`;
};

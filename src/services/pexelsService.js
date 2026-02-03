/**
 * Pexels API Service
 * Provides access to educational images AND videos
 * API Key: EIdFnChjLG764EvXH3aTHNvDyGEd8xJ1dkk3ZOaxxzrifQESxhCCXraq
 */

const PEXELS_API_KEY = 'EIdFnChjLG764EvXH3aTHNvDyGEd8xJ1dkk3ZOaxxzrifQESxhCCXraq';
const PEXELS_IMAGE_API = 'https://api.pexels.com/v1/search';
const PEXELS_VIDEO_API = 'https://api.pexels.com/videos/search';

/**
 * Fetch educational images from Pexels
 */
export const fetchPexelsImages = async (query, count = 10, apiKey = null) => {
    const effectiveKey = apiKey || PEXELS_API_KEY;

    try {
        const response = await fetch(
            `${PEXELS_IMAGE_API}?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
            {
                headers: {
                    'Authorization': effectiveKey
                }
            }
        );

        if (!response.ok) {
            console.warn('Pexels Images API failed:', response.status);
            return [];
        }

        const data = await response.json();

        return data.photos.map(photo => ({
            id: photo.id,
            url: photo.src.large,
            thumbnail: photo.src.medium,
            description: photo.alt || `Image about ${query}`,
            photographer: photo.photographer,
            photographerUrl: photo.photographer_url,
            downloadUrl: photo.url
        }));
    } catch (error) {
        console.error('Pexels Images error:', error);
        return [];
    }
};

/**
 * Fetch educational videos from Pexels
 */
export const fetchPexelsVideos = async (query, count = 5, apiKey = null) => {
    const effectiveKey = apiKey || PEXELS_API_KEY;

    try {
        const response = await fetch(
            `${PEXELS_VIDEO_API}?query=${encodeURIComponent(query)}&per_page=${count}`,
            {
                headers: {
                    'Authorization': effectiveKey
                }
            }
        );

        if (!response.ok) {
            console.warn('Pexels Videos API failed:', response.status);
            return [];
        }

        const data = await response.json();

        return data.videos.map(video => ({
            id: video.id,
            url: video.video_files[0].link, // Get first quality option
            thumbnail: video.image,
            description: `Video about ${query}`,
            duration: video.duration,
            width: video.width,
            height: video.height,
            user: video.user.name,
            userUrl: video.user.url
        }));
    } catch (error) {
        console.error('Pexels Videos error:', error);
        return [];
    }
};

/**
 * Fetch both images and videos (combined educational media)
 */
export const fetchEducationalMedia = async (query, apiKey = null) => {
    console.log(`🎬 Fetching media from Pexels for: "${query}"`);

    const [images, videos] = await Promise.all([
        fetchPexelsImages(query, 10, apiKey),
        fetchPexelsVideos(query, 3, apiKey)
    ]);

    console.log(`✅ Pexels: ${images.length} images, ${videos.length} videos`);

    return {
        images,
        videos,
        total: images.length + videos.length
    };
};

export default {
    fetchPexelsImages,
    fetchPexelsVideos,
    fetchEducationalMedia
};

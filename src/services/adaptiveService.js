/**
 * Adaptive Intelligence Service
 * Tracks performance and generates personalized learning paths
 */

const STORAGE_KEY = 'studycraft_performance';

/**
 * Performance data structure:
 * {
 *   [topic]: {
 *     attempts: number,
 *     correct: number,
 *     weakAreas: string[],
 *     lastStudied: timestamp,
 *     difficulty: 'beginner' | 'intermediate' | 'advanced'
 *   }
 * }
 */

/**
 * Track quiz performance
 * @param {string} topic - Current study topic
 * @param {Array} results - Quiz results [{question, correct, userAnswer}]
 */
export const trackPerformance = (topic, results) => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    if (!data[topic]) {
        data[topic] = {
            attempts: 0,
            correct: 0,
            weakAreas: [],
            lastStudied: Date.now(),
            difficulty: 'beginner'
        };
    }

    const topicData = data[topic];
    topicData.attempts += results.length;
    topicData.correct += results.filter(r => r.correct).length;
    topicData.lastStudied = Date.now();

    // Identify weak areas from wrong answers
    const wrongQuestions = results.filter(r => !r.correct);
    wrongQuestions.forEach(q => {
        // Extract key concepts from wrong answers
        const concepts = extractConcepts(q.question);
        concepts.forEach(concept => {
            if (!topicData.weakAreas.includes(concept)) {
                topicData.weakAreas.push(concept);
            }
        });
    });

    // Keep only recent weak areas (last 5)
    if (topicData.weakAreas.length > 5) {
        topicData.weakAreas = topicData.weakAreas.slice(-5);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return topicData;
};

/**
 * Extract key concepts from a question
 * @param {string} question - Quiz question
 * @returns {Array<string>} Key concepts
 */
const extractConcepts = (question) => {
    // Simple keyword extraction
    const keywords = question
        .toLowerCase()
        .replace(/[?.,!]/g, '')
        .split(' ')
        .filter(word => word.length > 4); // Words longer than 4 chars

    return keywords.slice(0, 3); // Top 3 keywords
};

/**
 * Get performance data for a topic
 * @param {string} topic - Study topic
 * @returns {Object} Performance data
 */
export const getPerformance = (topic) => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return data[topic] || null;
};

/**
 * Calculate mastery level
 * @param {string} topic - Study topic
 * @returns {number} Mastery percentage (0-100)
 */
export const getMasteryLevel = (topic) => {
    const perf = getPerformance(topic);
    if (!perf || perf.attempts === 0) return 0;

    return Math.round((perf.correct / perf.attempts) * 100);
};

/**
 * Generate follow-up suggestions based on weak areas
 * @param {string} topic - Study topic
 * @returns {Object} Suggestions
 */
export const generateFollowUp = (topic) => {
    const perf = getPerformance(topic);

    if (!perf || perf.weakAreas.length === 0) {
        return {
            needsFollowUp: false,
            message: 'Great job! You\'re mastering this topic. 🌟',
            suggestions: []
        };
    }

    const mastery = getMasteryLevel(topic);

    return {
        needsFollowUp: true,
        message: mastery < 50
            ? `You're still learning! Focus on these areas to improve. 📚`
            : mastery < 80
                ? `Good progress! Let's strengthen these areas. 💪`
                : `Almost there! A bit more practice on these topics. ⭐`,
        suggestions: perf.weakAreas.map(area => ({
            area,
            action: 'Review flashcards',
            priority: mastery < 50 ? 'high' : mastery < 80 ? 'medium' : 'low'
        })),
        mastery
    };
};

/**
 * Get difficulty recommendation based on performance
 * @param {string} topic - Study topic
 * @returns {string} Recommended difficulty level
 */
export const getRecommendedDifficulty = (topic) => {
    const mastery = getMasteryLevel(topic);

    if (mastery >= 80) return 'advanced';
    if (mastery >= 50) return 'intermediate';
    return 'beginner';
};

/**
 * Set difficulty preference
 * @param {string} topic - Study topic
 * @param {string} difficulty - Difficulty level
 */
export const setDifficulty = (topic, difficulty) => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    if (!data[topic]) {
        data[topic] = {
            attempts: 0,
            correct: 0,
            weakAreas: [],
            lastStudied: Date.now(),
            difficulty: difficulty
        };
    } else {
        data[topic].difficulty = difficulty;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/**
 * Get all performance data (for dashboard)
 * @returns {Object} All performance data
 */
export const getAllPerformance = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
};

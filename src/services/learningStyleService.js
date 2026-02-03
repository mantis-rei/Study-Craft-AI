/**
 * Learning Styles Service
 * Manages VARK learning style preferences and content adaptation
 */

const LEARNING_STYLE_KEY = 'studycraft_learning_style';

// VARK Learning Styles
export const LEARNING_STYLES = {
    VISUAL: {
        id: 'visual',
        name: 'Visual',
        icon: '👁️',
        description: 'Learning through seeing - charts, diagrams, colors, pictures',
        emoji: '📊',
        adaptations: {
            emphasizeImages: true,
            useColorCoding: true,
            showDiagrams: true,
            autoOpenSlides: true
        }
    },
    AUDITORY: {
        id: 'auditory',
        name: 'Auditory',
        icon: '👂',
        description: 'Learning through listening - discussions, lectures, audio',
        emoji: '🔊',
        adaptations: {
            autoEnableAudio: true,
            emphasizeSpeech: true,
            showTranscripts: true,
            autoOpenNotes: true // For text-to-speech
        }
    },
    READING_WRITING: {
        id: 'reading_writing',
        name: 'Reading/Writing',
        icon: '📝',
        description: 'Learning through text - notes, lists, written words',
        emoji: '✍️',
        adaptations: {
            emphasizeNotes: true,
            showDetailedText: true,
            provideWritingSuggestions: true,
            autoOpenNotes: true
        }
    },
    KINESTHETIC: {
        id: 'kinesthetic',
        name: 'Kinesthetic',
        icon: '✋',
        description: 'Learning through doing - hands-on activities, practice',
        emoji: '🎯',
        adaptations: {
            emphasizeQuiz: true,
            emphasizeFlashcards: true,
            showPracticeExercises: true,
            autoOpenQuiz: true
        }
    }
};

/**
 * Get current learning style
 */
export const getLearningStyle = () => {
    const stored = localStorage.getItem(LEARNING_STYLE_KEY);
    if (stored && LEARNING_STYLES[stored.toUpperCase()]) {
        return LEARNING_STYLES[stored.toUpperCase()];
    }
    // Default to visual
    return LEARNING_STYLES.VISUAL;
};

/**
 * Set learning style
 */
export const setLearningStyle = (styleId) => {
    const style = Object.values(LEARNING_STYLES).find(s => s.id === styleId);
    if (style) {
        localStorage.setItem(LEARNING_STYLE_KEY, styleId);
        console.log(`Learning style set to: ${style.name}`);
        return style;
    }
    return null;
};

/**
 * Get all available learning styles
 */
export const getAllLearningStyles = () => {
    return Object.values(LEARNING_STYLES);
};

/**
 * Determine which view to auto-open based on learning style
 */
export const getPreferredView = (style) => {
    if (!style) style = getLearningStyle();

    const { adaptations } = style;

    if (adaptations.autoOpenSlides) return 'slides';
    if (adaptations.autoOpenNotes) return 'notes';
    if (adaptations.autoOpenQuiz) return 'quiz';

    return 'notes'; // Default
};

/**
 * Get content presentation hints based on learning style
 */
export const getContentHints = (style) => {
    if (!style) style = getLearningStyle();

    return {
        learningStyle: style.name,
        styleId: style.id,
        icon: style.icon,
        emoji: style.emoji,
        ...style.adaptations
    };
};

/**
 * Check if a feature should be emphasized for this learning style
 */
export const shouldEmphasize = (feature, style) => {
    if (!style) style = getLearningStyle();

    const featureMap = {
        'images': 'emphasizeImages',
        'audio': 'autoEnableAudio',
        'notes': 'emphasizeNotes',
        'quiz': 'emphasizeQuiz',
        'flashcards': 'emphasizeFlashcards',
        'slides': 'autoOpenSlides'
    };

    const adaptationKey = featureMap[feature];
    return adaptationKey ? style.adaptations[adaptationKey] : false;
};

export default {
    LEARNING_STYLES,
    getLearningStyle,
    setLearningStyle,
    getAllLearningStyles,
    getPreferredView,
    getContentHints,
    shouldEmphasize
};

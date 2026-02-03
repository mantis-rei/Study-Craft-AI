/**
 * Settings Service
 * Manages user preferences and API keys
 * 
 * API Priority: OpenRouter → Gemini → Wikipedia (fallback)
 * Users can add their own keys or use the embedded Gemini key
 */

const SETTINGS_KEY = 'studycraft_settings';

// Embedded Gemini API key for demo purposes
// Get your own free key at: https://makersuite.google.com/app/apikey
const EMBEDDED_GEMINI_KEY = 'AIzaSyDEZCCk7U6e8S1jR0l2FEybXuq7kqjKVHw';

const DEFAULT_SETTINGS = {
    gemini_api_key: EMBEDDED_GEMINI_KEY, // Embedded for demo
    openrouter_api_key: '', // User can add their own
    pexels_api_key: 'EIdFnChjLG764EvXH3aTHNvDyGEd8xJ1dkk3ZOaxxzrifQESxhCCXraq',
    learning_mode: 'ai', // Default to AI mode (uses Gemini)
    auto_fetch_images: true,
    default_difficulty: 'intermediate'
};

/**
 * Get all settings
 */
export const getSettings = () => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Ensure we always have the embedded Gemini key if none is set
            if (!parsed.gemini_api_key) {
                parsed.gemini_api_key = EMBEDDED_GEMINI_KEY;
            }
            return { ...DEFAULT_SETTINGS, ...parsed };
        } catch (error) {
            console.error('Error parsing settings:', error);
            return DEFAULT_SETTINGS;
        }
    }
    return DEFAULT_SETTINGS;
};

/**
 * Save settings
 */
export const saveSettings = (settings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

/**
 * Update specific setting
 */
export const updateSetting = (key, value) => {
    const settings = getSettings();
    settings[key] = value;
    saveSettings(settings);
    return settings;
};

/**
 * Get specific setting
 */
export const getSetting = (key) => {
    const settings = getSettings();
    return settings[key];
};

/**
 * Reset to defaults (clears localStorage)
 */
export const resetSettings = () => {
    localStorage.removeItem(SETTINGS_KEY);
    return DEFAULT_SETTINGS;
};

/**
 * Check if Gemini key is configured
 */
export const hasGeminiKey = () => {
    const key = getSetting('gemini_api_key');
    return key && key.trim().length > 0;
};

/**
 * Check if OpenRouter key is configured
 */
export const hasOpenRouterKey = () => {
    const key = getSetting('openrouter_api_key');
    return key && key.trim().length > 0;
};

/**
 * Check if using AI mode
 */
export const isAIMode = () => {
    return getSetting('learning_mode') === 'ai';
};

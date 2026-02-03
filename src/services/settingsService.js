/**
 * Settings Service
 * Manages user preferences and API keys in localStorage
 * NOTE: Users need to provide their own OpenRouter API key from https://openrouter.ai
 */

const SETTINGS_KEY = 'studycraft_settings';

const DEFAULT_SETTINGS = {
    gemini_api_key: '',
    openrouter_api_key: '', // Users must provide their own key
    pexels_api_key: 'EIdFnChjLG764EvXH3aTHNvDyGEd8xJ1dkk3ZOaxxzrifQESxhCCXraq',
    learning_mode: 'mock', // Start in mock mode until user adds API key
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
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
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
 * Reset to defaults
 */
export const resetSettings = () => {
    localStorage.removeItem(SETTINGS_KEY); // Clear stored settings
    return DEFAULT_SETTINGS;
};

/**
 * Check if API key is configured
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

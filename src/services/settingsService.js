/**
 * Settings Service
 * Manages user preferences and API keys in localStorage
 */

const SETTINGS_KEY = 'studycraft_settings';

const DEFAULT_SETTINGS = {
    gemini_api_key: '',
    openrouter_api_key: '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', // Embedded default
    pexels_api_key: 'EIdFnChjLG764EvXH3aTHNvDyGEd8xJ1dkk3ZOaxxzrifQESxhCCXraq', // Embedded default
    learning_mode: 'ai', // 'ai' or 'mock' - default to AI mode
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
    saveSettings(DEFAULT_SETTINGS);
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
 * Check if using AI mode
 */
export const isAIMode = () => {
    return getSetting('learning_mode') === 'ai';
};

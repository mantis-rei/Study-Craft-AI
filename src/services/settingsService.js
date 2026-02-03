/**
 * Settings Service
 * API Priority: GPT-4o → Gemini → Wikipedia
 */

const SETTINGS_KEY = 'studycraft_settings';

// Embedded API keys for demo
const EMBEDDED_GEMINI_KEY = 'AIzaSyDEZCCk7U6e8S1jR0l2FEybXuq7kqjKVHw';
const EMBEDDED_RAPIDAPI_KEY = '628a008275msh65a3ab23b2318d4p1f4a2cjsn481bddb5b5ae';

const DEFAULT_SETTINGS = {
    gemini_api_key: EMBEDDED_GEMINI_KEY,
    openrouter_api_key: '',
    rapidapi_key: EMBEDDED_RAPIDAPI_KEY, // GPT-4o Mini
    pexels_api_key: 'EIdFnChjLG764EvXH3aTHNvDyGEd8xJ1dkk3ZOaxxzrifQESxhCCXraq',
    learning_mode: 'ai',
    auto_fetch_images: true,
    default_difficulty: 'intermediate'
};

export const getSettings = () => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Ensure embedded keys
            if (!parsed.gemini_api_key) parsed.gemini_api_key = EMBEDDED_GEMINI_KEY;
            if (!parsed.rapidapi_key) parsed.rapidapi_key = EMBEDDED_RAPIDAPI_KEY;
            return { ...DEFAULT_SETTINGS, ...parsed };
        } catch (error) {
            console.error('Error parsing settings:', error);
            return DEFAULT_SETTINGS;
        }
    }
    return DEFAULT_SETTINGS;
};

export const saveSettings = (settings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const updateSetting = (key, value) => {
    const settings = getSettings();
    settings[key] = value;
    saveSettings(settings);
    return settings;
};

export const getSetting = (key) => {
    const settings = getSettings();
    return settings[key];
};

export const resetSettings = () => {
    localStorage.removeItem(SETTINGS_KEY);
    return DEFAULT_SETTINGS;
};

export const hasGeminiKey = () => {
    const key = getSetting('gemini_api_key');
    return key && key.trim().length > 0;
};

export const hasOpenRouterKey = () => {
    const key = getSetting('openrouter_api_key');
    return key && key.trim().length > 0;
};

export const isAIMode = () => {
    return getSetting('learning_mode') === 'ai';
};

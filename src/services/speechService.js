/**
 * Text-to-Speech Service
 * Provides auditory learning mode using Web Speech API
 */

class SpeechService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.utterance = null;
        this.voices = [];
        this.currentVoiceIndex = 0;
        this.isPaused = false;

        // Load voices
        this.loadVoices();

        // Chrome requires listening for voiceschanged event
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
    }

    loadVoices() {
        this.voices = this.synth.getVoices();
        // Prefer English voices
        const englishVoices = this.voices.filter(voice => voice.lang.startsWith('en'));
        if (englishVoices.length > 0) {
            this.voices = englishVoices;
        }
    }

    /**
     * Speak text aloud
     * @param {string} text - Text to speak
     * @param {Object} options - Speech options
     */
    speak(text, options = {}) {
        const {
            rate = 1.0,        // Speech rate (0.1 to 10)
            pitch = 1.0,       // Pitch (0 to 2)
            volume = 1.0,      // Volume (0 to 1)
            voiceIndex = 0,
            onEnd = () => { },
            onStart = () => { },
            onPause = () => { },
            onResume = () => { }
        } = options;

        // Cancel any ongoing speech
        this.cancel();

        // Create new utterance
        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.rate = rate;
        this.utterance.pitch = pitch;
        this.utterance.volume = volume;

        // Set voice
        if (this.voices.length > 0) {
            this.utterance.voice = this.voices[voiceIndex] || this.voices[0];
        }

        // Event handlers
        this.utterance.onstart = onStart;
        this.utterance.onend = () => {
            this.isPaused = false;
            onEnd();
        };
        this.utterance.onpause = onPause;
        this.utterance.onresume = onResume;

        // Start speaking
        this.synth.speak(this.utterance);
        this.isPaused = false;
    }

    /**
     * Pause speech
     */
    pause() {
        if (this.synth.speaking && !this.isPaused) {
            this.synth.pause();
            this.isPaused = true;
        }
    }

    /**
     * Resume speech
     */
    resume() {
        if (this.isPaused) {
            this.synth.resume();
            this.isPaused = false;
        }
    }

    /**
     * Cancel speech
     */
    cancel() {
        this.synth.cancel();
        this.isPaused = false;
    }

    /**
     * Check if currently speaking
     */
    isSpeaking() {
        return this.synth.speaking;
    }

    /**
     * Get available voices
     */
    getVoices() {
        return this.voices;
    }
}

// Create singleton instance
const speechService = new SpeechService();

export default speechService;

/**
 * Convert notes array to readable text
 * @param {Array<string>} notes - Study notes
 * @returns {string} Formatted text for speech
 */
export const formatNotesForSpeech = (notes) => {
    if (!notes || notes.length === 0) return '';

    // Add pauses between notes for better comprehension
    return notes.map((note, index) => {
        return `Point ${index + 1}. ${note}.`;
    }).join(' ... '); // ... creates a natural pause
};

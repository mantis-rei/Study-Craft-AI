/**
 * Flashcard Generation Service
 * Auto-generates flashcards from notes and quiz data
 */

/**
 * Generate flashcards from notes
 * @param {Array<string>} notes - Study notes
 * @param {Array} quiz - Quiz questions
 * @returns {Array} Flashcard objects
 */
export const generateFlashcards = (notes, quiz = []) => {
    const flashcards = [];

    // Generate flashcards from quiz questions
    if (quiz && quiz.length > 0) {
        quiz.forEach((q, index) => {
            flashcards.push({
                id: `quiz-${index}`,
                front: q.question,
                back: q.options[q.correctIndex],
                explanation: q.explanation,
                type: 'quiz'
            });
        });
    }

    // Generate flashcards from notes (key concepts)
    if (notes && notes.length > 0) {
        notes.forEach((note, index) => {
            // Simple heuristic: If note contains "is" or "are", split into question/answer
            const hasDefinition = note.includes(' is ') || note.includes(' are ');

            if (hasDefinition) {
                const parts = note.split(/\s(?:is|are)\s/);
                if (parts.length >= 2) {
                    const subject = parts[0].trim();
                    const definition = parts.slice(1).join(' ').trim();

                    flashcards.push({
                        id: `note-${index}`,
                        front: `What is ${subject}?`,
                        back: definition,
                        explanation: note,
                        type: 'concept'
                    });
                }
            }
        });
    }

    return flashcards;
};

/**
 * Track flashcard study progress
 * @param {string} cardId - Flashcard ID
 * @param {boolean} remembered - Whether user remembered it
 */
export const trackProgress = (cardId, remembered) => {
    const key = 'studycraft_flashcard_progress';
    const progress = JSON.parse(localStorage.getItem(key) || '{}');

    if (!progress[cardId]) {
        progress[cardId] = { correct: 0, total: 0 };
    }

    progress[cardId].total += 1;
    if (remembered) {
        progress[cardId].correct += 1;
    }

    localStorage.setItem(key, JSON.stringify(progress));
    return progress[cardId];
};

/**
 * Get mastery level for a card
 * @param {string} cardId - Flashcard ID
 * @returns {number} Mastery percentage (0-100)
 */
export const getMasteryLevel = (cardId) => {
    const key = 'studycraft_flashcard_progress';
    const progress = JSON.parse(localStorage.getItem(key) || '{}');

    if (!progress[cardId] || progress[cardId].total === 0) {
        return 0;
    }

    return Math.round((progress[cardId].correct / progress[cardId].total) * 100);
};

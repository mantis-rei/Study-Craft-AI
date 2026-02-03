/**
 * Progress Service
 * Track user learning progress with Firebase
 */

import { db } from './firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

/**
 * Save study session to user's progress
 */
export const saveStudySession = async (userId, session) => {
    if (!userId) return;

    try {
        const progressRef = doc(db, 'progress', userId);
        const progressDoc = await getDoc(progressRef);

        const sessionData = {
            topic: session.topic,
            level: session.level || 'basic',
            timestamp: new Date().toISOString(),
            completed: session.completed || false
        };

        if (progressDoc.exists()) {
            await updateDoc(progressRef, {
                sessions: arrayUnion(sessionData),
                lastActivity: serverTimestamp(),
                totalSessions: (progressDoc.data().totalSessions || 0) + 1
            });
        } else {
            await setDoc(progressRef, {
                userId,
                sessions: [sessionData],
                bookmarks: [],
                lastActivity: serverTimestamp(),
                totalSessions: 1,
                createdAt: serverTimestamp()
            });
        }

        console.log('✅ Progress saved');
        return true;
    } catch (error) {
        console.error('Progress save error:', error);
        return false;
    }
};

/**
 * Get user's learning progress
 */
export const getProgress = async (userId) => {
    if (!userId) return null;

    try {
        const progressRef = doc(db, 'progress', userId);
        const progressDoc = await getDoc(progressRef);

        if (progressDoc.exists()) {
            return progressDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Get progress error:', error);
        return null;
    }
};

/**
 * Add topic to bookmarks
 */
export const addBookmark = async (userId, topic) => {
    if (!userId) return;

    try {
        const progressRef = doc(db, 'progress', userId);
        await updateDoc(progressRef, {
            bookmarks: arrayUnion({
                topic,
                addedAt: new Date().toISOString()
            })
        });
        console.log('⭐ Bookmark added');
        return true;
    } catch (error) {
        console.error('Bookmark error:', error);
        return false;
    }
};

/**
 * Get study statistics
 */
export const getStats = async (userId) => {
    const progress = await getProgress(userId);
    if (!progress) return { sessions: 0, topics: 0, streak: 0 };

    const uniqueTopics = new Set(progress.sessions?.map(s => s.topic) || []);

    return {
        sessions: progress.totalSessions || 0,
        topics: uniqueTopics.size,
        bookmarks: progress.bookmarks?.length || 0,
        lastActivity: progress.lastActivity
    };
};

export default {
    saveStudySession,
    getProgress,
    addBookmark,
    getStats
};

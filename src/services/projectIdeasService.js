/**
 * Project Ideas Service - FINAL EDITION
 * Fallback chain: OpenRouter → Gemini → GPT-4o Mini → Generated
 */

import { getSettings } from './settingsService';

// Embedded RapidAPI key for GPT-4o Mini - THE SAVIOUR
const RAPIDAPI_KEY = '628a008275msh65a3ab23b2318d4p1f4a2cjsn481bddb5b5ae';

// API 1: OpenRouter
async function callOpenRouter(prompt, apiKey) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Study Craft AI - Projects'
        },
        body: JSON.stringify({
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 2000
        })
    });
    if (!response.ok) throw new Error(`OpenRouter: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

// API 2: Gemini
async function callGemini(prompt, apiKey) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 2000 }
            })
        }
    );
    const data = await response.json();
    if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    }
    throw new Error('Gemini failed');
}

// API 3: GPT-4o Mini via RapidAPI - THE SAVIOUR
async function callGPT4oMini(prompt) {
    console.log('💎 Projects: Trying GPT-4o Mini (saviour)...');
    const response = await fetch('https://gpt-4o-mini2.p.rapidapi.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'gpt-4o-mini2.p.rapidapi.com',
            'x-rapidapi-key': RAPIDAPI_KEY
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            stream: false
        })
    });
    if (!response.ok) throw new Error(`GPT-4o Mini: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

// Fallback projects generator
function generateFallbackProjects(topic) {
    console.log('📚 Using generated fallback projects');
    return {
        topic,
        projects: {
            beginner: [
                { title: `${topic} Basics`, description: 'Build a solid foundation with fundamental concepts', skills: ['Research', 'Note-taking'], timeEstimate: '1-2 hours', tools: ['Internet', 'Notebook'], tags: ['beginner', 'foundation'] },
                { title: `${topic} Mind Map`, description: 'Create a visual map of key concepts', skills: ['Visual thinking', 'Organization'], timeEstimate: '1 hour', tools: ['Paper or digital tool'], tags: ['beginner', 'visual'] }
            ],
            intermediate: [
                { title: `${topic} Deep Analysis`, description: 'Compare and contrast different aspects', skills: ['Analysis', 'Critical thinking'], timeEstimate: '3-5 hours', tools: ['Research tools'], tags: ['intermediate', 'analysis'] },
                { title: `${topic} Presentation`, description: 'Create a comprehensive teaching presentation', skills: ['Communication', 'Design'], timeEstimate: '4-6 hours', tools: ['Presentation software'], tags: ['intermediate', 'teaching'] }
            ],
            advanced: [
                { title: `${topic} Original Project`, description: 'Build something innovative using your knowledge', skills: ['Synthesis', 'Innovation', 'Problem-solving'], timeEstimate: '1-2 weeks', tools: ['Various specialized tools'], tags: ['advanced', 'creative'] }
            ]
        }
    };
}

/**
 * Generate project ideas
 * Fallback chain: OpenRouter → Gemini → GPT-4o Mini → Generated
 */
export const generateProjectIdeas = async (topic) => {
    const settings = getSettings();

    const prompt = `Generate creative project ideas for "${topic}". Return JSON:
{
    "topic": "${topic}",
    "projects": {
        "beginner": [{"title":"...","description":"...","skills":["..."],"timeEstimate":"1-2 hours","tools":["..."],"tags":["beginner"]}],
        "intermediate": [{"title":"...","description":"...","skills":["..."],"timeEstimate":"3-5 hours","tools":["..."],"tags":["intermediate"]}],
        "advanced": [{"title":"...","description":"...","skills":["..."],"timeEstimate":"1-2 weeks","tools":["..."],"tags":["advanced"]}]
    }
}
Generate 2 projects per level. Be creative!`;

    let content = null;

    // 1. Try OpenRouter
    if (!content && settings.openrouter_api_key?.trim()) {
        try {
            console.log('💡 Projects: Using OpenRouter');
            content = await callOpenRouter(prompt, settings.openrouter_api_key);
        } catch (e) { console.warn('⚠️ OpenRouter failed:', e.message); }
    }

    // 2. Try Gemini
    if (!content && settings.gemini_api_key?.trim()) {
        try {
            console.log('💡 Projects: Using Gemini');
            content = await callGemini(prompt, settings.gemini_api_key);
        } catch (e) { console.warn('⚠️ Gemini failed:', e.message); }
    }

    // 3. Try GPT-4o Mini (THE SAVIOUR)
    if (!content) {
        try {
            content = await callGPT4oMini(prompt);
        } catch (e) { console.warn('⚠️ GPT-4o Mini failed:', e.message); }
    }

    // Parse response
    if (content) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
        } catch (e) { console.warn('JSON parse failed'); }
    }

    // 4. Fallback to generated projects
    return generateFallbackProjects(topic);
};

export default { generateProjectIdeas };

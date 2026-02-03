/**
 * Project Ideas Service - FINAL EDITION
 * Gets API key from settings internally
 * Uses OpenRouter → Gemini → Fallback chain
 */

import { getSettings } from './settingsService';

/**
 * Call OpenRouter API
 */
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

    if (!response.ok) {
        throw new Error(`OpenRouter failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

/**
 * Call Gemini API
 */
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

/**
 * Generate fallback project ideas
 */
function generateFallbackProjects(topic) {
    return {
        topic,
        projects: {
            beginner: [
                {
                    title: `${topic} Basics`,
                    description: 'Start with fundamentals and build a solid foundation',
                    skills: ['Research', 'Note-taking'],
                    timeEstimate: '1-2 hours',
                    tools: ['Internet', 'Notebook'],
                    tags: ['beginner', 'foundation']
                },
                {
                    title: `${topic} Mind Map`,
                    description: 'Create a visual representation of key concepts',
                    skills: ['Visual thinking', 'Organization'],
                    timeEstimate: '1 hour',
                    tools: ['Paper or digital tool'],
                    tags: ['beginner', 'visual']
                }
            ],
            intermediate: [
                {
                    title: `${topic} Deep Dive`,
                    description: 'Analyze and compare different aspects of this topic',
                    skills: ['Analysis', 'Critical thinking'],
                    timeEstimate: '3-5 hours',
                    tools: ['Research tools', 'Spreadsheet'],
                    tags: ['intermediate', 'analysis']
                },
                {
                    title: `${topic} Presentation`,
                    description: 'Build a comprehensive presentation teaching others',
                    skills: ['Communication', 'Design'],
                    timeEstimate: '4-6 hours',
                    tools: ['Presentation software'],
                    tags: ['intermediate', 'teaching']
                }
            ],
            advanced: [
                {
                    title: `${topic} Mastery Project`,
                    description: 'Create an original contribution or build something significant',
                    skills: ['Synthesis', 'Innovation', 'Problem-solving'],
                    timeEstimate: '1-2 weeks',
                    tools: ['Various specialized tools'],
                    tags: ['advanced', 'creative']
                }
            ]
        }
    };
}

/**
 * Generate project ideas for a topic
 * Gets API key from settings internally
 */
export const generateProjectIdeas = async (topic) => {
    const settings = getSettings();

    const prompt = `Generate creative project ideas for learning about "${topic}".

Return JSON format:
{
    "topic": "${topic}",
    "projects": {
        "beginner": [
            {
                "title": "Project name",
                "description": "What the project does and what you'll learn",
                "skills": ["skill 1", "skill 2"],
                "timeEstimate": "1-2 hours",
                "tools": ["tool 1", "tool 2"],
                "tags": ["beginner", "tag"]
            }
        ],
        "intermediate": [
            {
                "title": "Project name",
                "description": "What the project does",
                "skills": ["skills learned"],
                "timeEstimate": "3-5 hours",
                "tools": ["tools needed"],
                "tags": ["intermediate", "tag"]
            }
        ],
        "advanced": [
            {
                "title": "Project name",
                "description": "What the project does",
                "skills": ["skills learned"],
                "timeEstimate": "1-2 weeks",
                "tools": ["tools needed"],
                "tags": ["advanced", "tag"]
            }
        ]
    }
}

Generate 2 projects per level. Be creative and practical!`;

    try {
        let content = null;

        // Try OpenRouter first
        if (settings.openrouter_api_key && settings.openrouter_api_key.trim()) {
            try {
                console.log('💡 Project Ideas: Using OpenRouter');
                content = await callOpenRouter(prompt, settings.openrouter_api_key);
            } catch (error) {
                console.warn('⚠️ OpenRouter failed:', error.message);
            }
        }

        // Fallback to Gemini
        if (!content && settings.gemini_api_key && settings.gemini_api_key.trim()) {
            try {
                console.log('💡 Project Ideas: Using Gemini');
                content = await callGemini(prompt, settings.gemini_api_key);
            } catch (error) {
                console.warn('⚠️ Gemini failed:', error.message);
            }
        }

        // Parse response
        if (content) {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        }

        // Fallback to generated projects
        console.log('💡 Using fallback projects');
        return generateFallbackProjects(topic);

    } catch (error) {
        console.error('Project Ideas Error:', error);
        return generateFallbackProjects(topic);
    }
};

export default { generateProjectIdeas };

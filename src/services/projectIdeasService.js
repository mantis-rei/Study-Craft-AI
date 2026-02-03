/**
 * Project Ideas Service
 * AI-generated project suggestions for any topic
 */

/**
 * Generate project ideas for a topic
 */
export const generateProjectIdeas = async (topic, apiKey) => {
    const prompt = `Generate creative project ideas for learning about "${topic}".

Return JSON format:
{
    "topic": "${topic}",
    "projects": {
        "beginner": [
            {
                "title": "Project name",
                "description": "What the project does",
                "skills": ["skills learned"],
                "timeEstimate": "1-2 hours",
                "tools": ["tools needed"]
            }
        ],
        "intermediate": [
            {
                "title": "Project name",
                "description": "What the project does",
                "skills": ["skills learned"],
                "timeEstimate": "3-5 hours",
                "tools": ["tools needed"]
            }
        ],
        "advanced": [
            {
                "title": "Project name",
                "description": "What the project does",
                "skills": ["skills learned"],
                "timeEstimate": "1-2 weeks",
                "tools": ["tools needed"]
            }
        ]
    }
}

Generate 2-3 projects per level. Be creative and practical!`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Study Craft AI - Projects'
            },
            body: JSON.stringify({
                model: 'arcee-ai/trinity-large-preview:free',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
                max_tokens: 2000
            })
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        const content = data.choices[0].message.content;

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Could not parse response');
    } catch (error) {
        console.error('Project Ideas Error:', error);
        // Return fallback
        return {
            topic,
            projects: {
                beginner: [{ title: `${topic} Basics`, description: 'Start with fundamentals', skills: ['Research'], timeEstimate: '1-2 hours', tools: ['Internet'] }],
                intermediate: [{ title: `${topic} Deep Dive`, description: 'Intermediate project', skills: ['Analysis'], timeEstimate: '3-5 hours', tools: ['Notebook'] }],
                advanced: [{ title: `${topic} Mastery`, description: 'Advanced project', skills: ['Synthesis'], timeEstimate: '1 week', tools: ['Various'] }]
            }
        };
    }
};

export default { generateProjectIdeas };

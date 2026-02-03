/**
 * GPT-4o Mini Service via RapidAPI
 * Free tier API for educational content generation
 * Acts as fallback when other APIs hit rate limits
 */

const RAPIDAPI_URL = 'https://gpt-4o-mini2.p.rapidapi.com/v1/chat/completions';

// Embedded API key for demo
const RAPIDAPI_KEY = '628a008275msh65a3ab23b2318d4p1f4a2cjsn481bddb5b5ae';
const RAPIDAPI_HOST = 'gpt-4o-mini2.p.rapidapi.com';

/**
 * Educational content prompt
 */
const EDUCATIONAL_PROMPT = `You are an expert educational content creator. Generate comprehensive study materials.

Topic: {TOPIC}

IMPORTANT: Return ONLY valid JSON with this structure:
{
  "notes": ["6-8 educational notes about the topic"],
  "slides": [{"title": "Slide Title", "bulletPoints": ["3-4 points"]}],
  "quiz": [{"question": "Question?", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "Why correct"}]
}`;

/**
 * Generate educational content using GPT-4o Mini
 */
export const generateWithGPT4o = async (topic, apiKey = RAPIDAPI_KEY) => {
    console.log('🚀 Using GPT-4o Mini API');

    const prompt = EDUCATIONAL_PROMPT.replace('{TOPIC}', topic);

    try {
        const response = await fetch(RAPIDAPI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': RAPIDAPI_HOST,
                'x-rapidapi-key': apiKey
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                stream: false
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
            throw new Error('No content in response');
        }

        const content = data.choices[0].message.content;
        console.log('✅ GPT-4o Mini: Success');

        // Extract JSON
        let jsonString = content
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonString = jsonMatch[0];
        }

        const result = JSON.parse(jsonString);
        result.source = '🚀 GPT-4o Mini';
        return result;

    } catch (error) {
        console.error('GPT-4o Mini Error:', error);
        throw error;
    }
};

/**
 * Generate comprehensive notes for PDF
 */
export const generateFullNotes = async (topic, apiKey = RAPIDAPI_KEY) => {
    console.log('📝 Generating full notes for:', topic);

    const prompt = `Create COMPREHENSIVE study notes on "${topic}" for a student.

Include:
1. **Introduction** - What is it and why it matters
2. **Key Concepts** - Main ideas with detailed explanations  
3. **How It Works** - Step-by-step process or mechanism
4. **Examples** - Real-world applications or problems
5. **For Math/Coding topics**: Include formulas, code syntax, step-by-step solutions
6. **Summary** - Key takeaways
7. **Practice Questions** - 3-5 questions with answers

Format as JSON:
{
  "title": "${topic}",
  "sections": [
    {
      "heading": "Section Title",
      "content": "Detailed content with examples...",
      "codeExample": "// Optional code if relevant",
      "mathSteps": ["Step 1...", "Step 2..."]
    }
  ],
  "summary": ["Key point 1", "Key point 2"],
  "practiceQuestions": [{"question": "Q?", "answer": "A"}]
}`;

    try {
        const response = await fetch(RAPIDAPI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': RAPIDAPI_HOST,
                'x-rapidapi-key': apiKey
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                stream: false
            })
        });

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        const content = data.choices[0].message.content;

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Could not parse notes');
    } catch (error) {
        console.error('Full Notes Error:', error);
        throw error;
    }
};

/**
 * Generate project tutorial
 */
export const generateProjectTutorial = async (projectTitle, projectDescription, apiKey = RAPIDAPI_KEY) => {
    console.log('🔧 Generating project tutorial for:', projectTitle);

    const prompt = `Create a DETAILED step-by-step tutorial for this project:

PROJECT: ${projectTitle}
DESCRIPTION: ${projectDescription}

Include:
1. **Prerequisites** - What you need to know/have
2. **Setup** - Environment and tools setup
3. **Step-by-step Guide** - Detailed implementation steps
4. **Code Examples** - Complete code snippets with explanations
5. **Testing** - How to verify it works
6. **Next Steps** - How to extend the project

For coding projects: Include actual code with syntax highlighting markers.
For math projects: Include formulas and calculations.

Return JSON:
{
  "title": "${projectTitle}",
  "prerequisites": ["Prereq 1"],
  "setup": ["Setup step 1"],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "explanation": "What and why",
      "code": "// Code if applicable",
      "tip": "Optional tip"
    }
  ],
  "testing": ["Test step 1"],
  "nextSteps": ["Extension idea 1"]
}`;

    try {
        const response = await fetch(RAPIDAPI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': RAPIDAPI_HOST,
                'x-rapidapi-key': apiKey
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                stream: false
            })
        });

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        const content = data.choices[0].message.content;

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error('Could not parse tutorial');
    } catch (error) {
        console.error('Project Tutorial Error:', error);
        throw error;
    }
};

export default { generateWithGPT4o, generateFullNotes, generateProjectTutorial };

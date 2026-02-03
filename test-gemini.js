/**
 * Test Gemini API Key from Google AI Studio
 * 
 * Usage:
 *   node test-gemini.js YOUR_API_KEY
 * 
 * Get your key from: https://aistudio.google.com/app/apikey
 */

const API_KEY = process.argv[2];

if (!API_KEY) {
    console.log('❌ Please provide your Gemini API key as argument');
    console.log('');
    console.log('Usage: node test-gemini.js YOUR_API_KEY');
    console.log('');
    console.log('Get your key from: https://aistudio.google.com/app/apikey');
    process.exit(1);
}

async function testGemini() {
    console.log('========================================');
    console.log('   GEMINI API KEY TESTER');
    console.log('========================================');
    console.log('');
    console.log('🔑 Testing API key:', API_KEY.substring(0, 10) + '...');
    console.log('');

    // Models tried in the app (in order)
    const models = [
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-pro'
    ];

    for (const model of models) {
        console.log(`🌟 Testing model: ${model}...`);
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: 'Say "Hello" in one word' }] }]
                    })
                }
            );

            const data = await response.json();

            if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                console.log(`   ✅ SUCCESS: ${data.candidates[0].content.parts[0].text.trim()}`);
                console.log('');
                console.log('========================================');
                console.log('   🎉 YOUR API KEY IS VALID!');
                console.log('========================================');
                console.log('');
                console.log('Working model:', model);
                console.log('');
                console.log('✅ You can paste this key in Study Craft AI Settings!');
                console.log('   It will work perfectly for content generation.');
                return true;
            } else {
                const errorMsg = data.error?.message || 'Unknown error';
                console.log(`   ❌ FAILED: ${errorMsg.substring(0, 60)}...`);
            }
        } catch (error) {
            console.log(`   ❌ ERROR: ${error.message}`);
        }
    }

    console.log('');
    console.log('========================================');
    console.log('   ❌ API KEY NOT WORKING');
    console.log('========================================');
    console.log('');
    console.log('Possible issues:');
    console.log('1. Key is invalid or expired');
    console.log('2. Free quota exceeded (resets daily)');
    console.log('3. API quota exceeded - enable billing on Google Cloud');
    console.log('');
    console.log('Get a new FREE key at: https://aistudio.google.com/app/apikey');
    return false;
}

testGemini();

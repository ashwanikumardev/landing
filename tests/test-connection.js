require('dotenv').config();

async function testGeminiConnection() {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';

    console.log('Testing Gemini API Connection...');
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
    console.log('Model:', model);
    console.log('');

    if (!apiKey) {
        console.error('ERROR: GEMINI_API_KEY is not set in .env file');
        process.exit(1);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: 'Say hello in one word'
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 10
        }
    };

    try {
        console.log('Making request to:', `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('\n❌ API Error:');
            console.error('Status:', response.status);
            console.error('Message:', data.error?.message || JSON.stringify(data, null, 2));
            process.exit(1);
        }

        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log('\n✅ SUCCESS!');
        console.log('Response:', generatedText);
        console.log('\nGemini API is working correctly!');

    } catch (error) {
        console.error('\n❌ Connection Error:');
        console.error(error.message);
        process.exit(1);
    }
}

testGeminiConnection();

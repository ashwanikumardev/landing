require('dotenv').config();

async function quickTest() {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = 'gemini-pro';

    console.log('Quick Gemini Test');
    console.log('API Key:', apiKey ? 'SET' : 'NOT SET');
    console.log('Model:', model);

    if (!apiKey) {
        console.log('ERROR: API key not set');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hello' }] }]
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('SUCCESS!');
            console.log('Response:', data.candidates[0].content.parts[0].text);
        } else {
            console.log('FAILED');
            console.log('Status:', response.status);
            console.log('Error:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('EXCEPTION:', error.message);
    }
}

quickTest().then(() => process.exit(0)).catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});

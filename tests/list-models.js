require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('Listing available Gemini models...\n');

    if (!apiKey) {
        console.log('ERROR: API key not set');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.models) {
            console.log(`Found ${data.models.length} models:\n`);

            data.models.forEach(model => {
                const supportsGenerate = model.supportedGenerationMethods?.includes('generateContent');
                if (supportsGenerate) {
                    console.log(`✓ ${model.name}`);
                    console.log(`  Display Name: ${model.displayName}`);
                    console.log(`  Description: ${model.description || 'N/A'}`);
                    console.log('');
                }
            });
        } else {
            console.log('Error:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('Exception:', error.message);
    }
}

listModels().then(() => process.exit(0)).catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});

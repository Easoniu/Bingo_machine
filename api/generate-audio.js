export default async function handler(req, res) {
    // 允許跨域請求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { name } = req.query;
    if (!name) {
        return res.status(400).json({ error: 'Missing player name' });
    }

    const apiKey = process.env.FISH_AUDIO_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Fish Audio API Key not configured on Vercel' });
    }

    try {
        // 呼叫 Fish Audio API 生成語音
        const response = await fetch('https://api.fish.audio/v1/tts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Model': 'tts-1' // 依你的 Fish Audio 模型調整
            },
            body: JSON.stringify({
                text: `${name}`,
                format: 'mp3'
            })
        });

        if (!response.ok) {
            throw new Error(`Fish Audio API failed with status ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();

        res.setHeader('Content-Type', 'audio/mpeg');
        return res.send(Buffer.from(audioBuffer));
    } catch (error) {
        console.error('TTS Generation Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

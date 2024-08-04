const fetch = require('node-fetch');

const DUCKDUCKGO_API_URL = 'https://duckduckgo.com/duckchat/v1/chat';
const DUCKDUCKGO_HEADERS = {
  'x-vqd-4': '4-216627997908647439520026804833003885766',
  'accept': 'text/event-stream',
  'cookie': 'dcm=3',
  'priority': 'u=1, i',
  'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Android WebView";v="126"',
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 7 Build/QKQ1.190910.002) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.188 Mobile Safari/537.36'
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const prompt = req.query.isichat || 'hi';
    const response = await fetch(DUCKDUCKGO_API_URL, {
      method: 'POST',
      headers: DUCKDUCKGO_HEADERS,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    let resultText = '';
    response.body.on('data', (chunk) => {
      const chunkText = chunk.toString();
      // Extract messages from chunks and concatenate them
      const messages = chunkText.split('data: ').filter(data => data.trim() !== '[DONE]').map(data => {
        try {
          const parsed = JSON.parse(data);
          return parsed.message || '';
        } catch {
          return '';
        }
      }).join('');
      
      resultText += messages;
    });

    response.body.on('end', () => {
      res.status(200).send(resultText);
    });

  } catch (error) {
    res.status(500).send({ error: 'An error occurred' });
  }
};

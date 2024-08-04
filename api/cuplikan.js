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
    const username = req.query.username || 'instagram';

    const apiUrl = `https://gramsnap.com/api/ig/userInfoByUsername/${username}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const user = data.result.user;
    const result = {
      nama_lengkap: user.full_name || "Nama belum diisi",
      akun_privat: user.is_private
        ? `Akun atas ${username} ini di private`
        : `Akun atas ${username} ini publik`,
      bio: user.bio || "Tidak ada bio",
      jumlah_pengikut: user.follower_count || 0,
      jumlah_diikuti: user.following_count || 0,
      jumlah_media: user.media_count || 0
    };

    const prompt = `berikan roasting singkat dengan kejam, lucu, bikin dia marah, menyindir, serta menyakitkan dalam bahasa gaul untuk profile instagram berikut: nama pengguna: ${username}. Berikut detailnya: ${JSON.stringify(result)}`;

    const chatResponse = await fetch(DUCKDUCKGO_API_URL, {
      method: 'POST',
      headers: DUCKDUCKGO_HEADERS,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!chatResponse.ok) {
      throw new Error(`HTTP error! Status: ${chatResponse.status}`);
    }

    const chatText = await chatResponse.text();
    const messageMatches = chatText.match(/data: \{"message":"(.*?)"/g);
    const combinedMessage = messageMatches
      ? messageMatches.map(match => JSON.parse(match.substring(6)).message).join('')
      : '';

    res.status(200).json({
      userData: result,
      roasting: combinedMessage
    });
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.' });
  }
};

const fetch = require('node-fetch');

// API key ChatGPT langsung di dalam kode
const OPENAI_API_KEY = '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'; // API key ChatGPT Anda

// URL API ChatGPT
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'; // URL endpoint ChatGPT

module.exports = async (req, res) => {
  // Menambahkan header CORS ke dalam respons
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Mengatasi preflight request (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Mengambil nilai parameter username dari permintaan
    const username = req.query.username || 'instagram'; // Gantilah 'instagram' dengan username default jika perlu

    // URL API dengan parameter username
    const apiUrl = `https://gramsnap.com/api/ig/userInfoByUsername/${username}`;

    // Mengambil data dari API eksternal
    const response = await fetch(apiUrl);
    if (!response.ok) {
      // Jika response tidak berhasil, lempar error
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Mengubah response ke JSON
    const data = await response.json();

    // Memproses data JSON untuk mendapatkan bagian yang diperlukan
    const user = data.result.user;
    const result = {
      nama_lengkap: user.full_name || "Nama belum diisi", // Menyediakan nilai default jika full_name tidak ada
      akun_privat: user.is_private
        ? `Akun atas ${username} ini di private`
        : `Akun atas ${username} ini publik`, // Menyediakan nilai deskriptif berdasarkan is_private
      bio: user.bio || "Tidak ada bio", // Menyediakan nilai default jika bio tidak ada
      jumlah_pengikut: user.follower_count || 0, // Menyediakan nilai default jika follower_count tidak ada
      jumlah_diikuti: user.following_count || 0, // Menyediakan nilai default jika following_count tidak ada
      jumlah_media: user.media_count || 0 // Menyediakan nilai default jika media_count tidak ada
    };

    // Membuat prompt untuk API ChatGPT
    const prompt = `Berikan roasting singkat dengan kejam, menyindir, serta menyakitkan dalam bahasa gaul untuk profile github berikut: ${username}. Berikut detailnya: ${JSON.stringify(result)}`;

    // Menggunakan fetch untuk memanggil API ChatGPT
    const generateContentResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Gantilah dengan model yang sesuai jika diperlukan
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 150, // Sesuaikan dengan kebutuhan
        temperature: 0.7 // Sesuaikan dengan kebutuhan
      }),
    });

    if (!generateContentResponse.ok) {
      throw new Error(`HTTP error! Status: ${generateContentResponse.status}`);
    }

    const chatGPTData = await generateContentResponse.json();
    const chatGPTResponse = chatGPTData.choices[0].message.content.trim();

    // Mengirimkan respon dalam format JSON
    res.status(200).json({
      userData: result,
      roasting: chatGPTResponse
    });
  } catch (error) {
    // Menangani error jika terjadi
    console.error('Terjadi kesalahan:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.' });
  }
};

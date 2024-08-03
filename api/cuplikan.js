const fetch = require('node-fetch');

// API key Gemini langsung di dalam kode
const GEMINI_API_KEY = 'AIzaSyBigwlLUknqGBns_ciJuYjwnKlGGCdWNkY'; // API key Gemini Anda

// URL API Gemini
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`; // URL endpoint Gemini

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

    // Membuat prompt untuk API Gemini
    const prompt = `Berikan roasting singkat dengan kejam, menyindir, serta menyakitkan dalam bahasa gaul untuk profile github berikut: ${username}. Berikut detailnya: "${JSON.stringify(result)}"`;

    // Menggunakan fetch untuk memanggil API Gemini
    const generateContentResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      }),
    });

    if (!generateContentResponse.ok) {
      throw new Error(`HTTP error! Status: ${generateContentResponse.status}`);
    }

    const geminiData = await generateContentResponse.json();
    const geminiResponse = geminiData.contents[0].parts[0].text.trim();

    // Mengirimkan respon dalam format JSON
    res.status(200).json({
      userData: result,
      roasting: geminiResponse
    });
  } catch (error) {
    // Menangani error jika terjadi
    console.error('Terjadi kesalahan:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.' });
  }
};

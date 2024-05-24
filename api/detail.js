const https = require('https');
const { JSDOM } = require('jsdom');

module.exports = (req, res) => {
    const fullLink = 'https://bolasiar.cc' + req.query.fullLink; // Mengambil fullLink dari query parameter dan menambahkan 'https://bolasiar.cc' di depannya

    // Lakukan permintaan HTTP untuk mendapatkan halaman HTML
    https.get(fullLink, (response) => {
        let html = '';

        // Kumpulkan data HTML ketika ada
        response.on('data', (chunk) => {
            html += chunk;
        });

        // Setelah semua data diterima
        response.on('end', () => {
            // Lakukan pemrosesan HTML untuk mendapatkan atribut src dari elemen iframe
            const iframeSrc = extractIframeSrc(html);

            // Kirim atribut src iframe yang lengkap sebagai respons
            res.status(200).json({ iframeSrc: iframeSrc });
        });
    }).on('error', (error) => {
        // Tangani kesalahan jika permintaan gagal
        res.status(500).json({ error: 'Error fetching data', details: error.message });
    });
};

// Fungsi untuk mengekstrak atribut src dari elemen iframe dalam HTML
function extractIframeSrc(html) {
    // Lakukan pemrosesan HTML untuk menemukan elemen iframe dengan kelas 'player-holder'
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const iframeElement = document.querySelector('.player-container #pembed iframe.player-holder');
    
    // Ambil atribut src dari elemen iframe jika ditemukan
    if (iframeElement) {
        return iframeElement.getAttribute('src');
    } else {
        return 'Iframe src not found';
    }
}

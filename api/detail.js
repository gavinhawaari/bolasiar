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
            const dom = new JSDOM(html);
            const document = dom.window.document;

            // Temukan elemen iframe dan ambil atribut src-nya
            const iframeElement = document.querySelector('iframe');
            const iframeSrc = iframeElement ? iframeElement.getAttribute('src') : null;

            if (iframeSrc) {
                res.status(200).json({ iframeSrc: iframeSrc });
            } else {
                res.status(404).json({ error: 'Iframe tidak ditemukan' });
            }
        });
    }).on('error', (error) => {
        // Tangani kesalahan jika permintaan gagal
        res.status(500).json({ error: 'Error fetching data', details: error.message });
    });
};

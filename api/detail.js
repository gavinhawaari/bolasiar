const https = require('https');
const { JSDOM } = require('jsdom');

module.exports = (req, res) => {
    const matchId = req.query.id; // Mendapatkan nilai "id" dari parameter query string

    // Buat URL untuk permintaan HTTPS dengan ID pertandingan
    const url = `https://bolasiar.cc/live/${matchId}`;

    https.get(url, (response) => {
        let html = '';

        response.on('data', (chunk) => {
            html += chunk;
        });

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
    }).on('error', (err) => {
        res.status(500).json({ error: 'Error fetching data', details: err.message });
    });
};

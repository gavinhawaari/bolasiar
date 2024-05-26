const https = require('https');
const { JSDOM } = require('jsdom');
const targetUrl = require('./targeturl');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const id = req.query.id || req.query; // Mengambil nilai parameter id dari permintaan

    if (!id) {
        res.status(400).json({ error: 'Parameter id tidak ditemukan' });
        return;
    }

    https.get(targetUrl + id, (response) => {
        let html = '';

        response.on('data', (chunk) => {
            html += chunk;
        });

        response.on('end', () => {
            const dom = new JSDOM(html);
            const document = dom.window.document;

            const iframe = document.querySelector('iframe');

            if (iframe) {
                const src = iframe.getAttribute('src');

                if (src) {
                    res.status(200).json({ url: src });
                } else {
                    res.status(500).json({ error: 'Tidak dapat menemukan src dalam iframe' });
                }
            } else {
                res.status(500).json({ error: 'Tidak dapat menemukan iframe dalam dokumen' });
            }
        });
    }).on('error', (error) => {
        res.status(500).json({ error: error.message });
    });
};

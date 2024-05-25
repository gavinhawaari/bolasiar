const https = require('https');
const { JSDOM } = require('jsdom');

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const id = req.query.id; // Mengambil nilai parameter id dari permintaan

    https.get('https://bolasiar.cc/' + id, (response) => {
        let html = '';

        response.on('data', (chunk) => {
            html += chunk;
        });

        response.on('end', () => {
            const dom = new JSDOM(html);
            const document = dom.window.document;

            // Mendapatkan elemen iframe pertama dari dokumen
            const iframe = document.querySelector('iframe');

            if (iframe) {
                // Mendapatkan nilai src dari iframe
                const src = iframe.getAttribute('src');

                if (src) {
                    // Mengirimkan URL yang telah dibentuk kembali ke klien dalam format JSON
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

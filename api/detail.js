const https = require('https');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const targetUrl = require('./targeturl');

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

    // Mengambil nilai parameter slugs dari permintaan
    const slugs = req.query.slugs || '';

    // Memeriksa apakah parameter slugs telah diberikan
    if (!slugs) {
        res.status(400).json({ error: 'Parameter slug movies tidak ditemukan' });
        return;
    }

    let url = `https://www.njav.com/id/${slugs}`;

    https.get(url, (response) => {
        let data = '';

        // Mengumpulkan data yang diterima
        response.on('data', (chunk) => {
            data += chunk;
        });

        // Proses data setelah selesai diterima
        response.on('end', () => {
            const dom = new JSDOM(data);
            const document = dom.window.document;

            // Mengambil data simpinis
            const simpinisElement = document.querySelector('div.description p');
            const alurcerita = simpinisElement ? simpinisElement.textContent.trim() : 'N/A';

            // Mengambil semua data detail movie
            const detailMovieElements = document.querySelectorAll('div[class="detail-item"] span.genre a');

            let aktorList = [];

            detailMovieElements.forEach(element => {
                const href = element.getAttribute('href');

                if (href.includes('actor/')) {
                    const text = element.textContent.trim();
                    aktorList.push({ name: text, url: href });
                }
            });

            // Mengambil URL dari elemen div[id="player"]
            const iframeElement = document.querySelector('div[id="player"]');
            const player = iframeElement ? `https://www.njav.com/vv/nsfs-107?poster=${iframeElement.getAttribute('data-poster')}` : 'N/A';

            // Mengambil Poster
            const posterElement = document.querySelector('div[id="player"]');
            const poster = posterElement ? posterElement.getAttribute('data-poster') : 'N/A';

            // Mengambil title
            const titleElement = document.querySelector('h1');
            const title = titleElement ? titleElement.textContent.trim() : 'N/A';

            // Membuat objek detail movie
            const detailMovieObject = {
                title,
                poster,
                alurcerita,
                aktor: aktorList,
                player
            };

            res.status(200).json(detailMovieObject);
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};

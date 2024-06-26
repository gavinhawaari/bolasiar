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
    const slug = req.query.slug || '';

    // Memeriksa apakah parameter slugs telah diberikan
    if (!slug) {
        res.status(400).json({ error: 'Parameter slug detail tidak ditemukan' });
        return;
    }

    let url = `${targetUrl}id/${slug}`;

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

            // genre 

            let genreList = [];

            detailMovieElements.forEach(element => {
                const href = element.getAttribute('href');

                if (href.includes('genre/')) {
                    const text = element.textContent.trim();
                    genreList.push({ name: text, url: href });
                }
            });

            // tags

            let tagsList = [];

            detailMovieElements.forEach(element => {
                const href = element.getAttribute('href');

                if (href.includes('tags/')) {
                    const text = element.textContent.trim();
                    tagsList.push({ name: text, url: href });
                }
            });

            // Mengambil Poster
            const posteroneElement = document.querySelector('div[id="player"]');
            const posterone = posteroneElement ? posteroneElement.getAttribute('data-poster') : 'N/A';

            // Hilangkan bagian 'https://static.vip/resize/' dan '/thumb_h.webp'
            const idPly = posterone.replace('https://static.javcdn.vip/resize/', '').replace('/thumb_h.webp', '');

            // Mengambil URL dari elemen div[id="player"]
            const iframeElement = document.querySelector('div[id="player"]');
            const player = iframeElement ? `https://www.njav.com/vv/${idPly}?poster=${iframeElement.getAttribute('data-poster')}` : 'N/A';

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
                genre: genreList,
                tags: tagsList,
                player
            };

            res.status(200).json(detailMovieObject);
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};

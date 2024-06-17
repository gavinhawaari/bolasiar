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

    const urls = 'https://www.njav.com/id/';
    
    https.get(urls, (response) => {
        let data = '';

        // Mengumpulkan data yang diterima
        response.on('data', (chunk) => {
            data += chunk;
        });

        // Proses data setelah selesai diterima
        response.on('end', () => {
            const dom = new JSDOM(data);
            const document = dom.window.document;

            const articles = document.querySelectorAll('div[class="col-6 col-sm-4 col-lg-3"]');
            let results = [];
            const totalArticles = articles.length;
            const rekomendasiCount = 4;
            const updateCount = 8;

            articles.forEach((article, index) => {
                let category;
                if (index >= totalArticles - rekomendasiCount) {
                    category = 'rekomendasi';
                } else if (index < 8) {
                    category = 'rilisan baru';
                } else if (index >= 8 && index < 8 + updateCount) {
                    category = 'update';
                } else {
                    category = 'hanya untukmu';
                }

                const poster = article.querySelector('img') ? article.querySelector('img').getAttribute('data-src') : 'N/A';
                const title = article.querySelector('div.detail a') ? article.querySelector('div.detail a').textContent.trim() : 'N/A';
                const slug = article.querySelector('div.detail a') ? article.querySelector('div.detail a').getAttribute('href') : 'N/A';

                results.push({
                    category,
                    poster,
                    title,
                    slug    
                });
            });

            res.status(200).json(results);
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};

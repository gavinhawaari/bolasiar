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

    const urls = 'https://www.njav.com/';


    const pages = req.query.pages !== undefined ? req.query.pages : 1;
    
    let url = `${urls}id/new-release/`;
    if (pages !== 1) {
        url += `?page=${pages}`;
    }

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

            const articles = document.querySelectorAll('div[class="col-6 col-sm-4 col-lg-3"]');
            let results = [];

            articles.forEach(article => {
                const poster = article.querySelector('img') ? article.querySelector('img').getAttribute('data-src') : 'N/A';
                const title = article.querySelector('div.detail a') ? article.querySelector('div.detail a').textContent.trim() : 'N/A';
                const slug = article.querySelector('div.detail a') ? article.querySelector('div.detail a').getAttribute('href') : 'N/A';
                

                
                results.push({
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

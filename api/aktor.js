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

    const page = req.query.page !== undefined ? req.query.page : 1;
    
    let url = `${targetUrl}id/actor/`;
    
    if (page !== 1) {
        url += `?page=${page}`;
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

            const articles = document.querySelectorAll('div[class="col-6 col-md-4 col-lg-3 bl-item"]');
            let results = [];

            articles.forEach(article => {
                const thumbnail = article.querySelector('img') ? article.querySelector('img').getAttribute('src') : 'N/A';
                const name = article.querySelector('a') ? article.querySelector('a').textContent.trim() : 'N/A';
                const slug = article.querySelector('a') ? article.querySelector('a').getAttribute('href') : 'N/A';
                

                
                results.push({
                    poster,
                    name,
                    slug    
                });
            });

            res.status(200).json(results);
        });

    }).on('error', (err) => {
        res.status(500).json({ error: err.message });
    });
};

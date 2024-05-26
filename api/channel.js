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

    // URL halaman target
    const url = 'https://bolasiar.cc/live/deportivo-maldonado-vs-centro-atletico-fenix-bigmatch-x4ZJL4H';

    https.get(url, (response) => {
        let data = '';

        // Menerima data dari stream
        response.on('data', (chunk) => {
            data += chunk;
        });

        // Setelah data diterima sepenuhnya
        response.on('end', () => {
            // Mem-parse HTML menggunakan JSDOM
            const dom = new JSDOM(data);
            const document = dom.window.document;

            // Mengambil nilai dari elemen dengan class "mirroroption"
            const options = document.querySelectorAll('option.mirroroption');
            let servers = [];
            options.forEach((option, index) => {
                servers.push({
                    [`server${index + 1}`]: option.value
                });
            });

            // Mengkonversi nilai menjadi format JSON
            const jsonData = JSON.stringify(servers, null, 2);

            // Menampilkan data JSON di response
            res.setHeader('Content-Type', 'application/json');
            res.status(200).end(jsonData);
        });
    }).on('error', (e) => {
        console.error('Error:', e);
        res.status(500).end('Gagal mengambil data.');
    });
};

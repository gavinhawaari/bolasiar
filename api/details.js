const https = require('https');
const { JSDOM } = require('jsdom');
const targetUrl = require('./targeturl'); // Pastikan targetUrl diekspor dengan benar

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const id = req.query.id; // Pastikan id diambil dari parameter query
    
    if (!id) {
        res.status(400).json({ error: 'Parameter id tidak ditemukan' });
        return;
    }
    
    https.get(`${targetUrl}${id}`, (response) => {
        let data = '';

        // Menerima data dari stream
        response.on('data', (chunk) => {
            data += chunk;
        });

        // Setelah data diterima sepenuhnya
        response.on('end', () => {
            try {
                // Mem-parse HTML menggunakan JSDOM
                const dom = new JSDOM(data);
                const document = dom.window.document;

                // Mengambil nilai dari elemen dengan class "mirroroption"
                const options = document.querySelectorAll('option.mirroroption');
                let servers = [];
                
                options.forEach((option, index) => {
                    // Mendekode nilai option menggunakan base64
                    const decodedValue = Buffer.from(option.value, 'base64').toString('utf-8');
                    
                    // Mengambil nilai dari atribut src dalam elemen iframe
                    const iframeMatch = decodedValue.match(/src="([^"]+)"/);
                    if (iframeMatch) {
                        const iframeSrc = iframeMatch[1];

                        // Mendekode nilai src dalam URL https://bolasiar.htmlplayer.xyz/?type=HLS&src=
                        const urlMatch = iframeSrc.match(/src=([^&]+)/);
                        if (urlMatch) {
                            const encodedSrc = urlMatch[1];
                            const decodedSrc = Buffer.from(encodedSrc, 'base64').toString('utf-8');
                            
                            // Menambahkan server ke array
                            servers.push({
                                [`server${index + 1}`]: decodedSrc
                            });
                        }
                    }
                });

                // Mengkonversi nilai menjadi format JSON
                const jsonData = JSON.stringify(servers, null, 2);

                // Menampilkan data JSON di response
                res.setHeader('Content-Type', 'application/json');
                res.status(200).end(jsonData);
            } catch (error) {
                console.error('Parsing error:', error);
                res.status(500).json({ error: 'Gagal mem-parse data HTML.' });
            }
        });
    }).on('error', (e) => {
        console.error('Error:', e);
        res.status(500).json({ error: 'Gagal mengambil data.' });
    });
};

const https = require('https');
const { JSDOM } = require('jsdom');

module.exports = (req, res) => {
    const baseUrl = 'https://cors.livestreamapi.xyz/https://apk150.pro/streamdata/';
    const urlSuffix = '.json'; // Format akhiran URL JSON

    https.get('https://bolasiar.cc', (response) => {
        let html = '';

        // Kumpulkan data HTML
        response.on('data', (chunk) => {
            html += chunk;
        });

        // Setelah semua data diterima
        response.on('end', () => {
            const dom = new JSDOM(html);
            const document = dom.window.document;
            const matches = document.querySelectorAll('.listDec.zhibo.content .today.myList a');

            const matchData = [];

            matches.forEach(match => {
                const fullLink = match.href;
                const linkParts = fullLink.split('-');
                const matchID = linkParts[linkParts.length - 1]; // Mengambil bagian terakhir dari URL setelah tanda '-'

                const homeTeamImg = match.querySelector('.home_team img').getAttribute('data-src');
                const homeTeamName = match.querySelector('.home_team p').textContent.trim();
                const awayTeamImg = match.querySelector('.visit_team img').getAttribute('data-src');
                const awayTeamName = match.querySelector('.visit_team p').textContent.trim();

                let dateElement = match.closest('.today.myList').querySelector('.date-p');
                let date;
                if (dateElement) {
                    date = dateElement.textContent.trim();
                } else {
                    dateElement = match.closest('.today.myList').querySelector('.todayTitle');
                    date = dateElement ? dateElement.textContent.trim() : 'Tanggal tidak ditemukan';
                }

                const leagueElement = match.querySelector('.type p:nth-child(2)');
                const league = leagueElement ? leagueElement.textContent.trim() : 'Kompetisi tidak ditemukan';

                const timeElement = match.querySelector('.type p:nth-child(3)');
                const time = timeElement ? timeElement.textContent.trim() : 'Jam tidak ditemukan';

                // Membuat URL lengkap dengan ID pertandingan dan format JSON
                const fullUrl = `${baseUrl}${matchID}${urlSuffix}`;

                // Menentukan apakah href tidak mengandung javascript:void(0);, jika ya, maka ganti dengan fullUrl
                const hrefValue = fullLink !== 'javascript:void(0);' ? `detail.html?id=${matchID}` : fullLink;

                matchData.push({
                    date: date,
                    time: time,
                    league: league,
                    fullUrl: fullUrl,
                    homeTeam: {
                        img: homeTeamImg,
                        name: homeTeamName
                    },
                    awayTeam: {
                        img: awayTeamImg,
                        name: awayTeamName
                    },
                    hrefValue: hrefValue
                });
            });

            res.status(200).json(matchData);
        });
    }).on('error', (err) => {
        res.status(500).json({ error: 'Error fetching data', details: err.message });
    });
};

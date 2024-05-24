const https = require('https');
const { JSDOM } = require('jsdom');

https.get('https://bolasiar.cc', (res) => {
    let html = '';

    // Kumpulkan data HTML
    res.on('data', (chunk) => {
        html += chunk;
    });

    // Setelah semua data diterima
    res.on('end', () => {
        const dom = new JSDOM(html);
        const document = dom.window.document;
        const matches = document.querySelectorAll('.listDec.zhibo.content .today.myList a');

        const matchData = [];

        matches.forEach(match => {
            const linkParts = match.href.split('-');
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

            // Membuat URL lengkap dengan ID pertandingan
            const fullUrl = match.href;

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
                }
            });
        });

        console.log(JSON.stringify(matchData, null, 2));
    });
}).on('error', (err) => {
    console.error('Error fetching data:', err);
});

const fs = require('fs');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const url = 'https://bolasiar.cc';  // Ganti dengan URL yang sesuai

fetch(url)
    .then(response => response.text())
    .then(html => {
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const matches = doc.querySelectorAll('.listDec.zhibo.content .today.myList a');
        const jsonData = [];

        matches.forEach(match => {
            const link = match.href;
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

            // Mengambil kompetisi liga
            const leagueElement = match.querySelector('.type p:nth-child(2)');
            const league = leagueElement ? leagueElement.textContent.trim() : 'Kompetisi tidak ditemukan';

            // Mengambil jam pertandingan
            const timeElement = match.querySelector('.type p:nth-child(3)');
            const time = timeElement ? timeElement.textContent.trim() : 'Jam tidak ditemukan';

            jsonData.push({
                date: date,
                time: time,
                league: league,
                homeTeam: {
                    name: homeTeamName,
                    img: homeTeamImg
                },
                awayTeam: {
                    name: awayTeamName,
                    img: awayTeamImg
                },
                link: link
            });
        });

        fs.writeFile('matches.json', JSON.stringify(jsonData, null, 2), err => {
            if (err) {
                console.error('Error writing JSON file:', err);
            } else {
                console.log('JSON file has been saved.');
            }
        });
    })
    .catch(err => console.error('Error fetching data:', err));

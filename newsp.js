const fetch = require('node-fetch');
const timeago = require('timeago.js');
const cors = require('cors');
const express = require('express');

const app = express();
app.use(cors());

// Register Indonesian locale for timeago
timeago.register('id', (number, index, total_sec) => [
    ['baru saja', 'sebentar'],
    ['%s detik yang lalu', 'dalam %s detik'],
    ['1 menit yang lalu', 'dalam 1 menit'],
    ['%s menit yang lalu', 'dalam %s menit'],
    ['1 jam yang lalu', 'dalam 1 jam'],
    ['%s jam yang lalu', 'dalam %s jam'],
    ['1 hari yang lalu', 'dalam 1 hari'],
    ['%s hari yang lalu', 'dalam %s hari'],
    ['1 minggu yang lalu', 'dalam 1 minggu'],
    ['%s minggu yang lalu', 'dalam %s minggu'],
    ['1 bulan yang lalu', 'dalam 1 bulan'],
    ['%s bulan yang lalu', 'dalam %s bulan'],
    ['1 tahun yang lalu', 'dalam 1 tahun'],
    ['%s tahun yang lalu', 'dalam %s tahun']
][index]);

app.get('/news', async (req, res) => {
    const url = 'https://www.fotmob.com/api/tlnews?id=47&type=league&language=id&startIndex=1';

    try {
        const response = await fetch(url);
        const data = await response.json();

        const formattedNews = data.data.map(item => {
            const timeAgo = timeago.format(new Date(item.gmtTime), 'id');
            return {
                title: item.title,
                lead: item.lead,
                imageUrl: item.imageUrl,
                pageUrl: `https://www.fotmob.com/${item.page.url}`,
                timeAgo: timeAgo
            };
        });

        res.json(formattedNews);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Error fetching news' });
    }
});

module.exports = app;

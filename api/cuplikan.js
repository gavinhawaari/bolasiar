const https = require('https');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

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

    // Mengambil parameter query 'username'
    const username = req.query.username;

    if (!username) {
        res.status(400).json({ error: 'Username query parameter is required' });
        return;
    }

    const url = `https://www.picuki.com/profile/${username}`;

    // Ambil data HTML dari URL
    https.get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            try {
                // Proses data HTML menggunakan jsdom
                const dom = new JSDOM(data);
                const document = dom.window.document;
                const listMap = {};

                // Mengambil elemen private profile
                const privateProfile = document.querySelector('div.private-profile-top');

                if (privateProfile !== null) {
                    listMap['profile-status'] = 'Profile is private.';
                } else {
                    // Mengambil elemen profile name
                    const profileNameTop = document.querySelector('h1.profile-name-top');
                    const profileNameBottom = document.querySelector('h2.profile-name-bottom');

                    if (profileNameTop !== null) {
                        listMap['profile-name-top'] = profileNameTop.textContent;
                    }

                    if (profileNameBottom !== null) {
                        listMap['profile-name-bottom'] = profileNameBottom.textContent;
                    } else {
                        listMap['profile-name-bottom'] = 'Nama belum diisi';
                    }

                    // Mengambil elemen total posts
                    const totalPosts = document.querySelector('span.total_posts');
                    if (totalPosts !== null) {
                        const totalPostsText = totalPosts.textContent;
                        listMap['total_posts'] = totalPostsText === '0' ? '0 Posts' : `${totalPostsText} Posts`;
                    }

                    // Mengambil elemen followers
                    const followers = document.querySelector('span.followed_by');
                    if (followers !== null) {
                        const followersText = followers.textContent;
                        listMap['followers'] = followersText === '0' ? '0 Followers' : `${followersText} Followers`;
                    }

                    // Mengambil elemen following
                    const following = document.querySelector('span.follows');
                    if (following !== null) {
                        const followingText = following.textContent;
                        listMap['following'] = followingText === '0' ? '0 Following' : `${followingText} Following`;
                    }

                    // Mengambil elemen profile description
                    const profileDescription = document.querySelector('div.profile-description');
                    if (profileDescription !== null) {
                        const profileDescriptionText = profileDescription.textContent.trim();
                        listMap['profile-description'] = profileDescriptionText === '' ? 'Belum menambahkan bio' : profileDescriptionText;
                    } else {
                        listMap['profile-description'] = 'Belum menambahkan bio';
                    }
                }

                res.status(200).json(listMap);
            } catch (error) {
                res.status(500).json({ error: 'Error processing data' });
            }
        });
    }).on('error', (err) => {
        res.status(500).json({ error: 'Error fetching data' });
    });
};

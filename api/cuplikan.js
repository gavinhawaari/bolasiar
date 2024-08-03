const https = require('https');
const { JSDOM } = require('jsdom');

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

    // Mengambil username dari query parameter
    const username = req.query.username;
    if (!username) {
        res.status(400).json({ error: 'Username query parameter is required' });
        return;
    }

    
    const url = `https://www.picuki.com/profile/${username}`;

    try {
        const profileData = await fetchProfileData(url);
        const results = [profileData]; // Membungkus hasil dalam array

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching profile data', details: error.message });
    }
};

function fetchProfileData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';

            // Mengumpulkan data yang diterima
            response.on('data', (chunk) => {
                data += chunk;
            });

            // Setelah seluruh data diterima
            response.on('end', () => {
                try {
                    const dom = new JSDOM(data);
                    const document = dom.window.document;

                    const listMap = {};

                    // Mengambil elemen private profile
                    const privateProfile = document.querySelector('div.private-profile-top');

                    if (privateProfile) {
                        // Jika profil bersifat pribadi, jangan tampilkan data
                        listMap["profile-status"] = "Profile is private.";
                    } else {
                        // Mengambil elemen profile name
                        const profileNameTop = document.querySelector('h1.profile-name-top');
                        const profileNameBottom = document.querySelector('h2.profile-name-bottom');

                        listMap["profile-name-top"] = profileNameTop ? profileNameTop.textContent.trim() : "Nama belum diisi";
                        listMap["profile-name-bottom"] = profileNameBottom ? profileNameBottom.textContent.trim() : "Nama belum diisi";

                        // Mengambil elemen total posts
                        const totalPosts = document.querySelector('span.total_posts');
                        listMap["total_posts"] = totalPosts ? (totalPosts.textContent.trim() === "0" ? "0 Posts" : `${totalPosts.textContent.trim()} Posts`) : "0 Posts";

                        // Mengambil elemen followers
                        const followers = document.querySelector('span.followed_by');
                        listMap["followers"] = followers ? (followers.textContent.trim() === "0" ? "0 Followers" : `${followers.textContent.trim()} Followers`) : "0 Followers";

                        // Mengambil elemen following
                        const following = document.querySelector('span.follows');
                        listMap["following"] = following ? (following.textContent.trim() === "0" ? "0 Following" : `${following.textContent.trim()} Following`) : "0 Following";

                        // Mengambil elemen profile description
                        const profileDescription = document.querySelector('div.profile-description');
                        listMap["profile-description"] = profileDescription ? profileDescription.textContent.trim() || "Belum menambahkan bio" : "Belum menambahkan bio";
                    }

                    resolve(listMap);
                } catch (error) {
                    reject(new Error('Error parsing HTML: ' + error.message));
                }
            });
        }).on('error', (error) => {
            reject(new Error('Error fetching profile data: ' + error.message));
        });
    });
}

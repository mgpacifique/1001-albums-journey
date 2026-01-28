const https = require('https');

const url = 'https://1001albumsgenerator.com/api/v1/albums/stats';

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.albums && json.albums.length > 0) {
                console.log("First album keys:", Object.keys(json.albums[0]));
                console.log("First album sample:", json.albums[0]);
            } else {
                console.log("No albums found in response.");
            }
        } catch (e) {
            console.error("Parse error", e);
        }
    });
}).on('error', (e) => {
    console.error("Req error", e);
});

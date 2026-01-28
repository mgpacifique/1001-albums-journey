import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env.local');

// Simple .env parser
const env = {};
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    lines.forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) env[key.trim()] = val.trim();
    });
}

const api_key = env.VITE_LASTFM_API_KEY;

console.log(`Checking API Key: ${api_key ? 'Found' : 'Missing'}`);
if (api_key) {
    console.log(`Key length: ${api_key.length}`);
    console.log(`Key start: ${api_key.substring(0, 4)}...`);
}

async function test() {
    if (!api_key) {
        console.error("No API Key found.");
        return;
    }

    const artist = "Michael Jackson";
    const album = "Thriller";

    const url = new URL('https://ws.audioscrobbler.com/2.0/');
    url.searchParams.append('method', 'artist.getTopAlbums');
    url.searchParams.append('artist', artist);
    url.searchParams.append('album', album);
    url.searchParams.append('api_key', api_key);
    url.searchParams.append('format', 'json');
    url.searchParams.append('autocorrect', '1');

    console.log(`\nTesting URL: ${url.toString()}`);

    try {
        const response = await fetch(url.toString());
        console.log(`Status: ${response.status} ${response.statusText}`);

        const text = await response.text();
        console.log("Response Body Preview:", text.substring(0, 200));

        if (!response.ok) {
            console.error("Request Failed.");
        } else {
            console.log("Request Successful!");
        }

    } catch (e) {
        console.error("Fetch error:", e);
    }
}

test();

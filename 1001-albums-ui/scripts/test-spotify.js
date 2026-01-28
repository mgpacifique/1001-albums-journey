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

const client_id = env.SPOTIFY_CLIENT_ID;
const client_secret = env.SPOTIFY_CLIENT_SECRET;

console.log(`Checking credentials... ID: ${client_id ? 'Found' : 'Missing'}, Secret: ${client_secret ? 'Found' : 'Missing'}`);

if (!client_id || !client_secret) {
    console.error("Missing credentials in .env.local");
    process.exit(1);
}

async function test() {
    try {
        console.log("Fetching Token...");
        const authOptions = {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        };

        const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
        if (!response.ok) {
            throw new Error(`Status: ${response.status} ${await response.text()}`);
        }
        const data = await response.json();
        console.log("Success! Access Token received.");
        console.log("Token starts with:", data.access_token.substring(0, 10) + "...");
    } catch (e) {
        console.error("Error:", e);
    }
}

test();

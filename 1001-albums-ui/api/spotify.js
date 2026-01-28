export default async function handler(request, response) {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        return response.status(500).json({ error: 'Missing Spotify credentials' });
    }

    try {
        const authOptions = {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        };

        const spotifyResponse = await fetch('https://accounts.spotify.com/api/token', authOptions);

        if (!spotifyResponse.ok) {
            const errorData = await spotifyResponse.text();
            throw new Error(`Spotify API error: ${spotifyResponse.status} ${errorData}`);
        }

        const data = await spotifyResponse.json();

        response.status(200).json(data);
    } catch (error) {
        console.error('Error fetching Spotify token:', error);
        response.status(500).json({ error: 'Failed to fetch token' });
    }
}

/**
 * Supported Music Platforms
 */
export const PLATFORMS = {
    SPOTIFY: 'spotify',
    APPLE: 'apple',
    YOUTUBE_MUSIC: 'ytmusic',
    YOUTUBE: 'youtube',
    DEEZER: 'deezer',
    QOBUZ: 'qobuz'
};

/**
 * Supported Streaming Modes
 */
export const MODES = {
    WEB: 'web',
    APP: 'app'
};

/**
 * Generates a streaming link based on platform, mode, and album info.
 * 
 * @param {Object} album - The album object (must contain name, artist).
 * @param {string} platform - One of PLATFORMS values.
 * @param {string} mode - One of MODES values.
 * @returns {string} The generated URL or URI.
 */
export const getStreamingLink = (album, platform, mode = MODES.WEB) => {
    if (!album || !album.name) return '#';

    const query = encodeURIComponent(`${album.name} ${album.artist}`);

    // Spotify
    if (platform === PLATFORMS.SPOTIFY) {
        if (mode === MODES.APP) {
            // Use URI scheme for desktop app
            return album.spotifyId
                ? `spotify:album:${album.spotifyId}`
                : `spotify:search:${query}`;
        }
        // Web Player
        return album.spotifyId
            ? `https://open.spotify.com/album/${album.spotifyId}`
            : `https://open.spotify.com/search/${query}`;
    }

    // Apple Music
    if (platform === PLATFORMS.APPLE) {
        // Apple Music on Windows/Web usually relies on https links. 
        // "music://" exists but often requires iTunes. 
        // We will default to HTTPS for consistency unless specifically handled.
        const baseUrl = 'https://music.apple.com/us';
        return album.appleMusicId
            ? `${baseUrl}/album/${album.appleMusicId}`
            : `${baseUrl}/search?term=${query}`;
    }

    // YouTube Music
    if (platform === PLATFORMS.YOUTUBE_MUSIC) {
        return `https://music.youtube.com/search?q=${query}`;
    }

    // YouTube (Main)
    if (platform === PLATFORMS.YOUTUBE) {
        return `https://www.youtube.com/results?search_query=${query}`;
    }

    // Deezer
    if (platform === PLATFORMS.DEEZER) {
        if (mode === MODES.APP) {
            // Deezer desktop app ID scheme
            // callback usually starts with deezer://
            return `deezer://www.deezer.com/search/${query}`;
        }
        return `https://www.deezer.com/search/${query}`;
    }

    // Qobuz
    if (platform === PLATFORMS.QOBUZ) {
        // Qobuz search
        return `https://www.qobuz.com/us-en/search?q=${query}`;
    }

    // Default fallback
    return `https://open.spotify.com/search/${query}`;
};

/**
 * Returns the display name and icon capability for a platform
 */
export const getPlatformConfig = (platform) => {
    switch (platform) {
        case PLATFORMS.SPOTIFY: return { label: 'Spotify', color: '#1DB954' };
        case PLATFORMS.APPLE: return { label: 'Apple Music', color: '#FA243C' };
        case PLATFORMS.YOUTUBE_MUSIC: return { label: 'YouTube Music', color: '#FF0000' };
        case PLATFORMS.YOUTUBE: return { label: 'YouTube', color: '#FF0000' };
        case PLATFORMS.DEEZER: return { label: 'Deezer', color: '#A238FF' };
        case PLATFORMS.QOBUZ: return { label: 'Qobuz', color: '#000000' };
        default: return { label: 'Music', color: '#666' };
    }
};

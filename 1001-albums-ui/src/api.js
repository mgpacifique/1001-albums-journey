const BASE_URL = 'https://1001albumsgenerator.com/api/v1';

export async function getProject(projectId) {
  try {
    const response = await fetch(`${BASE_URL}/projects/${projectId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
}

export async function getWikiSummary(wikiUrl) {
  if (!wikiUrl) return null;

  try {
    // Extract title from URL (e.g. https://en.wikipedia.org/wiki/Thriller_(Michael_Jackson_album))
    const title = wikiUrl.split('/wiki/')[1];
    if (!title) return null;

    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
    const response = await fetch(apiUrl);

    if (response.ok) {
      const data = await response.json();
      return data.extract;
    }
    return null;
  } catch (error) {
    console.warn("Failed to fetch wiki summary", error);
    return null;
  }
  return null;
}


// Cache for all album stats to avoid re-fetching
let cachedStats = null;

async function ensureAlbumStats() {
  if (cachedStats) return cachedStats;
  try {
    const response = await fetch(`${BASE_URL}/albums/stats`);
    if (response.ok) {
      cachedStats = await response.json();
      return cachedStats;
    }
  } catch (error) {
    console.warn("Failed to ensure album stats", error);
  }
  return null;
}

export async function getAlbumStats(albumName) {
  if (!albumName) return null;

  try {
    const stats = await ensureAlbumStats();

    if (stats && stats.albums) {
      // Find album by name (case-insensitive)
      const found = stats.albums.find(a =>
        a.name.toLowerCase() === albumName.toLowerCase()
      );
      return found || null;
    }
    return null;
  } catch (error) {
    console.warn("Failed to fetch album stats", error);
    return null;
  }
}


// Last.fm API Integration

const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/'; // HTTPS

export async function getSimilarAlbums(albumName, artistName) {
  if (!artistName || !LASTFM_API_KEY) {
    console.warn("Missing params for Last.fm");
    return null;
  }

  try {
    // Determine the 'Spoiler List' (all albums in the challenge)
    const stats = await ensureAlbumStats();
    const allAlbums = stats?.albums || [];

    // Helper to check if an album is in the challenge
    const normalize = (str) => {
      if (!str) return '';
      return str.toLowerCase()
        .replace(/\([^)]*(remaster|deluxe|edition|expanded|anniversary)[^)]*\)/gi, '') // Remove (Remastered...) content
        .replace(/\b(remaster(ed)?|deluxe|edition|expanded|anniversary|legacy|collector'?s?)\b/gi, '') // Remove keywords
        .replace(/20\d\d/g, '') // Remove years like 2011
        .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric
        .trim();
    };

    const isSpoiler = (name, artist) => {
      if (!name) return false;
      const normName = normalize(name);

      // Check 1: Direct normalized match
      const directMatch = allAlbums.some(a => normalize(a.name) === normName);
      if (directMatch) return true;

      // Check 2: Substring match (e.g. "Abbey Road" inside "Abbey Road Remastered")
      // Only do this if normName is long enough to avoid "Blue" vs "Blue Train" false positives
      if (normName.length > 3) {
        const substringMatch = allAlbums.some(a => {
          const listNorm = normalize(a.name);
          // If list name is inside recommendation (e.g. List: "Ready to Die" -> Rec: "Ready to Die Remastered")
          // Or if recommendation is inside list (unlikely but possible)
          return normName.includes(listNorm) || listNorm.includes(normName);
        });
        if (substringMatch) return true;
      }

      return false;
    };

    // STRATEGY: album.getsimilar is broken/deprecated (returns 400).
    // WORKAROUND: Get similar CURRENT ARTISTS -> Get TOP ALBUM for each similar artist.

    // 1. Get Similar Artists
    // FETCH MORE (60) to allow for client-side pagination/shuffling
    const simArtistUrl = new URL(LASTFM_BASE_URL);
    simArtistUrl.searchParams.append('method', 'artist.getSimilar');
    simArtistUrl.searchParams.append('artist', artistName.trim());
    simArtistUrl.searchParams.append('api_key', LASTFM_API_KEY.trim());
    simArtistUrl.searchParams.append('format', 'json');
    simArtistUrl.searchParams.append('limit', '60');
    simArtistUrl.searchParams.append('autocorrect', '1');

    console.log("Fetching Similar Artists:", simArtistUrl.toString());
    const simResponse = await fetch(simArtistUrl.toString());

    if (!simResponse.ok) return [];
    const simData = await simResponse.json();

    if (!simData.similarartists || !simData.similarartists.artist) return [];

    const similarArtists = Array.isArray(simData.similarartists.artist)
      ? simData.similarartists.artist
      : [simData.similarartists.artist];

    // 2. For each similar artist, get their Top Album
    // We limit concurrency to avoid browser/network limits if needed, but Promise.all is usually fine for ~60
    const albumPromises = similarArtists.map(async (artist) => {
      try {
        const topAlbUrl = new URL(LASTFM_BASE_URL);
        topAlbUrl.searchParams.append('method', 'artist.getTopAlbums');
        topAlbUrl.searchParams.append('artist', artist.name);
        topAlbUrl.searchParams.append('api_key', LASTFM_API_KEY.trim());
        topAlbUrl.searchParams.append('format', 'json');
        topAlbUrl.searchParams.append('limit', '1'); // Just the #1 album

        const albResponse = await fetch(topAlbUrl.toString());
        if (!albResponse.ok) return null;
        const albData = await albResponse.json();

        const topAlbum = albData.topalbums?.album?.[0];
        if (!topAlbum) return null;

        // CHECK FOR SPOILER
        if (isSpoiler(topAlbum.name, artist.name)) {
          // console.log(`Spoiler blocked: ${topAlbum.name} by ${artist.name}`);
          return null;
        }

        const images = topAlbum.image;
        const imageUrl = images ? images.find(img => img.size === 'extralarge')?.['#text'] || images.find(img => img.size === 'large')?.['#text'] : null;

        return {
          id: topAlbum.mbid || topAlbum.url,
          name: topAlbum.name,
          artist: artist.name,
          image: imageUrl,
          url: topAlbum.url
        };
      } catch (e) {
        return null;
      }
    });

    const results = await Promise.all(albumPromises);
    // Filter nulls and return ALL valid ones (Frontend handles slicing)
    return results.filter(a => a && a.name && a.image);

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return null;
  }
}

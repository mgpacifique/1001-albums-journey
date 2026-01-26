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

export async function getAlbumStats(albumName) {
  if (!albumName) return null;

  try {
    if (!cachedStats) {
      const response = await fetch(`${BASE_URL}/albums/stats`);
      if (response.ok) {
        cachedStats = await response.json();
      }
    }

    if (cachedStats && cachedStats.albums) {
      // Find album by name (case-insensitive)
      const found = cachedStats.albums.find(a =>
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

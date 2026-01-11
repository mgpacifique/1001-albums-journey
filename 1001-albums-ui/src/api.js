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
}

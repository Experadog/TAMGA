export async function fetchOSMData(osmId, isCity = false) {
  try {
    if (!osmId) return null;
    const url = `${process.env.API_URL}/osm/${osmId}${isCity ? '?type=relation' : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('fetchOSMData error:', e);
    return null;
  }
}
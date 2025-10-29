// src/lib/utils/fetchOSMData.js
export async function fetchOSMData(osmId, isCity = false) {
  if (!osmId) return null;

  const base = `${process.env.API_URL}/osm/${osmId}`;
  const candidates = isCity
    ? [`${base}?type=relation`, base]
    : [base, `${base}?type=relation`];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });

      if (res.status === 404) {
        continue;
      }

      if (!res.ok) {
        console.warn('fetchOSMData non-OK:', res.status, url);
        return null;
      }

      return await res.json();
    } catch (err) {
      console.warn('fetchOSMData fetch error:', err?.message || err);
    }
  }

  return null;
}
const _osmMemCache = globalThis.__OSM_CACHE__ ??= new Map();

export async function fetchOSMData(osmId, isCity = false, typeHint = '') {
  if (!osmId) return null;

  const hint = String(typeHint || '').toLowerCase();
  const isVillageLike = ['village', 'hamlet', 'settlement', 'айыл', 'аыл', 'айыл-кыштак']
    .some(k => hint.includes(k));

  const order = isCity
    ? ['relation', 'way', 'node']
    : (isVillageLike ? ['node', 'way', 'relation'] : ['way', 'node', 'relation']);

  for (const kind of order) {
    const cacheKey = `${osmId}:${kind}`;
    if (_osmMemCache.has(cacheKey)) return _osmMemCache.get(cacheKey);

    let query = '';
    if (kind === 'relation') {
      query = `[out:json]; relation(${osmId}); out geom;`;
    } else if (kind === 'way') {
      query = `[out:json]; way(${osmId}); out geom;`;
    } else {
      query = `[out:json]; node(${osmId}); out;`;
    }

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: query,
        // кэш Next на 7 дней (OSM редко меняется), снимет повторные запросы
        next: { revalidate: 60 * 60 * 24 * 7 }
      });

      if (!res.ok) continue;

      const data = await res.json();
      const el = data?.elements?.[0];
      if (!el) continue;

      let result = null;

      if (kind === 'relation' && el.type === 'relation') {
        const outerWays = [];
        if (Array.isArray(el.members)) {
          const outers = el.members.filter(m => m.type === 'way' && m.role === 'outer');
          for (const m of outers) {
            if (m.geometry) outerWays.push(m.geometry.map(p => [p.lat, p.lon]));
          }
        }
        if (outerWays.length) {
          result = { coords: outerWays, elementType: 'relation', isMultiPolygon: true, isClosedWay: true };
        }
      }

      if (!result && kind === 'way' && el.type === 'way' && Array.isArray(el.geometry)) {
        const coords = el.geometry.map(p => [p.lat, p.lon]);
        let isClosedWay = false;
        if (coords.length > 2) {
          const [a0, a1] = coords[0];
          const [b0, b1] = coords[coords.length - 1];
          isClosedWay = a0 === b0 && a1 === b1;
        }
        result = { coords, elementType: 'way', isClosedWay };
      }

      if (!result && kind === 'node' && el.type === 'node') {
        result = { point: [el.lat, el.lon], elementType: 'node' };
      }

      if (result) {
        _osmMemCache.set(cacheKey, result);
        return result;
      }
    } catch (_) {
      continue;
    }
  }

  return null;
}
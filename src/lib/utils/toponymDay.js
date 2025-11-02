// /src/lib/toponymDay.js
export const RANGE_DAYS = 5;

export function pad2(n) { return String(n).padStart(2, '0'); }
export function toISO(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }

function atMidnight(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function clampDate(d, minD, maxD) {
  const x = atMidnight(d);
  const min = atMidnight(minD);
  const max = atMidnight(maxD);
  if (x < min) return min;
  if (x > max) return max;
  return x;
}

export function pickDateFromParams(searchParams, now = new Date()) {
  const today = atMidnight(now);
  const min = new Date(today); min.setDate(min.getDate() - RANGE_DAYS);
  const max = new Date(today); max.setDate(max.getDate() + RANGE_DAYS);

  const qDay = Number(searchParams?.day);
  const qMonth = Number(searchParams?.month);

  let current = new Date(today);
  if (Number.isInteger(qDay) && Number.isInteger(qMonth) && qDay > 0 && qMonth >= 1 && qMonth <= 12) {
    current = clampDate(new Date(today.getFullYear(), qMonth - 1, qDay), min, max);
  }

  return { current, now, min, max };
}

export function isToday(current, now = new Date()) {
  return atMidnight(current).getTime() === atMidnight(now).getTime();
}

export function dmQueryOrEmpty(current, now = new Date()) {
  if (isToday(current, now)) return '';
  const d = current.getDate();
  const m = current.getMonth() + 1;
  return `?day=${encodeURIComponent(d)}&month=${encodeURIComponent(m)}`;
}

export function navHrefs(basePath, current, min, max, now = new Date()) {
  const prev = atMidnight(current); prev.setDate(prev.getDate() - 1);
  const next = atMidnight(current); next.setDate(next.getDate() + 1);

  const canPrev = prev >= atMidnight(min);
  const canNext = next <= atMidnight(max);

  const prevHref = canPrev
    ? (isToday(prev, now) ? basePath : `${basePath}?day=${prev.getDate()}&month=${prev.getMonth() + 1}`)
    : null;

  const nextHref = canNext
    ? (isToday(next, now) ? basePath : `${basePath}?day=${next.getDate()}&month=${next.getMonth() + 1}`)
    : null;

  return { prevHref, nextHref };
}

export async function fetchToponymOfDay(fetchDataFn, current, now = new Date()) {
  const payload = await (isToday(current, now)
    ? fetchDataFn()
    : fetchDataFn(current.getDate(), current.getMonth() + 1));

  const results = Array.isArray(payload?.results) ? payload.results : [];
  const wrapper = results[0] || null;
  return wrapper?.toponym || null;
}
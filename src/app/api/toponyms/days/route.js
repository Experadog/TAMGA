import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const day = searchParams.get('day');
    const month = searchParams.get('month');

    // Эти параметры обязательны
    if (!day || !month) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const upstream = `${process.env.API_URL}/toponyms/toponym/days/?day=${encodeURIComponent(
      day
    )}&month=${encodeURIComponent(month)}`;

    const resp = await fetch(upstream, { cache: 'no-store' });
    if (!resp.ok) return NextResponse.json({ results: [] }, { status: 200 });

    const data = await resp.json();
    // На всякий: пропустим как есть (массив или объект)
    return NextResponse.json(data);
  } catch (e) {
    console.error('toponym-day proxy error:', e);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const q = (searchParams.get('search') || '').trim();

        // Если пустой поисковый запрос — возвращаем пустую выборку
        if (!q) {
            return NextResponse.json({ results: [] });
        }

        const upstream = `${process.env.API_URL}/territories/districts/?search=${encodeURIComponent(q)}`;

        const resp = await fetch(upstream, { cache: 'no-store' });

        if (!resp.ok) {
            return NextResponse.json({ results: [] }, { status: 200 });
        }

        const data = await resp.json();
        const results = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        return NextResponse.json({ results });
    } catch (e) {
        console.error('Error fetching districts:', e);
        return NextResponse.json({ results: [] }, { status: 200 });
    }
}

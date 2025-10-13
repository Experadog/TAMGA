import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(`${process.env.API_URL}/directories/thematic-groups/`, {
            cache: 'force-cache',
            next: { revalidate: 3600 } // Кешируем на час
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch thematic-groups: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching thematic-groups:', error);
        return NextResponse.json(
            { error: 'Failed to fetch thematic-groups' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(`${process.env.API_URL}/toponyms`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch toponyms: ${response.status}`);
        }

        const data = await response.json();

        const toponyms = data.results || data;

        const toponymsWithCoordinates = toponyms.filter(toponym =>
            toponym.latitude &&
            toponym.longitude &&
            !isNaN(Number(toponym.latitude)) &&
            !isNaN(Number(toponym.longitude))
        );

        return NextResponse.json(toponymsWithCoordinates);
    } catch (error) {
        console.error('Error fetching toponyms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch toponyms' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(`${process.env.API_URL}/territories/aiyl-aimaks/`, {
            cache: 'force-cache',
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch aiyl-aimaks: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching aiyl-aimaks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch aiyl-aimaks' },
            { status: 500 }
        );
    }
}

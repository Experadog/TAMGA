import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(`${process.env.API_URL}/territories/districts/`, {
            cache: 'force-cache',
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch districts: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching districts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch districts' },
            { status: 500 }
        );
    }
}

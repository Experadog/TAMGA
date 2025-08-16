import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(`${process.env.API_URL}/directories/toponyms-typs/`, {
            cache: 'force-cache',
            next: { revalidate: 3600 } // Кешируем на час
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch toponyms-typs: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching toponyms-typs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch toponyms-typs' },
            { status: 500 }
        );
    }
}

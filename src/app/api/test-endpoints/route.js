import { NextResponse } from 'next/server';

export async function GET() {
    const endpoints = [
        '/api/directories/languages',
        '/api/directories/plast',
        '/api/directories/dialects-speech',
        '/api/directories/directions',
        '/api/directories/terms-topomyns',
        '/api/directories/toponyms-typs',
        '/api/territories/regions',
        '/api/territories/districts',
        '/api/territories/cities',
        '/api/territories/aiyl-aimaks',
        '/api/territories/aiyls',
        '/api/territories/special-territories'
    ];

    const results = {};

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(`http://localhost:3001${endpoint}`);
            if (response.ok) {
                const data = await response.json();
                results[endpoint] = {
                    status: 'success',
                    count: data.results?.length || data.count || 0,
                    data: data
                };
            } else {
                results[endpoint] = {
                    status: 'error',
                    error: `HTTP ${response.status}`
                };
            }
        } catch (error) {
            results[endpoint] = {
                status: 'error',
                error: error.message
            };
        }
    }

    return NextResponse.json(results);
}

import { NextResponse } from 'next/server';

export async function GET() {
    const endpoints = [
        '/api/directories/plast',
        '/api/directories/languages',
        '/api/directories/dialects-speech',
        '/api/directories/topoformants',
        '/api/directories/class-topomyns',
        '/api/directories/terms-topomyns',
        '/api/directories/toponyms-typs',
        '/api/directories/terms',
        '/api/directories/thematic-groups',
        '/api/territories/regions',
        '/api/territories/aiyl-aimaks',
        '/api/territories/cities',
        '/api/territories/districts',
        '/api/territories/aiyls',
        '/api/territories/special-territories',
        'urban-settlements'
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

'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

const ToponymMap = dynamic(() => import('@/components/Map/ToponymMap'), {
  ssr: false, 
});

export default function ToponymPage({ params }) {
    const { id } = use(params)
    return (
        <div className='country-map'>
            <ToponymMap id={id} />
        </div>
    );
}
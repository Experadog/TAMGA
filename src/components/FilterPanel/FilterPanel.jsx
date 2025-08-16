import FilterForm from './FilterForm';

// Функции для получения справочных данных
async function getDirectories() {
    try {
        // Добавляем базовый домен для внутренних запросов
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.tamga.kg/api/v1';
        
        const [
            languagesRes,
            regionsRes,
            districtsRes,
            citiesRes,
            aiylsRes,
            aiylAimaksRes,
            specialTerritoriesRes,
            plastsRes
        ] = await Promise.allSettled([
            fetch(`${baseUrl}/directories/languages/`, { cache: 'force-cache', next: { revalidate: 3600 } }),
            fetch(`${baseUrl}/territories/regions/`, { cache: 'force-cache', next: { revalidate: 3600 } }),
            fetch(`${baseUrl}/territories/districts/`, { cache: 'force-cache', next: { revalidate: 3600 } }),
            fetch(`${baseUrl}/territories/cities/`, { cache: 'force-cache', next: { revalidate: 3600 } }),
            fetch(`${baseUrl}/territories/aiyls/`, { cache: 'force-cache', next: { revalidate: 3600 } }),
            fetch(`${baseUrl}/territories/aiyl-aimaks/`, { cache: 'force-cache', next: { revalidate: 3600 } }),
            fetch(`${baseUrl}/territories/special-territories/`, { cache: 'force-cache', next: { revalidate: 3600 } }),
            fetch(`${baseUrl}/directories/plast/`, { cache: 'force-cache', next: { revalidate: 3600 } })
        ]);

        // Обработка результатов с fallback для ошибок
        const getData = async (result, fallback = []) => {
            if (result.status === 'fulfilled' && result.value.ok) {
                try {
                    const data = await result.value.json();
                    return data.results || data || fallback;
                } catch {
                    return fallback;
                }
            }
            return fallback;
        };

        const [
            languages,
            regions,
            districts,
            cities,
            aiyls,
            aiylAimaks,
            specialTerritories,
            plasts
        ] = await Promise.all([
            getData(languagesRes),
            getData(regionsRes),
            getData(districtsRes),
            getData(citiesRes),
            getData(aiylsRes),
            getData(aiylAimaksRes),
            getData(specialTerritoriesRes),
            getData(plastsRes)
        ]);

        return {
            languages: languages || [],
            regions: regions || [],
            districts: districts || [],
            cities: cities || [],
            aiyls: aiyls || [],
            aiyl_aimaks: aiylAimaks || [],
            special_territories: specialTerritories || [],
            plasts: plasts || []
        };
    } catch (error) {
        console.error('Error fetching directories:', error);
        // Возвращаем пустые массивы в случае ошибки
        return {
            languages: [],
            regions: [],
            districts: [],
            cities: [],
            aiyls: [],
            aiyl_aimaks: [],
            special_territories: [],
            plasts: []
        };
    }
}

export default async function FilterPanel({ locale }) {
    const directories = await getDirectories();

    return (
        <FilterForm
            locale={locale}
            directories={directories}
        />
    );
}

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Построение query параметров для внешнего API
    const apiParams = new URLSearchParams();

    // Массивы параметров, которые поддерживают множественные значения
    const arrayParams = ['region', 'district', 'city', 'aiyl', 'aiyl_aimak', 'special_territory', 'plast'];

    // Параметры, которые нужно исключить (технические)
    const excludedParams = ['id', 'vscodeBrowserReqId'];

    // Получаем все уникальные ключи параметров
    const uniqueKeys = new Set();
    for (const key of searchParams.keys()) {
      uniqueKeys.add(key);
    }

    // Обрабатываем каждый уникальный ключ
    for (const key of uniqueKeys) {
      if (excludedParams.includes(key)) {
        continue; // Пропускаем технические параметры
      }

      if (arrayParams.includes(key)) {
        // Для массивных параметров получаем все значения
        const allValues = searchParams.getAll(key);
        allValues.forEach(val => {
          if (val && String(val).trim() !== '') {
            apiParams.append(key, String(val));
          }
        });
      } else {
        // Для остальных параметров берем первое значение
        const value = searchParams.get(key);
        if (value && String(value).trim() !== '') {
          apiParams.set(key, String(value));
        }
      }
    }

    const apiUrl = `${process.env.API_URL}/toponyms/toponym/list/maps${apiParams.toString() ? `?${apiParams.toString()}` : ''}`;

    const response = await fetch(apiUrl, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Failed to fetch toponyms from external API: ${response.status} for URL: ${apiUrl}`);
      // Возвращаем пустые результаты вместо ошибки
      return NextResponse.json({
        count: 0,
        next: null,
        previous: null,
        results: []
      });
    }

    const data = await response.json();

    // Убеждаемся что у нас есть массив топонимов
    let toponyms = [];
    if (data.results && Array.isArray(data.results)) {
      toponyms = data.results;
    } else if (Array.isArray(data)) {
      toponyms = data;
    }

    const toponymsWithCoordinates = toponyms.filter(toponym =>
      toponym &&
      toponym.latitude &&
      toponym.longitude &&
      !isNaN(Number(toponym.latitude)) &&
      !isNaN(Number(toponym.longitude))
    );

    // Возвращаем данные с информацией о пагинации если есть
    return NextResponse.json({
      results: toponymsWithCoordinates,
      count: data.count,
      next: data.next,
      previous: data.previous
    });
  } catch (error) {
    console.error('Error fetching toponyms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch toponyms' },
      { status: 500 }
    );
  }
}
'use client';

import buttonCancelIcon from '@/assets/icons/button-cancel.svg';
import chevronIconActive from '@/assets/icons/filter-chevron-active.svg';
import chevronIcon from '@/assets/icons/filter-chevron.svg';
import filtersIcon from '@/assets/icons/filters.svg';
import settingActiveIcon from '@/assets/icons/settings-active.svg';
import settingsIcon from '@/assets/icons/settings.svg';
import { getLocalizedValue } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import SimpleCustomSelect from '../SimpleCustomSelect';
import styles from './HorizontalFilters.module.scss';

export default function HorizontalFilters({ locale, pageKind = 'auto' }) {

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const inferredKind =
        pageKind !== 'auto'
            ? pageKind
            : pathname?.endsWith('/search')
                ? 'search'
                : pathname?.includes('/glossary')
                    ? 'glossary'
                    : pathname?.includes('/search-on-map/results')
                        ? 'coordsMap'
                        : 'map';

    const basePathByKind = {
        search: `/${locale}/search`,
        glossary: `/${locale}/glossary`,
        map: `/${locale}/map`,
        coordsMap: `/${locale}/search-on-map/results`,
    };
    const shouldReplace =
        inferredKind === 'search' ||
        inferredKind === 'glossary' ||
        inferredKind === 'coordsMap';

    const t = useTranslations('filters');

    // Расширенное состояние для справочников
    const [directories, setDirectories] = useState({
        plast: [],
        languages: [],
        dialects_speech: [],
        topoformants: [],
        class_topomyns: [],
        terms_topomyns: [],
        toponyms_typs: [],
        terms: [],
        thematic_groups: [],
        regions: [],
        aiyl_aimaks: [],
        cities: [],
        districts: [],
        aiyls: [],
        special_territories: [],
        // urban_settlements: [], // ???
    });

    const LS_KEY = `labels:${locale}`;

    const CLASS_LS_KEY = `selectedClassTopomyns:${locale}:${inferredKind}`;

    const readStoredClasses = () => {
        try {
            const raw = sessionStorage.getItem(CLASS_LS_KEY);
            if (!raw) return [];
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr.map(Number) : [];
        } catch {
            return [];
        }
    };
    const writeStoredClasses = (ids) => {
        try {
            sessionStorage.setItem(CLASS_LS_KEY, JSON.stringify((ids || []).map(Number)));
        } catch { }
    };
    const clearStoredClasses = () => {
        try {
            sessionStorage.removeItem(CLASS_LS_KEY);
        } catch { }
    };

    function mapFromObj(obj) {
        const m = new Map();
        if (obj && typeof obj === 'object') {
            Object.entries(obj).forEach(([k, v]) => m.set(Number(k), v));
        }
        return m;
    }

    function objFromMap(m) {
        const o = {};
        for (const [k, v] of m.entries()) o[k] = v;
        return o;
    }

    // Кэш подписей, чтобы чипы показывались даже если options пусты
    const [entityLabels, setEntityLabels] = useState({
        aiyl_aimaks: new Map(),
        cities: new Map(),
        districts: new Map(),
        aiyls: new Map(),
        special_territories: new Map(),
    });

    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            setEntityLabels({
                aiyl_aimaks: mapFromObj(parsed.aiyl_aimaks),
                cities: mapFromObj(parsed.cities),
                districts: mapFromObj(parsed.districts),
                aiyls: mapFromObj(parsed.aiyls),
                special_territories: mapFromObj(parsed.special_territories),
            });
        } catch { }
    }, [LS_KEY]);

    const persistEntityLabels = (next) => {
        try {
            const payload = {
                aiyl_aimaks: objFromMap(next.aiyl_aimaks),
                cities: objFromMap(next.cities),
                districts: objFromMap(next.districts),
                aiyls: objFromMap(next.aiyls),
                special_territories: objFromMap(next.special_territories),
            };
            localStorage.setItem(LS_KEY, JSON.stringify(payload));
        } catch { }
    };

    // Лоадеры на время удалённого поиска
    const [loadingRemote, setLoadingRemote] = useState({
        aiyl_aimaks: false,
        cities: false,
        districts: false,
        aiyls: false,
        special_territories: false,
    });

    // Загрузка основных справочников при монтировании
    useEffect(() => {
        const loadInitialDirectories = async () => {
            try {
                const [
                    plast,
                    languages,
                    dialectsSpeech,
                    topoformants,
                    classTopomyns,
                    termsTopomyns,
                    toponymsTyps,
                    terms,
                    thematicGroups,
                    regions,
                    // aiylAimaks,
                    // cities,
                    // districts,
                    // aiyls,
                    // specialTerritories,
                    // urbanSettlements,
                ] = await Promise.all([
                    fetch('/api/directories/plast').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/languages').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/dialects-speech').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/topoformants').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/class-topomyns').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/terms-topomyns').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/toponyms-typs').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/terms').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/thematic-groups').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/regions').then(res => res.ok ? res.json() : { results: [] }),
                    // fetch('/api/territories/aiyl-aimaks').then(res => res.ok ? res.json() : { results: [] }),
                    // fetch('/api/territories/cities').then(res => res.ok ? res.json() : { results: [] }),
                    // fetch('/api/territories/districts').then(res => res.ok ? res.json() : { results: [] }),
                    // fetch('/api/territories/aiyls').then(res => res.ok ? res.json() : { results: [] }),
                    // fetch('/api/territories/special-territories').then(res => res.ok ? res.json() : { results: [] }),
                    // fetch('/api/territories/urban-settlements').then(res => res.ok ? res.json() : { results: [] }),
                ]);

                setDirectories(prev => ({
                    ...prev,
                    plast: plast.results || [],
                    languages: languages.results || [],
                    dialects_speech: dialectsSpeech.results || [],
                    topoformants: topoformants.results || [],
                    class_topomyns: classTopomyns.results || [],
                    terms_topomyns: termsTopomyns.results || [],
                    toponyms_typs: toponymsTyps.results || [],
                    terms: terms.results || [],
                    thematic_groups: thematicGroups.results || [],
                    regions: regions.results || [],
                    // aiyl_aimaks: aiylAimaks.results || [],
                    // cities: cities.results || [],
                    // districts: districts.results || [],
                    // aiyls: aiyls.results || [],
                    // special_territories: specialTerritories.results || [],
                    // urban_settlements: urbanSettlements.results || [],
                }));
            } catch (error) {
                console.error('Error loading initial directories:', error);
            }
        };

        loadInitialDirectories();
    }, []);

    // Унифицированный фетчер для 5 справочников: только ?search
    const fetchRemoteDirectory = useCallback(async (type, q) => {
        // Пустой запрос → пустые результаты, никаких сетевых вызовов
        if (!q || !q.trim()) {
            setDirectories(prev => ({ ...prev, [type]: [] }));
            setLoadingRemote(prev => ({ ...prev, [type]: false }));
            return;
        }
        try {
            setLoadingRemote(prev => ({ ...prev, [type]: true }));
            // const res = await fetch(`/api/territories/${type.replace('_', '-')}` + `?search=${encodeURIComponent(q.trim())}`);
            // if (!res.ok) throw new Error(`${type} fetch failed`);
            const slug = type.replace(/_/g, '-'); // replace **все** подчёркивания
            const url = `/api/territories/${slug}?search=${encodeURIComponent(q.trim())}`;
            const res = await fetch(url);
            // Не бросаем исключение — мягко обрабатываем не-200
            if (!res.ok) {
                console.warn(`${type} fetch non-OK:`, res.status);
                setDirectories(prev => ({ ...prev, [type]: [] }));
                return;
            }
            const data = await res.json();
            const list = data?.results || [];
            setDirectories(prev => ({ ...prev, [type]: list }));
            // обновим кэш подписей для чипов
            setEntityLabels(prev => {
                const map = new Map(prev[type]);
                for (const it of list) {
                    map.set(it.id, getLocalizedValue(it, 'name', locale));
                }
                const next = { ...prev, [type]: map };
                persistEntityLabels(next);
                return next;
            });

        } catch (e) {
            console.error('remote search error:', type, e);
            setDirectories(prev => ({ ...prev, [type]: [] }));
        } finally {
            setLoadingRemote(prev => ({ ...prev, [type]: false }));
        }
    }, [locale]);

    const queryHandlers = useMemo(() => ({
        districts: (q) => fetchRemoteDirectory('districts', q),
        cities: (q) => fetchRemoteDirectory('cities', q),
        aiyl_aimaks: (q) => fetchRemoteDirectory('aiyl_aimaks', q),
        aiyls: (q) => fetchRemoteDirectory('aiyls', q),
        special_territories: (q) => fetchRemoteDirectory('special_territories', q),
    }), [fetchRemoteDirectory]);

    const getLabelFromCache = (type, id) => {
        const dir = directories[type] || [];
        const inList = dir.find(x => x.id === id);
        if (inList) return getLocalizedValue(inList, 'name', locale);
        const cached = entityLabels[type]?.get(id);
        // если подписи нет — вернём пусто, чип не отрисуем
        return cached || '';
    };

    // Инициализация состояния из searchParams
    const [filters, setFilters] = useState({
        search: '',
        startswith: '',
        language: '',
        ordering: '',
        offset: '0',
        plast: [],
        languages: [],
        dialects_speech: [],
        topoformants: [],
        class_topomyns: [],
        terms_topomyns: [],
        toponyms_typs: [],
        terms: [],
        thematic_groups: [],
        region: [],
        aiyl_aimak: [],
        city: [],
        district: [],
        aiyl: [],
        special_territory: [],
        // urban_settlement: [],
    });

    // Состояние для управления отображением фильтров
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Состояние для временных фильтров (до применения)
    const [tempFilters, setTempFilters] = useState(filters);

    // Состояние для видимости отдельных фильтров
    const [filterVisibility, setFilterVisibility] = useState({
        plast: true,
        languages: true,
        dialects_speech: true,
        topoformants: true,
        class_topomyns: true,
        terms_topomyns: true,
        toponyms_typs: true,
        terms: true,
        thematic_groups: true,
        regions: true,
        aiyl_aimaks: true,
        cities: true,
        districts: true,
        aiyls: true,
        special_territories: true,
        // urban_settlements: true,
    });

    // Получаем доступные фильтры для настроек
    const getAvailableFilters = () => {
        const filters = [];

        if (directories.plast.length > 0) {
            filters.push({ id: 'plast', name: `${t('group.plast')}`, category: 'linguistic' });
        }
        if (directories.languages.length > 0) {
            filters.push({ id: 'languages', name: `${t('group.languages')}`, category: 'linguistic' });
        }
        if (directories.dialects_speech.length > 0) {
            filters.push({ id: 'dialects_speech', name: `${t('group.dialect-speech')}`, category: 'linguistic' });
        }
        if (directories.topoformants.length > 0) {
            filters.push({ id: 'topoformants', name: `${t('group.topoformants')}`, category: 'linguistic' });
        }
        if (directories.class_topomyns.length > 0) {
            filters.push({ id: 'class_topomyns', name: `${t('group.class-topomyns')}`, category: 'linguistic' });
        }
        if (directories.terms_topomyns.length > 0) {
            filters.push({ id: 'terms_topomyns', name: `${t('group.terms-toponyms')}`, category: 'linguistic' });
        }
        if (directories.toponyms_typs.length > 0) {
            filters.push({ id: 'toponyms_typs', name: `${t('group.toponyms-typs')}`, category: 'linguistic' });
        }
        if (directories.terms.length > 0) {
            filters.push({ id: 'terms', name: `${t('group.terms')}`, category: 'linguistic' });
        }
        if (directories.thematic_groups.length > 0) {
            filters.push({ id: 'thematic_groups', name: `${t('group.thematic-groups')}`, category: 'linguistic' });
        }
        if (directories.regions.length > 0) {
            filters.push({ id: 'regions', name: `${t('group.regions')}`, category: 'geographic' });
        }
        if (directories.aiyl_aimaks.length > 0) {
            filters.push({ id: 'aiyl_aimaks', name: `${t('group.ayil-aimak')}`, category: 'geographic' });
        }
        if (directories.cities.length > 0) {
            filters.push({ id: 'cities', name: `${t('group.cities')}`, category: 'geographic' });
        }
        if (directories.districts.length > 0) {
            filters.push({ id: 'districts', name: `${t('group.districts')}`, category: 'geographic' });
        }
        if (directories.aiyls.length > 0) {
            filters.push({ id: 'aiyls', name: `${t('group.ayils')}`, category: 'geographic' });
        }
        if (directories.special_territories.length > 0) {
            filters.push({ id: 'special_territories', name: `${t('group.special-territories')}`, category: 'geographic' });
        }
        // if (directories.urban_settlements.length > 0) {
        //     filters.push({ id: 'urban_settlements', name: `${t('group.urban-settlements')}`, category: 'geographic' });
        // }

        return filters;
    };

    // Получаем выбранные фильтры для настроек
    const getSelectedFilters = () => {
        return Object.keys(filterVisibility).filter(key => filterVisibility[key]);
    };

    // Обработчик клика вне выпадающего списка настроек
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSettingsOpen && !event.target.closest(`.${styles.settingsButton}`)) {
                setIsSettingsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSettingsOpen]);

    // Алфавитная панель кириллица + латиница

    const alphabetCyrillic = [
        'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й',
        'К', 'Л', 'М', 'Н', 'Ң', 'О', 'Ө', 'П', 'Р', 'С', 'Т',
        'У', 'Ү', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ы', 'Э', 'Ю', 'Я'
    ];

    const alphabetKyrgyz = [
        'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й',
        'К', 'Л', 'М', 'Н', 'Ң', 'О', 'Ө', 'П', 'Р', 'С', 'Т',
        'У', 'Ү', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ы', 'Э', 'Ю', 'Я'
    ];

    const alphabetLatin = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
        'L', 'M', 'N', 'Ñ', 'O', 'Ö', 'P', 'Q', 'R', 'S', 'T',
        'U', 'Ü', 'V', 'W', 'X', 'Y', 'Z'
    ];
    const alphabet = {
        'ky': alphabetKyrgyz,
        'ru': alphabetCyrillic,
        'en': alphabetLatin
    }

    // Функция для загрузки справочников
    const loadDirectories = async (type, parentId = null) => {
        try {
            let url = '';
            switch (type) {
                case 'districts':
                    url = parentId ? `/api/territories/districts?region=${parentId}` : '/api/territories/districts';
                    break;
                case 'cities':
                    url = parentId ? `/api/territories/cities?district=${parentId}` : '/api/territories/cities';
                    break;
                case 'aiyl_aimaks':
                    url = '/api/territories/aiyl-aimaks';
                    break;
                case 'aiyls':
                    url = '/api/territories/aiyls';
                    break;
                case 'special_territories':
                    url = '/api/territories/special-territories';
                    break;
                // case 'urban_settlements':
                //     url = '/api/territories/urban-settlements';
                //     break;
            }

            if (url && !directories[type].length) {
                const response = await fetch(url);
                const data = await response.json();
                setDirectories(prev => ({
                    ...prev,
                    [type]: data.results || []
                }));
            }
        } catch (error) {
            console.error(`Error loading ${type}:`, error);
        }
    };

    // Вспомогательная функция для рендеринга опций с поддержкой иерархии
    const renderDirectoryOptions = (items, prefix = '') => {
        const options = [];

        items.forEach(item => {
            const displayName = getLocalizedValue(item, 'name', locale)
            options.push(
                <option key={item.id} value={item.id}>
                    {prefix}{displayName}
                </option>
            );

            // Если есть дочерние элементы, добавляем их с отступом
            if (item.children && item.children.length > 0) {
                options.push(...renderDirectoryOptions(item.children, prefix + '  ➤ '));
            }
        });

        return options;
    };

    // Вспомогательная функция для поиска элемента в иерархии
    const findItemInHierarchy = (items, targetId) => {
        for (const item of items) {
            if (item.id == targetId) {
                return item;
            }

            if (item.children && item.children.length > 0) {
                const found = findItemInHierarchy(item.children, targetId);
                if (found) {
                    return { ...found, parent: item };
                }
            }
        }
        return null;
    };

    // Универсальная функция для поиска элемента (плоская структура или иерархия)
    const findDirectoryItem = (directoryName, targetId) => {
        const items = directories[directoryName] || [];

        // Сначала пробуем простой поиск (для плоских массивов)
        const simpleFind = items.find(item => item.id == targetId);
        if (simpleFind) {
            return simpleFind;
        }

        // Если не найдено, пробуем иерархический поиск
        return findItemInHierarchy(items, targetId);
    };

    const selectedClassIds = (tempFilters.class_topomyns ?? []).map(Number);
    const allTermsTopomyns = directories.terms_topomyns ?? [];

    // Если классы выбраны — фильтруем по полю `class_toponym`.
    // На всякий случай поддержим, если на термине `class_toponym` может быть массивом или числом.
    const termsTopomynsOptions = selectedClassIds.length
        ? allTermsTopomyns.filter(term => {
            const cls = term?.class_toponym;
            if (Array.isArray(cls)) {
                return cls.some((id) => selectedClassIds.includes(Number(id)));
            }
            return selectedClassIds.includes(Number(cls));
        })
        : allTermsTopomyns;

    // Обновляем фильтры когда изменяются searchParams
    useEffect(() => {
        const urlClass = searchParams.getAll('class_topomyns').map(Number);
        const storedClass = urlClass.length ? urlClass : readStoredClasses();
        const newFilters = {
            search: searchParams.get('search') || '',
            startswith: searchParams.get('startswith') || '',
            ordering: searchParams.get('ordering') || '',
            offset: searchParams.get('offset') || '0',
            language: searchParams.get('language') || '',
            plast: searchParams.getAll('plast').map(Number),
            languages: searchParams.getAll('languages').map(Number),
            dialects_speech: searchParams.getAll('dialects_speech').map(Number),
            topoformants: searchParams.getAll('topoformants').map(Number),
            // class_topomyns: searchParams.getAll('class_topomyns').map(Number),
            class_topomyns: storedClass,
            terms_topomyns: searchParams.getAll('terms_topomyns').map(Number),
            toponyms_typs: searchParams.getAll('toponyms_types').map(Number),
            terms: searchParams.getAll('terms').map(Number),
            thematic_groups: searchParams.getAll('thematic_groups').map(Number),
            region: searchParams.getAll('region').map(Number),
            aiyl_aimak: searchParams.getAll('aiyl_aimak').map(Number),
            city: searchParams.getAll('city').map(Number),
            district: searchParams.getAll('district').map(Number),
            aiyl: searchParams.getAll('aiyl').map(Number),
            special_territory: searchParams.getAll('special_territory').map(Number),
            // urban_settlement: searchParams.getAll('urban_settlement').map(Number),
        };
        setFilters(newFilters);
        setTempFilters(newFilters);
    }, [searchParams]);

    useEffect(() => {
        // Список валидных id терминов после фильтрации
        const validIds = new Set(termsTopomynsOptions.map(t => Number(t.id)));
        const currentSelected = tempFilters.terms_topomyns ?? [];
        const pruned = currentSelected.filter(id => validIds.has(Number(id)));

        if (pruned.length !== currentSelected.length) {
            setTempFilters(prev => ({ ...prev, terms_topomyns: pruned }));
        }
    }, [tempFilters.class_topomyns, directories.terms_topomyns]);

    const updateURL = (newFilters) => {
        const params = new URLSearchParams();
        const keyMap = {
            toponyms_typs: 'toponyms_types',
        };

        // ключи, которые НЕ надо отправлять в URL
        const SKIP_KEYS = new Set(['class_topomyns']);

        Object.entries(newFilters).forEach(([key, value]) => {
            if (SKIP_KEYS.has(key)) return; // пропускаем

            const outKey = keyMap[key] || key;

            if (Array.isArray(value)) {
                value.forEach(item => {
                    if (item && String(item).trim() !== '') {
                        params.append(outKey, String(item));
                    }
                });
            } else if (value && String(value).trim() !== '') {
                params.set(outKey, String(value));
            }
        });

        // Сохраняем текущий режим отображения (list/grid/alpha)
        try {
            const currentView = searchParams.get('view');
            if (currentView) params.set('view', currentView);
        } catch { }

        if (inferredKind === 'coordsMap') {
            try {
                const lat = searchParams.get('latitude');
                const lng = searchParams.get('longitude');
                const rad = searchParams.get('radius');

                if (lat) params.set('latitude', lat);
                if (lng) params.set('longitude', lng);
                if (rad) params.set('radius', rad);
            } catch { }
        }

        const queryString = params.toString();
        const basePath = basePathByKind[inferredKind];

        const newUrl = queryString ? `${basePath}?${queryString}` : basePath;
        // На странице поиска — не уходим со страницы и не создаём запись в истории
        if (shouldReplace) router.replace(newUrl, { scroll: false });
        else router.push(newUrl, { scroll: false });
    };

    const handleInputChange = (name, value) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);

        // Небольшая задержка для поиска
        if (name === 'search' || name === 'startswith') {
            clearTimeout(window.searchTimeout);
            window.searchTimeout = setTimeout(() => {
                updateURL(newFilters);
            }, 500);
        } else {
            updateURL(newFilters);
        }
    };

    const handleMultiSelectChange = (name, value, isChecked) => {
        const currentValues = filters[name] || [];
        let newValues;

        if (isChecked) {
            newValues = [...currentValues, parseInt(value)];
        } else {
            newValues = currentValues.filter(v => v !== parseInt(value));
        }

        const newFilters = { ...filters, [name]: newValues, offset: '0' };
        setFilters(newFilters);
        updateURL(newFilters);
    };

    // Новая функция для кастомного мультиселекта (теперь работает с временными фильтрами)
    const handleCustomMultiSelectChange = (name, selectedValues) => {
        const newTempFilters = { ...tempFilters, [name]: selectedValues, offset: '0' };
        setTempFilters(newTempFilters);
        if (name === 'class_topomyns') {
            writeStoredClasses(selectedValues);
        }
    };

    // Функция применения фильтров
    const applyFilters = () => {
        // копируем временные фильтры
        const next = { ...tempFilters };

        const hasClass = Array.isArray(next.class_topomyns) && next.class_topomyns.length > 0;
        const hasTerms = Array.isArray(next.terms_topomyns) && next.terms_topomyns.length > 0;

        // если выбраны классы, но ни одного термина не выбрано — подставляем все отфильтрованные термины
        if (hasClass && !hasTerms) {
            next.terms_topomyns = (termsTopomynsOptions || []).map(t => Number(t.id)).filter(Boolean);
        }
        writeStoredClasses(next.class_topomyns || []);
        setFilters(next);
        updateURL(next);
    };

    // Функция для удаления фильтра из чипа (применяется сразу)
    const removeFilter = (name, selectedValues) => {
        const newFilters = { ...filters, [name]: selectedValues, offset: '0' };
        const newTempFilters = { ...tempFilters, [name]: selectedValues, offset: '0' };
        setFilters(newFilters);
        setTempFilters(newTempFilters);
        if (name === 'class_topomyns') {
            if ((selectedValues || []).length === 0) clearStoredClasses();
            else writeStoredClasses(selectedValues);
        }
        updateURL(newFilters);
    };

    // Функция для управления видимостью фильтров через мультиселект
    const handleFilterVisibilityChange = (selectedFilters) => {
        const newVisibility = {};

        // Устанавливаем все фильтры как невидимые
        Object.keys(filterVisibility).forEach(key => {
            newVisibility[key] = false;
        });

        // Устанавливаем выбранные фильтры как видимые
        selectedFilters.forEach(filterId => {
            newVisibility[filterId] = true;
        });

        setFilterVisibility(newVisibility);

        // Очищаем значения скрытых фильтров
        const filterFieldMap = {
            plast: 'plast',
            languages: 'languages',
            dialects_speech: 'dialects_speech',
            topoformants: 'topoformants',
            class_topomyns: 'class_topomyns',
            terms_topomyns: 'terms_topomyns',
            toponyms_typs: 'toponyms_typs',
            terms: 'terms',
            thematic_groups: 'thematic_groups',
            regions: 'region',
            aiyl_aimaks: 'aiyl_aimak',
            cities: 'city',
            districts: 'district',
            aiyls: 'aiyl',
            special_territories: 'special_territory',
            // urban_settlements: 'urban_settlement',
        };

        const clearedFilters = { ...filters };
        const clearedTempFilters = { ...tempFilters };

        Object.keys(filterVisibility).forEach(filterName => {
            if (!selectedFilters.includes(filterName)) {
                const fieldName = filterFieldMap[filterName];
                if (fieldName) {
                    clearedFilters[fieldName] = [];
                    clearedTempFilters[fieldName] = [];
                }
            }
        });

        if (JSON.stringify(clearedFilters) !== JSON.stringify(filters)) {
            setFilters(clearedFilters);
            setTempFilters(clearedTempFilters);
            updateURL(clearedFilters);
        }
    };

    // Переключение алфавитного фильтра
    const handleAlphabetClick = (letter) => {
        const newStartswith = filters.startswith === letter.toLowerCase() ? '' : letter.toLowerCase();

        // проставляем language = текущая locale (en|ru|ky)
        const next = {
            ...filters,
            startswith: newStartswith,
            language: locale,
            offset: '0'
        };

        setFilters(next);
        // поддержим tempFilters визуально (не обязательно, но приятно)
        setTempFilters(prev => ({ ...prev, startswith: newStartswith }));

        // без дебаунса — сразу пушим
        updateURL(next);
    };

    // Очистить все фильтры
    const clearFilters = () => {
        const clearedFilters = {
            plast: [],
            languages: [],
            dialects_speech: [],
            topoformants: [],
            class_topomyns: [],
            terms_topomyns: [],
            toponyms_typs: [],
            terms: [],
            thematic_groups: [],
            region: [],
            aiyl_aimak: [],
            city: [],
            district: [],
            aiyl: [],
            special_territory: [],
            // urban_settlement: [],
            search: '',
            startswith: '',
            language: '',
            ordering: '',
            offset: '0'
        };
        setFilters(clearedFilters);
        setTempFilters(clearedFilters);
        clearStoredClasses();
        updateURL(clearedFilters);
    };

    // Подсчет активных фильтров
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.startswith) count++;
        if (filters.ordering && filters.ordering !== '') count++;

        // Подсчет массивов (включая новые поля как массивы)
        [
            'plast',
            'languages',
            'dialects_speech',
            'topoformants',
            'class_topomyns',
            'terms_topomyns',
            'toponyms_typs',
            'terms',
            'thematic_groups',
            'region',
            'aiyl_aimak',
            'city',
            'district',
            'aiyl',
            'special_territory',
            // 'urban_settlement',
        ].forEach(key => {
            // count += filters[key].length;
            count += Array.isArray(filters[key]) ? filters[key].length : 0;
        });

        return count;
    };

    return (
        <div className={styles.horizontalFilters}>
            <div className={styles.topRow}>
                <div className={styles.topRowLeft}>
                    <Image src={filtersIcon} width={24} height={24} alt='' />
                    <span className={styles.filtersTablet}>{t('header.filter-title')}:</span>
                    <span className={styles.filterCount}>{t('header.applied-title')} {getActiveFiltersCount()}</span>
                </div>

                <div className={styles.topRowRight}>
                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={`${styles.toggleButton} ${styles.filtersButton}`}
                    >
                        <span className={styles.filtersDesktop} style={{ marginRight: '3px' }}>{t('header.filter-action')}</span>
                        <span className={styles.filtersTablet}>{t('header.filter-all')}</span>

                        {isFiltersOpen ?
                            <Image className={styles.filterAction} src={chevronIconActive} alt='' /> :
                            <Image className={styles.filterAction} src={chevronIcon} alt='' />
                        }
                    </button>

                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`${styles.toggleButton} ${styles.settingsButton} ${isSettingsOpen ? styles.active : ''}`}
                    >
                        {isSettingsOpen ?
                            <Image className={styles.settingsAction} src={settingActiveIcon} alt='' /> :
                            <Image className={styles.settingsAction} src={settingsIcon} alt='' />
                        }
                        <span className={styles.filtersDesktop} style={{ marginRight: '3px' }}>{t('header.settings')}</span>
                        <span className={styles.filtersTablet}>{t('header.settings-relation')}</span>

                        {/* Выпадающий список настроек */}
                        {isSettingsOpen && (
                            <div className={styles.settingsDropdown} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.dropdownHeader}>
                                    <span>{t('header.settings')} {t('header.settings-relation')}</span>
                                </div>
                                <div className={styles.dropdownContent}>
                                    <div className={styles.filtersList}>
                                        {getAvailableFilters().map(filter => (
                                            <label key={filter.id} className={styles.filterOption}>
                                                <input
                                                    type="checkbox"
                                                    checked={filterVisibility[filter.id]}
                                                    onChange={(e) => {
                                                        const currentSelected = getSelectedFilters();
                                                        let newSelected;

                                                        if (e.target.checked) {
                                                            newSelected = [...currentSelected, filter.id];
                                                        } else {
                                                            newSelected = currentSelected.filter(id => id !== filter.id);
                                                        }

                                                        handleFilterVisibilityChange(newSelected);
                                                    }}
                                                    className={styles.filterCheckbox}
                                                />
                                                <span className={styles.filterLabel}>{filter.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Строка фильтров */}
            {isFiltersOpen && (
                <div className={styles.filtersRow}>
                    <div className={styles.filtersGroup}>

                        {/* Пласт (кастомный мультиселект) */}
                        {filterVisibility.plast && directories.plast.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.plast}
                                    selectedValues={tempFilters.plast}
                                    onChange={(values) => handleCustomMultiSelectChange('plast', values)}
                                    placeholder={t('group.plast')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Тип топонима/Язык */}
                        {filterVisibility.languages && directories.languages.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.languages}
                                    selectedValues={tempFilters.languages}
                                    onChange={(values) => handleCustomMultiSelectChange('languages', values)}
                                    placeholder={t('group.languages')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Диалекты речи */}
                        {filterVisibility.dialects_speech && directories.dialects_speech.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.dialects_speech}
                                    selectedValues={tempFilters.dialects_speech}
                                    onChange={(values) => handleCustomMultiSelectChange('dialects_speech', values)}
                                    placeholder={t('group.dialect-speech')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Топоформанты */}
                        {filterVisibility.topoformants && directories.topoformants.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.topoformants}
                                    selectedValues={tempFilters.topoformants}
                                    onChange={(values) => handleCustomMultiSelectChange('topoformants', values)}
                                    placeholder={t('group.topoformants')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Классы */}
                        {filterVisibility.class_topomyns && directories.class_topomyns.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.class_topomyns}
                                    selectedValues={tempFilters.class_topomyns}
                                    onChange={(values) => handleCustomMultiSelectChange('class_topomyns', values)}
                                    placeholder={t('group.class-topomyns')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Термины топонимов */}
                        {filterVisibility.terms_topomyns && directories.terms_topomyns.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={termsTopomynsOptions}
                                    selectedValues={tempFilters.terms_topomyns}
                                    onChange={(values) => handleCustomMultiSelectChange('terms_topomyns', values)}
                                    placeholder={t('group.terms-toponyms')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Типы топонимов */}
                        {filterVisibility.toponyms_typs && directories.toponyms_typs.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.toponyms_typs}
                                    selectedValues={tempFilters.toponyms_typs}
                                    onChange={(values) => handleCustomMultiSelectChange('toponyms_typs', values)}
                                    placeholder={t('group.toponyms-typs')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Термины */}
                        {filterVisibility.terms && directories.terms.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.terms}
                                    selectedValues={tempFilters.terms}
                                    onChange={(values) => handleCustomMultiSelectChange('terms', values)}
                                    placeholder={t('group.terms')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Направления */}
                        {filterVisibility.thematic_groups && directories.thematic_groups.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.thematic_groups}
                                    selectedValues={tempFilters.thematic_groups}
                                    onChange={(values) => handleCustomMultiSelectChange('thematic_groups', values)}
                                    placeholder={t('group.thematic-groups')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Выбрать регионы */}
                        {filterVisibility.regions && directories.regions.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.regions}
                                    selectedValues={tempFilters.region}
                                    onChange={(values) => {
                                        handleCustomMultiSelectChange('region', values);
                                        // Загружаем районы для выбранных регионов
                                        if (values.length > 0) {
                                            values.forEach(regionId => loadDirectories('districts', regionId));
                                        }
                                    }}
                                    placeholder={t('group.regions')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Районы */}
                        {filterVisibility.districts && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.districts}
                                    selectedValues={tempFilters.district}
                                    onChange={(values) => handleCustomMultiSelectChange('district', values)}
                                    placeholder={t('group.districts')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                    forceSearch={true}
                                    remoteMode={true}
                                    loading={loadingRemote.districts}
                                    onQueryChange={queryHandlers.districts}
                                    emptyHint="Введите название района"
                                />
                            </div>
                        )}

                        {/* Города */}
                        {filterVisibility.cities && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.cities}
                                    selectedValues={tempFilters.city}
                                    onChange={(values) => handleCustomMultiSelectChange('city', values)}
                                    placeholder={t('group.cities')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                    forceSearch={true}
                                    remoteMode={true}
                                    loading={loadingRemote.cities}
                                    onQueryChange={queryHandlers.cities}
                                    emptyHint="Введите название города"
                                />
                            </div>
                        )}

                        {/* Айыл-Айымаки */}
                        {filterVisibility.aiyl_aimaks && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.aiyl_aimaks}
                                    selectedValues={tempFilters.aiyl_aimak}
                                    onChange={(values) => handleCustomMultiSelectChange('aiyl_aimak', values)}
                                    placeholder={t('group.ayil-aimak')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                    forceSearch={true}
                                    remoteMode={true}
                                    loading={loadingRemote.aiyl_aimaks}
                                    onQueryChange={queryHandlers.aiyl_aimaks}
                                    emptyHint="Введите название айыл-акмака"
                                />
                            </div>
                        )}

                        {/* Айылы */}
                        {filterVisibility.aiyls && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.aiyls}
                                    selectedValues={tempFilters.aiyl}
                                    onChange={(values) => handleCustomMultiSelectChange('aiyl', values)}
                                    placeholder={t('group.ayils')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                    forceSearch={true}
                                    remoteMode={true}
                                    loading={loadingRemote.aiyls}
                                    onQueryChange={queryHandlers.aiyls}
                                    emptyHint="Введите название айыла"
                                />
                            </div>
                        )}

                        {/* Специальные территории */}
                        {filterVisibility.special_territories && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.special_territories}
                                    selectedValues={tempFilters.special_territory}
                                    onChange={(values) => handleCustomMultiSelectChange('special_territory', values)}
                                    placeholder={t('group.special-territories')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                    forceSearch={true}
                                    remoteMode={true}
                                    loading={loadingRemote.special_territories}
                                    onQueryChange={queryHandlers.special_territories}
                                    emptyHint="Введите название спец. территории"
                                />
                            </div>
                        )}

                        {/* Городские поселения */}
                        {/* {filterVisibility.urban_settlements && directories.urban_settlements.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.urban_settlements}
                                    selectedValues={tempFilters.urban_settlement}
                                    onChange={(values) => handleCustomMultiSelectChange('urban_settlement', values)}
                                    placeholder={t('group.urban-settlements')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )} */}

                    </div>
                    <div className={styles.leftActions}>
                        <button onClick={clearFilters} className={`${styles.actionButtons} ${styles.clearButton}`}>
                            {t('group.clear')}
                        </button>
                        <button onClick={applyFilters} className={`${styles.actionButtons} ${styles.applyButton}`}>
                            {t('group.apply')}
                        </button>
                    </div>
                </div>
            )}

            {/* Выбранные фильтры (чипы) */}
            {getActiveFiltersCount() > 0 && (
                <div className={styles.selectedFilters}>

                    {/* Пласт */}
                    {filters.plast.map(id => {
                        const plastItem = findDirectoryItem('plast', id);
                        return plastItem ? (
                            <div key={`plast-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(plastItem, 'name', locale)}</span>
                                <button onClick={() => removeFilter('plast', filters.plast.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Язык */}
                    {filters.languages.map(id => {
                        const languages = findDirectoryItem('languages', id);
                        return languages ? (
                            <div key={`languages-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(languages, 'name', locale)}</span>
                                <button onClick={() => removeFilter('languages', filters.languages.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Диалекты речи */}
                    {filters.dialects_speech.map(id => {
                        const found = findDirectoryItem('dialects_speech', id);
                        return found ? (
                            <div key={`dialects_speech-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(found, 'name', locale)}</span>
                                <button onClick={() => removeFilter('dialects_speech', filters.dialects_speech.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Топоформанты */}
                    {filters.topoformants.map(id => {
                        const found = findDirectoryItem('topoformants', id);
                        return found ? (
                            <div key={`topoformants-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(found, 'name', locale)}</span>
                                <button onClick={() => removeFilter('topoformants', filters.topoformants.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}
                    {/* Классы */}
                    {filters.class_topomyns.map(id => {
                        const found = findDirectoryItem('class_topomyns', id);
                        return found ? (
                            <div key={`class_topomyns-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(found, 'name', locale)}</span>
                                <button onClick={() => removeFilter('class_topomyns', filters.class_topomyns.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Термины топонимов */}
                    {filters.terms_topomyns.map(id => {
                        const found = findDirectoryItem('terms_topomyns', id);
                        return found ? (
                            <div key={`terms_topomyns-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(found, 'name', locale)}</span>
                                <button onClick={() => removeFilter('terms_topomyns', filters.terms_topomyns.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Типы топонимов */}
                    {filters.toponyms_typs.map(id => {
                        const found = findDirectoryItem('toponyms_typs', id);
                        return found ? (
                            <div key={`toponyms_typs-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(found, 'name', locale)}</span>
                                <button onClick={() => removeFilter('toponyms_typs', filters.toponyms_typs.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Термины */}
                    {filters.terms.map(id => {
                        const found = findDirectoryItem('terms', id);
                        return found ? (
                            <div key={`terms-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(found, 'name', locale)}</span>
                                <button onClick={() => removeFilter('terms', filters.terms.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Направления */}
                    {filters.thematic_groups.map(id => {
                        const found = findDirectoryItem('thematic_groups', id);
                        return found ? (
                            <div key={`thematic_groups-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(found, 'name', locale)}</span>
                                <button onClick={() => removeFilter('thematic_groups', filters.thematic_groups.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Регионы */}
                    {filters.region.map(id => {
                        const region = directories.regions.find(r => r.id === id);
                        return region ? (
                            <div key={`region-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(region, 'name', locale)}</span>
                                <button onClick={() => removeFilter('region', filters.region.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Районы */}
                    {filters.district.map(id => {
                        const label = getLabelFromCache('districts', id);
                        return label ? (
                            <div key={`district-${id}`} className={styles.filterChip}>
                                <span>{label}</span>
                                <button onClick={() => removeFilter('district', filters.district.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Города */}
                    {filters.city.map(id => {
                        const label = getLabelFromCache('cities', id);
                        return label ? (
                            <div key={`city-${id}`} className={styles.filterChip}>
                                <span>{label}</span>
                                <button onClick={() => removeFilter('city', filters.city.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Айыл-Айымаки */}
                    {filters.aiyl_aimak.map(id => {
                        const label = getLabelFromCache('aiyl_aimaks', id);
                        return label ? (
                            <div key={`aiyl_aimak-${id}`} className={styles.filterChip}>
                                <span>{label}</span>
                                <button onClick={() => removeFilter('aiyl_aimak', filters.aiyl_aimak.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Айылы */}
                    {filters.aiyl.map(id => {
                        const label = getLabelFromCache('aiyls', id);
                        return label ? (
                            <div key={`aiyl-${id}`} className={styles.filterChip}>
                                <span>{label}</span>
                                <button onClick={() => removeFilter('aiyl', filters.aiyl.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Специальные территории */}
                    {filters.special_territory.map(id => {
                        const label = getLabelFromCache('special_territories', id);
                        return label ? (
                            <div key={`special_territory-${id}`} className={styles.filterChip}>
                                <span>{label}</span>
                                <button onClick={() => removeFilter('special_territory', filters.special_territory.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Городские поселения */}
                    {/* {filters.urban_settlement.map(id => {
                        const urbanSettlement = directories.urban_settlements.find(u => u.id === id);
                        return urbanSettlement ? (
                            <div key={`urban_settlement-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(urbanSettlement, 'name', locale)}</span>
                                <button onClick={() => removeFilter('urban_settlement', filters.urban_settlement.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })} */}

                    {/* Поиск */}
                    {filters.search && (
                        <div className={styles.filterChip}>
                            <span>"{filters.search}"</span>
                            <button onClick={() => handleInputChange('search', '')}>
                                <Image src={buttonCancelIcon} alt='' />
                            </button>
                        </div>
                    )}


                    {/* Алфавит */}
                    {filters.startswith && (
                        <div className={styles.filterChip}>
                            <span>"{filters.startswith.toUpperCase()}"</span>
                            <button onClick={() => handleInputChange('startswith', '')}>
                                <Image src={buttonCancelIcon} alt='' />
                            </button>
                        </div>
                    )}

                </div>
            )}

            {/* Алфавитная панель */}
            <div className={styles.alphabetRow}>
                {alphabet[locale].map(letter => (
                    <button
                        key={letter}
                        className={`${styles.alphabetButton} ${filters.startswith === letter.toLowerCase() ? styles.active : ''
                            }`}
                        onClick={() => handleAlphabetClick(letter)}
                    >
                        {letter}
                    </button>
                ))}
            </div>
        </div>
    );
}

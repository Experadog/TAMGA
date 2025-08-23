'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './HorizontalFilters.module.scss';
import SimpleCustomSelect from '../SimpleCustomSelect';
import filtersIcon from '@/assets/icons/filters.svg';
import chevronIcon from '@/assets/icons/filter-chevron.svg';
import chevronIconActive from '@/assets/icons/filter-chevron-active.svg';
import settingsIcon from '@/assets/icons/settings.svg';
import settingActiveIcon from '@/assets/icons/settings-active.svg';
import buttonCancelIcon from '@/assets/icons/button-cancel.svg';
import { useTranslations } from 'next-intl';
import { getLocalizedValue } from '@/lib/utils';

export default function HorizontalFilters({ locale, directories: initialDirectories }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const t = useTranslations('filters');

    // Расширенное состояние для справочников
    const [directories, setDirectories] = useState({
        languages: [],
        regions: [],
        districts: [],
        cities: [],
        aiyl_aimaks: [],
        aiyls: [],
        special_territories: [],
        urban_settlements: [],
        plast: [],
        dialects_speech: [],
        directions: [],
        terms_topomyns: [],
        toponyms_typs: []
    });

    // Загрузка основных справочников при монтировании
    useEffect(() => {
        const loadInitialDirectories = async () => {
            try {
                const [languages, regions, plast, dialectsSpeech, directions, termsTopomyns, toponymsTyps, aiylAimaks, aiyls, specialTerritories, urbanSettlements, districts, cities] = await Promise.all([
                    fetch('/api/directories/languages').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/regions').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/plast').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/dialects-speech').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/directions').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/terms-topomyns').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/toponyms-typs').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/aiyl-aimaks').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/aiyls').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/special-territories').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/urban-settlements').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/districts').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/cities').then(res => res.ok ? res.json() : { results: [] })
                ]);

                setDirectories(prev => ({
                    ...prev,
                    languages: languages.results || [],
                    regions: regions.results || [],
                    plast: plast.results || [],
                    dialects_speech: dialectsSpeech.results || [],
                    directions: directions.results || [],
                    terms_topomyns: termsTopomyns.results || [],
                    toponyms_typs: toponymsTyps.results || [],
                    aiyl_aimaks: aiylAimaks.results || [],
                    aiyls: aiyls.results || [],
                    special_territories: specialTerritories.results || [],
                    urban_settlements: urbanSettlements.results || [],
                    districts: districts.results || [],
                    cities: cities.results || []
                }));
            } catch (error) {
                console.error('Error loading initial directories:', error);
            }
        };

        loadInitialDirectories();
    }, []);

    // Инициализация состояния из searchParams
    const [filters, setFilters] = useState({
        search: '',
        startswith: '',
        language: [],
        region: [],
        district: [],
        city: [],
        aiyl: [],
        aiyl_aimak: [],
        special_territory: [],
        urban_settlement: [],
        plast: [],
        dialects_speech: [],
        directions: [],
        terms_topomyns: [],
        toponyms_typs: [],
        ordering: '',
        offset: '0'
    });

    // Состояние для управления отображением фильтров
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Состояние для временных фильтров (до применения)
    const [tempFilters, setTempFilters] = useState(filters);

    // Состояние для видимости отдельных фильтров
    const [filterVisibility, setFilterVisibility] = useState({
        regions: true,
        districts: true,
        cities: true,
        aiyl_aimaks: true,
        aiyls: true,
        special_territories: true,
        urban_settlements: true,
        languages: true,
        dialects_speech: true,
        directions: true,
        terms_topomyns: true,
        toponyms_typs: true,
        plast: true
    });

    // Получаем доступные фильтры для настроек
    const getAvailableFilters = () => {
        const filters = [];

        // Географические фильтры
        if (directories.plast.length > 0) {
            filters.push({ id: 'plast', name: `${t('group.plast')}`, category: 'linguistic' });
        }
        if (directories.regions.length > 0) {
            filters.push({ id: 'regions', name: `${t('group.regions')}`, category: 'geographic' });
        }
        if (directories.districts.length > 0) {
            filters.push({ id: 'districts', name: `${t('group.disctricts')}`, category: 'geographic' });
        }
        if (directories.cities.length > 0) {
            filters.push({ id: 'cities', name: `${t('group.cities')}`, category: 'geographic' });
        }
        if (directories.aiyl_aimaks.length > 0) {
            filters.push({ id: 'aiyl_aimaks', name: `${t('group.ayil-aimak')}`, category: 'geographic' });
        }
        if (directories.aiyls.length > 0) {
            filters.push({ id: 'aiyls', name: `${t('group.ayils')}`, category: 'geographic' });
        }
        if (directories.special_territories.length > 0) {
            filters.push({ id: 'special_territories', name: `${t('group.special-territories')}`, category: 'geographic' });
        }
        if (directories.urban_settlements.length > 0) {
            filters.push({ id: 'urban_settlements', name: `${t('group.urban-settlements')}`, category: 'geographic' });
        }

        // Лингвистические фильтры
        if (directories.languages.length > 0) {
            filters.push({ id: 'languages', name: `${t('group.languages')}`, category: 'linguistic' });
        }
        if (directories.dialects_speech.length > 0) {
            filters.push({ id: 'dialects_speech', name: `${t('group.dialect-speech')}`, category: 'linguistic' });
        }
        if (directories.directions.length > 0) {
            filters.push({ id: 'directions', name: `${t('group.directions')}`, category: 'linguistic' });
        }
        if (directories.terms_topomyns.length > 0) {
            filters.push({ id: 'terms_topomyns', name: `${t('group.terms-toponyms')}`, category: 'linguistic' });
        }
        if (directories.toponyms_typs.length > 0) {
            filters.push({ id: 'toponyms_typs', name: `${t('group.toponyms-typs')}`, category: 'linguistic' });
        }

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
    
    const alphabetKyrgyz = [
        'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й',
        'К', 'Л', 'М', 'Н', 'Ң', 'О', 'Ө', 'П', 'Р', 'С', 'Т',
        'У', 'Ү', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь',
        'Э', 'Ю', 'Я'
    ];
    const alphabetCyrillic = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Э', 'Ю', 'Я'];
    const alphabetLatin = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
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
                case 'urban_settlements':
                    url = '/api/territories/urban-settlements';
                    break;
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

    // Обновляем фильтры когда изменяются searchParams
    useEffect(() => {
        const newFilters = {
            search: searchParams.get('search') || '',
            startswith: searchParams.get('startswith') || '',
            language: searchParams.getAll('language').map(Number),
            region: searchParams.getAll('region').map(Number),
            district: searchParams.getAll('district').map(Number),
            city: searchParams.getAll('city').map(Number),
            aiyl: searchParams.getAll('aiyl').map(Number),
            aiyl_aimak: searchParams.getAll('aiyl_aimak').map(Number),
            special_territory: searchParams.getAll('special_territory').map(Number),
            urban_settlement: searchParams.getAll('urban_settlement').map(Number),
            plast: searchParams.getAll('plast').map(Number),
            dialects_speech: searchParams.getAll('dialects_speech').map(Number),
            directions: searchParams.getAll('directions').map(Number),
            terms_topomyns: searchParams.getAll('terms_topomyns').map(Number),
            toponyms_typs: searchParams.getAll('toponyms_typs').map(Number),
            ordering: searchParams.get('ordering') || '',
            offset: searchParams.get('offset') || '0'
        };
        setFilters(newFilters);
        setTempFilters(newFilters);
    }, [searchParams]);

    const updateURL = (newFilters) => {
        const params = new URLSearchParams();

        Object.entries(newFilters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                // Для массивов добавляем каждое значение отдельно
                value.forEach(item => {
                    if (item && String(item).trim() !== '') {
                        params.append(key, String(item));
                    }
                });
            } else if (value && String(value).trim() !== '') {
                params.set(key, String(value));
            }
        });

        const queryString = params.toString();
        const newUrl = queryString ? `/${locale}/map?${queryString}` : `/${locale}/map`;

        router.push(newUrl);
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
    };

    // Функция применения фильтров
    const applyFilters = () => {
        setFilters(tempFilters);
        updateURL(tempFilters);
    };

    // Функция для удаления фильтра из чипа (применяется сразу)
    const removeFilter = (name, selectedValues) => {
        const newFilters = { ...filters, [name]: selectedValues, offset: '0' };
        const newTempFilters = { ...tempFilters, [name]: selectedValues, offset: '0' };
        setFilters(newFilters);
        setTempFilters(newTempFilters);
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
            regions: 'region',
            districts: 'district',
            cities: 'city',
            aiyl_aimaks: 'aiyl_aimak',
            aiyls: 'aiyl',
            special_territories: 'special_territory',
            urban_settlements: 'urban_settlement',
            languages: 'language',
            dialects_speech: 'dialects_speech',
            directions: 'directions',
            terms_topomyns: 'terms_topomyns',
            toponyms_typs: 'toponyms_typs',
            plast: 'plast'
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
        handleInputChange('startswith', newStartswith);
    };

    // Очистить все фильтры
    const clearFilters = () => {
        const clearedFilters = {
            search: '',
            startswith: '',
            language: [],
            region: [],
            district: [],
            city: [],
            aiyl: [],
            aiyl_aimak: [],
            special_territory: [],
            urban_settlement: [],
            plast: [],
            dialects_speech: [],
            directions: [],
            terms_topomyns: [],
            toponyms_typs: [],
            ordering: '',
            offset: '0'
        };
        setFilters(clearedFilters);
        setTempFilters(clearedFilters);
        updateURL(clearedFilters);
    };

    // Подсчет активных фильтров
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.startswith) count++;
        if (filters.ordering && filters.ordering !== '') count++;

        // Подсчет массивов (включая новые поля как массивы)
        ['language', 'region', 'district', 'city', 'aiyl', 'aiyl_aimak', 'special_territory', 'urban_settlement', 'plast', 'dialects_speech', 'directions', 'terms_topomyns', 'toponyms_typs'].forEach(key => {
            count += filters[key].length;
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
                        {filterVisibility.districts && directories.districts.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.districts}
                                    selectedValues={tempFilters.district}
                                    onChange={(values) => {
                                        handleCustomMultiSelectChange('district', values);
                                        // Загружаем города для выбранных районов
                                        if (values.length > 0) {
                                            values.forEach(districtId => loadDirectories('cities', districtId));
                                        }
                                    }}
                                    placeholder={t('group.disctricts')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Города */}
                        {filterVisibility.cities && directories.cities.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.cities}
                                    selectedValues={tempFilters.city}
                                    onChange={(values) => handleCustomMultiSelectChange('city', values)}
                                    placeholder={t('group.cities')}
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
                                    selectedValues={tempFilters.language}
                                    onChange={(values) => handleCustomMultiSelectChange('language', values)}
                                    placeholder={t('group.languages')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}


                        {/* Направления */}
                        {filterVisibility.directions && directories.directions.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.directions}
                                    selectedValues={tempFilters.directions}
                                    onChange={(values) => handleCustomMultiSelectChange('directions', values)}
                                    placeholder={t('group.directions')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => option.name || option.title}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Термины топонимов */}
                        {filterVisibility.terms_topomyns && directories.terms_topomyns.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.terms_topomyns}
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
                                    placeholder={t('group.toponym-typs')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Айыл-Айымаки */}
                        {filterVisibility.aiyl_aimaks && directories.aiyl_aimaks.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.aiyl_aimaks}
                                    selectedValues={tempFilters.aiyl_aimak}
                                    onChange={(values) => handleCustomMultiSelectChange('aiyl_aimak', values)}
                                    placeholder={t('group.ayil-aimak')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Айылы */}
                        {filterVisibility.aiyls && directories.aiyls.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.aiyls}
                                    selectedValues={tempFilters.aiyl}
                                    onChange={(values) => handleCustomMultiSelectChange('aiyl', values)}
                                    placeholder={t('group.ayils')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Специальные территории */}
                        {filterVisibility.special_territories && directories.special_territories.length > 0 && (
                            <div className={styles.filterGroup}>
                                <SimpleCustomSelect
                                    options={directories.special_territories}
                                    selectedValues={tempFilters.special_territory}
                                    onChange={(values) => handleCustomMultiSelectChange('special_territory', values)}
                                    placeholder={t('group.special-territories')}
                                    className={styles.customSelect}
                                    getOptionLabel={(option) => getLocalizedValue(option, 'name', locale)}
                                    multiSelect={true}
                                />
                            </div>
                        )}

                        {/* Городские поселения */}
                        {filterVisibility.urban_settlements && directories.urban_settlements.length > 0 && (
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
                        )}

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
                        const district = directories.districts.find(d => d.id === id);
                        return district ? (
                            <div key={`district-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(district, 'name', locale)}</span>
                                <button onClick={() => removeFilter('district', filters.district.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Города */}
                    {filters.city.map(id => {
                        const city = directories.cities.find(c => c.id === id);
                        return city ? (
                            <div key={`city-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(city, 'name', locale)}</span>
                                <button onClick={() => removeFilter('city', filters.city.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Айыл-Айымаки */}
                    {filters.aiyl_aimak.map(id => {
                        const aiylAimak = directories.aiyl_aimaks.find(a => a.id === id);
                        return aiylAimak ? (
                            <div key={`aiyl_aimak-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(aiylAimak, 'name', locale)}</span>
                                <button onClick={() => removeFilter('aiyl_aimak', filters.aiyl_aimak.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Айылы */}
                    {filters.aiyl.map(id => {
                        const aiyl = directories.aiyls.find(a => a.id === id);
                        return aiyl ? (
                            <div key={`aiyl-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(aiyl, 'name', locale)}</span>
                                <button onClick={() => removeFilter('aiyl', filters.aiyl.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Городские поселения */}
                    {filters.urban_settlement.map(id => {
                        const urbanSettlement = directories.urban_settlements.find(u => u.id === id);
                        return urbanSettlement ? (
                            <div key={`urban_settlement-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(urbanSettlement, 'name', locale)}</span>
                                <button onClick={() => removeFilter('urban_settlement', filters.urban_settlement.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Специальные территории */}
                    {filters.special_territory.map(id => {
                        const specialTerritory = directories.special_territories.find(s => s.id === id);
                        return specialTerritory ? (
                            <div key={`special_territory-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(specialTerritory, 'name', locale)}</span>
                                <button onClick={() => removeFilter('special_territory', filters.special_territory.filter(v => v !== id))}>
                                    <Image src={buttonCancelIcon} alt='' />
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Язык */}
                    {filters.language.map(id => {
                        const language = findDirectoryItem('languages', id);
                        return language ? (
                            <div key={`language-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(language, 'name', locale)}</span>
                                <button onClick={() => removeFilter('language', filters.language.filter(v => v !== id))}>
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

                    {/* Направления */}
                    {filters.directions.map(id => {
                        const found = findDirectoryItem('directions', id);
                        return found ? (
                            <div key={`directions-${id}`} className={styles.filterChip}>
                                <span>{getLocalizedValue(found, 'name', locale)}</span>
                                <button onClick={() => removeFilter('directions', filters.directions.filter(v => v !== id))}>
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

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './HorizontalFilters.module.scss';
import SimpleCustomSelect from '../SimpleCustomSelect';

export default function HorizontalFilters({ locale, directories: initialDirectories }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Расширенное состояние для справочников
    const [directories, setDirectories] = useState({
        languages: [],
        regions: [],
        republics: [],
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
                const [languages, regions, republics, plast, dialectsSpeech, directions, termsTopomyns, toponymsTyps, aiylAimaks, aiyls, specialTerritories, urbanSettlements] = await Promise.all([
                    fetch('/api/directories/languages').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/regions').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/republics').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/plast').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/dialects-speech').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/directions').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/terms-topomyns').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/directories/toponyms-typs').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/aiyl-aimaks').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/aiyls').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/special-territories').then(res => res.ok ? res.json() : { results: [] }),
                    fetch('/api/territories/urban-settlements').then(res => res.ok ? res.json() : { results: [] })
                ]);

                setDirectories(prev => ({
                    ...prev,
                    languages: languages.results || [],
                    regions: regions.results || [],
                    republics: republics.results || [],
                    plast: plast.results || [],
                    dialects_speech: dialectsSpeech.results || [],
                    directions: directions.results || [],
                    terms_topomyns: termsTopomyns.results || [],
                    toponyms_typs: toponymsTyps.results || [],
                    aiyl_aimaks: aiylAimaks.results || [],
                    aiyls: aiyls.results || [],
                    special_territories: specialTerritories.results || [],
                    urban_settlements: urbanSettlements.results || []
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
        republic: [],
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

    // Алфавитная панель кириллица + латиница
    const alphabetCyrillic = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Э', 'Ю', 'Я'];
    const alphabetLatin = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

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
            const displayName = item.name_ky || item.name_ru || item.name_en || item.name || item.title;
            
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

    // Обновляем фильтры когда изменяются searchParams
    useEffect(() => {
        setFilters({
            search: searchParams.get('search') || '',
            startswith: searchParams.get('startswith') || '',
            language: searchParams.getAll('language').map(Number),
            region: searchParams.getAll('region').map(Number),
            republic: searchParams.getAll('republic').map(Number),
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
        });
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

    // Новая функция для кастомного мультиселекта
    const handleCustomMultiSelectChange = (name, selectedValues) => {
        const newFilters = { ...filters, [name]: selectedValues, offset: '0' };
        setFilters(newFilters);
        updateURL(newFilters);
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
            republic: [],
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
        updateURL(clearedFilters);
    };

    // Подсчет активных фильтров
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.startswith) count++;
        if (filters.ordering && filters.ordering !== '') count++;
        
        // Подсчет массивов (включая новые поля как массивы)
        ['language', 'region', 'republic', 'district', 'city', 'aiyl', 'aiyl_aimak', 'special_territory', 'urban_settlement', 'plast', 'dialects_speech', 'directions', 'terms_topomyns', 'toponyms_typs'].forEach(key => {
            count += filters[key].length;
        });
        
        return count;
    };

    return (
        <div className={styles.horizontalFilters}>
            {/* Алфавитная панель */}
            <div className={styles.alphabetSection}>
                <div className={styles.alphabetLabel}>Алфавитный указатель:</div>
                <div className={styles.alphabetGrid}>
                    <div className={styles.alphabetRow}>
                        {alphabetCyrillic.map(letter => (
                            <button
                                key={letter}
                                className={`${styles.alphabetButton} ${
                                    filters.startswith === letter.toLowerCase() ? styles.active : ''
                                }`}
                                onClick={() => handleAlphabetClick(letter)}
                            >
                                {letter}
                            </button>
                        ))}
                    </div>
                    <div className={styles.alphabetRow}>
                        {alphabetLatin.map(letter => (
                            <button
                                key={letter}
                                className={`${styles.alphabetButton} ${
                                    filters.startswith === letter.toLowerCase() ? styles.active : ''
                                }`}
                                onClick={() => handleAlphabetClick(letter)}
                            >
                                {letter}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.alphabetActions}>
                    <button onClick={clearFilters} className={styles.clearButton}>
                        Очистить все фильтры
                    </button>
                    <span className={styles.filterCount}>
                        Применено фильтров: {getActiveFiltersCount()}
                    </span>
                </div>
            </div>

            {/* Строка фильтров */}
            <div className={styles.filtersRow}>
                {/* Выбрать регионы */}
                {directories.regions.length > 0 && (
                    <div className={styles.filterGroup}>
                        <SimpleCustomSelect
                            options={directories.regions}
                            selectedValues={filters.region}
                            onChange={(values) => {
                                handleCustomMultiSelectChange('region', values);
                                // Загружаем районы для выбранных регионов
                                if (values.length > 0) {
                                    values.forEach(regionId => loadDirectories('districts', regionId));
                                }
                            }}
                            placeholder="Выбрать регионы"
                            className={styles.customSelect}
                            getOptionLabel={(option) => option.name}
                            multiSelect={true}
                        />
                    </div>
                )}

                {/* Районы */}
                {directories.districts.length > 0 && (
                    <div className={styles.filterGroup}>
                        <SimpleCustomSelect
                            options={directories.districts}
                            selectedValues={filters.district}
                            onChange={(values) => {
                                handleCustomMultiSelectChange('district', values);
                                // Загружаем города для выбранных районов
                                if (values.length > 0) {
                                    values.forEach(districtId => loadDirectories('cities', districtId));
                                }
                            }}
                            placeholder="Выбрать районы"
                            className={styles.customSelect}
                            getOptionLabel={(option) => option.name}
                            multiSelect={true}
                        />
                    </div>
                )}

                {/* Города */}
                {directories.cities.length > 0 && (
                    <div className={styles.filterGroup}>
                        <SimpleCustomSelect
                            options={directories.cities}
                            selectedValues={filters.city}
                            onChange={(values) => handleCustomMultiSelectChange('city', values)}
                            placeholder="Выбрать города"
                            className={styles.customSelect}
                            getOptionLabel={(option) => option.name}
                            multiSelect={true}
                        />
                    </div>
                )}

                {/* Тип топонима/Язык */}
                {directories.languages.length > 0 && (
                    <div className={styles.filterGroup}>
                        <SimpleCustomSelect
                            options={directories.languages}
                            selectedValues={filters.language}
                            onChange={(values) => handleCustomMultiSelectChange('language', values)}
                            placeholder="Тип топонима/Язык"
                            className={styles.customSelect}
                            getOptionLabel={(option) => option.name_ky}
                            multiSelect={true}
                        />
                    </div>
                )}

                {/* Диалекты речи */}
                {directories.dialects_speech.length > 0 && (
                    <div className={styles.filterGroup}>
                        <SimpleCustomSelect
                            options={directories.dialects_speech}
                            selectedValues={filters.dialects_speech}
                            onChange={(values) => handleCustomMultiSelectChange('dialects_speech', values)}
                            placeholder="Диалекты речи"
                            className={styles.customSelect}
                            getOptionLabel={(option) => option.name_ky || option.name_ru || option.name_en || option.title}
                            multiSelect={true}
                        />
                    </div>
                )}

                {/* Направления */}
                {directories.directions.length > 0 && (
                    <div className={styles.filterGroup}>
                        <SimpleCustomSelect
                            options={directories.directions}
                            selectedValues={filters.directions}
                            onChange={(values) => handleCustomMultiSelectChange('directions', values)}
                            placeholder="Направления"
                            className={styles.customSelect}
                            getOptionLabel={(option) => option.name || option.title}
                            multiSelect={true}
                        />
                    </div>
                )}

                {/* Термины топонимов */}
                {directories.terms_topomyns.length > 0 && (
                    <div className={styles.filterGroup}>
                        <SimpleCustomSelect
                            options={directories.terms_topomyns}
                            selectedValues={filters.terms_topomyns}
                            onChange={(values) => handleCustomMultiSelectChange('terms_topomyns', values)}
                            placeholder="Термины топонимов"
                            className={styles.customSelect}
                            getOptionLabel={(option) => option.name_ky || option.title}
                            multiSelect={true}
                        />
                    </div>
                )}

                {/* Типы топонимов */}
                {directories.toponyms_typs.length > 0 && (
                    <div className={styles.filterGroup}>
                        <SimpleCustomSelect
                            options={directories.toponyms_typs}
                            selectedValues={filters.toponyms_typs}
                            onChange={(values) => handleCustomMultiSelectChange('toponyms_typs', values)}
                            placeholder="Типы топонимов"
                            className={styles.customSelect}
                            getOptionLabel={(option) => option.name || option.title}
                            multiSelect={true}
                        />
                    </div>
                )}

                {/* Пласт (кастомный мультиселект) */}
                {directories.plast.length > 0 && (
                    <div className={styles.filterGroup}>
                        <SimpleCustomSelect
                            options={directories.plast}
                            selectedValues={filters.plast}
                            onChange={(values) => handleCustomMultiSelectChange('plast', values)}
                            placeholder="Пласт"
                            className={styles.customSelect}
                            multiSelect={true}
                        />
                    </div>
                )}

                {/* Республики */}
                {directories.republics.length > 0 && (
                    <div className={styles.filterGroup}>
                        <SimpleCustomSelect
                            options={directories.republics}
                            selectedValues={filters.republic}
                            onChange={(values) => handleCustomMultiSelectChange('republic', values)}
                            placeholder="Республики"
                            className={styles.customSelect}
                            getOptionLabel={(option) => option.name}
                            multiSelect={true}
                        />
                    </div>
                )}

                {/* Айыл-Айымаки */}
                {directories.aiyl_aimaks.length > 0 && (
                    <div className={styles.filterGroup}>
                        <SimpleCustomSelect
                            options={directories.aiyl_aimaks}
                            selectedValues={filters.aiyl_aimak}
                            onChange={(values) => handleCustomMultiSelectChange('aiyl_aimak', values)}
                            placeholder="Айыл-Айымаки"
                            className={styles.customSelect}
                            getOptionLabel={(option) => option.name}
                            multiSelect={true}
                        />
                    </div>
                )}

                {/* Айылы */}
                {directories.aiyls.length > 0 && (
                    <div className={styles.filterGroup}>
                        <SimpleCustomSelect
                            options={directories.aiyls}
                            selectedValues={filters.aiyl}
                            onChange={(values) => handleCustomMultiSelectChange('aiyl', values)}
                            placeholder="Айылы"
                            className={styles.customSelect}
                            getOptionLabel={(option) => option.name}
                            multiSelect={true}
                        />
                    </div>
                )}

                {/* Городские поселения */}
                {directories.urban_settlements.length > 0 && (
                    <div className={styles.filterGroup}>
                        <SimpleCustomSelect
                            options={directories.urban_settlements}
                            selectedValues={filters.urban_settlement}
                            onChange={(values) => handleCustomMultiSelectChange('urban_settlement', values)}
                            placeholder="Городские поселения"
                            className={styles.customSelect}
                            getOptionLabel={(option) => option.name}
                            multiSelect={true}
                        />
                    </div>
                )}
            </div>

            {/* Выбранные фильтры (чипы) */}
            {getActiveFiltersCount() > 0 && (
                <div className={styles.selectedFilters}>
                    {/* Регионы */}
                    {filters.region.map(id => {
                        const region = directories.regions.find(r => r.id === id);
                        return region ? (
                            <div key={`region-${id}`} className={styles.filterChip}>
                                <span>Регион: {region.name}</span>
                                <button onClick={() => handleCustomMultiSelectChange('region', filters.region.filter(v => v !== id))}>
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}
                    
                    {/* Районы */}
                    {filters.district.map(id => {
                        const district = directories.districts.find(d => d.id === id);
                        return district ? (
                            <div key={`district-${id}`} className={styles.filterChip}>
                                <span>Район: {district.name}</span>
                                <button onClick={() => handleCustomMultiSelectChange('district', filters.district.filter(v => v !== id))}>
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Города */}
                    {filters.city.map(id => {
                        const city = directories.cities.find(c => c.id === id);
                        return city ? (
                            <div key={`city-${id}`} className={styles.filterChip}>
                                <span>Город: {city.name}</span>
                                <button onClick={() => handleCustomMultiSelectChange('city', filters.city.filter(v => v !== id))}>
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Республики */}
                    {filters.republic.map(id => {
                        const republic = directories.republics.find(r => r.id === id);
                        return republic ? (
                            <div key={`republic-${id}`} className={styles.filterChip}>
                                <span>Республика: {republic.name}</span>
                                <button onClick={() => handleCustomMultiSelectChange('republic', filters.republic.filter(v => v !== id))}>
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Айыл-Айымаки */}
                    {filters.aiyl_aimak.map(id => {
                        const aiylAimak = directories.aiyl_aimaks.find(a => a.id === id);
                        return aiylAimak ? (
                            <div key={`aiyl_aimak-${id}`} className={styles.filterChip}>
                                <span>Айыл-Айымак: {aiylAimak.name}</span>
                                <button onClick={() => handleCustomMultiSelectChange('aiyl_aimak', filters.aiyl_aimak.filter(v => v !== id))}>
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Айылы */}
                    {filters.aiyl.map(id => {
                        const aiyl = directories.aiyls.find(a => a.id === id);
                        return aiyl ? (
                            <div key={`aiyl-${id}`} className={styles.filterChip}>
                                <span>Айыл: {aiyl.name}</span>
                                <button onClick={() => handleCustomMultiSelectChange('aiyl', filters.aiyl.filter(v => v !== id))}>
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Городские поселения */}
                    {filters.urban_settlement.map(id => {
                        const urbanSettlement = directories.urban_settlements.find(u => u.id === id);
                        return urbanSettlement ? (
                            <div key={`urban_settlement-${id}`} className={styles.filterChip}>
                                <span>Городское поселение: {urbanSettlement.name}</span>
                                <button onClick={() => handleCustomMultiSelectChange('urban_settlement', filters.urban_settlement.filter(v => v !== id))}>
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Язык */}
                    {filters.language.map(id => {
                        const language = directories.languages.find(l => l.id === id);
                        return language ? (
                            <div key={`language-${id}`} className={styles.filterChip}>
                                <span>Язык: {language.name_ky || language.name}</span>
                                <button onClick={() => handleCustomMultiSelectChange('language', filters.language.filter(v => v !== id))}>
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Диалекты речи */}
                    {filters.dialects_speech.map(id => {
                        const found = findItemInHierarchy(directories.dialects_speech, id);
                        return found ? (
                            <div key={`dialects_speech-${id}`} className={styles.filterChip}>
                                <span>Диалект: {(() => {
                                    const name = found.name_ky || found.name_ru || found.name_en || found.name || found.title;
                                    if (found.parent) {
                                        const parentName = found.parent.name_ky || found.parent.name_ru || found.parent.name_en || found.parent.name || found.parent.title;
                                        return `${parentName} → ${name}`;
                                    }
                                    return name;
                                })()}</span>
                                <button onClick={() => handleCustomMultiSelectChange('dialects_speech', filters.dialects_speech.filter(v => v !== id))}>
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Направления */}
                    {filters.directions.map(id => {
                        const found = findItemInHierarchy(directories.directions, id);
                        return found ? (
                            <div key={`directions-${id}`} className={styles.filterChip}>
                                <span>Направление: {(() => {
                                    const name = found.name_ky || found.name_ru || found.name_en || found.name || found.title;
                                    if (found.parent) {
                                        const parentName = found.parent.name_ky || found.parent.name_ru || found.parent.name_en || found.parent.name || found.parent.title;
                                        return `${parentName} → ${name}`;
                                    }
                                    return name;
                                })()}</span>
                                <button onClick={() => handleCustomMultiSelectChange('directions', filters.directions.filter(v => v !== id))}>
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Термины топонимов */}
                    {filters.terms_topomyns.map(id => {
                        const found = findItemInHierarchy(directories.terms_topomyns, id);
                        return found ? (
                            <div key={`terms_topomyns-${id}`} className={styles.filterChip}>
                                <span>Термин: {(() => {
                                    const name = found.name_ky || found.name_ru || found.name_en || found.name || found.title;
                                    if (found.parent) {
                                        const parentName = found.parent.name_ky || found.parent.name_ru || found.parent.name_en || found.parent.name || found.parent.title;
                                        return `${parentName} → ${name}`;
                                    }
                                    return name;
                                })()}</span>
                                <button onClick={() => handleCustomMultiSelectChange('terms_topomyns', filters.terms_topomyns.filter(v => v !== id))}>
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Типы топонимов */}
                    {filters.toponyms_typs.map(id => {
                        const found = findItemInHierarchy(directories.toponyms_typs, id);
                        return found ? (
                            <div key={`toponyms_typs-${id}`} className={styles.filterChip}>
                                <span>Тип: {(() => {
                                    const name = found.name_ky || found.name_ru || found.name_en || found.name || found.title;
                                    if (found.parent) {
                                        const parentName = found.parent.name_ky || found.parent.name_ru || found.parent.name_en || found.parent.name || found.parent.title;
                                        return `${parentName} → ${name}`;
                                    }
                                    return name;
                                })()}</span>
                                <button onClick={() => handleCustomMultiSelectChange('toponyms_typs', filters.toponyms_typs.filter(v => v !== id))}>
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Пласт */}
                    {filters.plast.map(id => {
                        const plastItem = directories.plast.find(p => p.id === id);
                        return plastItem ? (
                            <div key={`plast-${id}`} className={styles.filterChip}>
                                <span>Пласт: {plastItem.name_ky || plastItem.name_ru || plastItem.name || plastItem.title}</span>
                                <button onClick={() => handleCustomMultiSelectChange('plast', filters.plast.filter(v => v !== id))}>
                                    ×
                                </button>
                            </div>
                        ) : null;
                    })}

                    {/* Поиск */}
                    {filters.search && (
                        <div className={styles.filterChip}>
                            <span>Поиск: "{filters.search}"</span>
                            <button onClick={() => handleInputChange('search', '')}>
                                ×
                            </button>
                        </div>
                    )}

                    {/* Алфавит */}
                    {filters.startswith && (
                        <div className={styles.filterChip}>
                            <span>Начинается с: "{filters.startswith.toUpperCase()}"</span>
                            <button onClick={() => handleInputChange('startswith', '')}>
                                ×
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

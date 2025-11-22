'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './FilterPanel.module.scss';

export default function FilterForm({ locale, directories }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const [openFilters, setOpenFilters] = useState({
        territories: false,
        other: false
    });
    
    // Инициализация состояния из searchParams
    const [filters, setFilters] = useState({
        search: '',
        startswith: '',
        language: '',
        region: [],
        district: [],
        city: [],
        aiyl: [],
        aiyl_aimak: [],
        special_territory: [],
        plast: [],
        ordering: '',
        limit: '50',
        offset: '0'
    });

    // Алфавитная панель кириллица + латиница
    const alphabetCyrillic = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Э', 'Ю', 'Я'];
    const alphabetLatin = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    // Подсчет активных фильтров
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.search) count++;
        if (filters.startswith) count++;
        if (filters.language) count++;
        if (filters.ordering && filters.ordering !== '') count++;
        
        // Подсчет массивов
        ['region', 'district', 'city', 'aiyl', 'aiyl_aimak', 'special_territory', 'plast'].forEach(key => {
            count += filters[key].length;
        });
        
        return count;
    };

    // Получение выбранных фильтров для отображения в виде чипов
    const getSelectedFilterChips = () => {
        const chips = [];
        
        if (filters.search) {
            chips.push({ type: 'search', label: `Поиск: "${filters.search}"`, value: filters.search });
        }
        
        if (filters.startswith) {
            chips.push({ type: 'startswith', label: `Начинается с: "${filters.startswith}"`, value: filters.startswith });
        }
        
        if (filters.language) {
            const language = directories?.languages?.find(l => l.id == filters.language);
            chips.push({ type: 'language', label: `Язык: ${language?.name || filters.language}`, value: filters.language });
        }
        
        // Обработка массивов
        const arrayFilters = {
            region: { name: 'Регион', data: directories?.regions },
            district: { name: 'Район', data: directories?.districts },
            city: { name: 'Город', data: directories?.cities },
            aiyl: { name: 'Айыл', data: directories?.aiyls },
            aiyl_aimak: { name: 'Айыл айымак', data: directories?.aiyl_aimaks },
            special_territory: { name: 'Спец. территория', data: directories?.special_territories },
            plast: { name: 'Пласт', data: directories?.plasts }
        };
        
        Object.entries(arrayFilters).forEach(([key, config]) => {
            filters[key].forEach(id => {
                const item = config.data?.find(item => item.id === id);
                if (item) {
                    chips.push({ 
                        type: key, 
                        label: `${config.name}: ${item.name}`, 
                        value: id 
                    });
                }
            });
        });
        
        return chips;
    };

    // Удаление чипа
    const removeFilterChip = (chip) => {
        if (['search', 'startswith', 'language', 'ordering'].includes(chip.type)) {
            handleInputChange(chip.type, '');
        } else {
            // Для массивов
            const newValues = filters[chip.type].filter(v => v !== chip.value);
            const newFilters = { ...filters, [chip.type]: newValues };
            setFilters(newFilters);
            updateURL(newFilters);
        }
    };

    // Переключение алфавитного фильтра
    const handleAlphabetClick = (letter) => {
        const newStartswith = filters.startswith === letter.toLowerCase() ? '' : letter.toLowerCase();
        handleInputChange('startswith', newStartswith);
    };

    // Переключение открытия/закрытия группы фильтров
    const toggleFilterGroup = (groupName) => {
        setOpenFilters(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    // Открыть все фильтры
    const openAllFilters = () => {
        setOpenFilters({
            territories: true,
            other: true
        });
    };
    // Обновляем фильтры когда изменяются searchParams
    useEffect(() => {
        setFilters({
            search: searchParams.get('search') || '',
            startswith: searchParams.get('startswith') || '',
            language: searchParams.get('language') || '',
            region: searchParams.getAll('region').map(Number),
            district: searchParams.getAll('district').map(Number),
            city: searchParams.getAll('city').map(Number),
            aiyl: searchParams.getAll('aiyl').map(Number),
            aiyl_aimak: searchParams.getAll('aiyl_aimak').map(Number),
            special_territory: searchParams.getAll('special_territory').map(Number),
            plast: searchParams.getAll('plast').map(Number),
            ordering: searchParams.get('ordering') || '',
            limit: searchParams.get('limit') || '50',
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

    const clearFilters = () => {
        const clearedFilters = {
            search: '',
            startswith: '',
            language: '',
            region: [],
            district: [],
            city: [],
            aiyl: [],
            aiyl_aimak: [],
            special_territory: [],
            plast: [],
            ordering: '',
            limit: '50',
            offset: '0'
        };
        setFilters(clearedFilters);
        updateURL(clearedFilters);
    };

    const activeFiltersCount = getActiveFiltersCount();
    const selectedChips = getSelectedFilterChips();

    return (
        <>
            <button 
                className={styles.filterToggle}
                onClick={() => setIsOpen(!isOpen)}
            >
                Фильтры {activeFiltersCount > 0 && <span className={styles.filterCount}>({activeFiltersCount})</span>}
            </button>
            
            <div className={`${styles.filterPanel} ${isOpen ? styles.open : ''}`}>
                <div className={styles.filterHeader}>
                    <h3>Фильтры</h3>
                    <div className={styles.headerButtons}>
                        <button onClick={clearFilters} className={styles.clearButton}>
                            Очистить все
                        </button>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className={styles.closeButton}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Счетчик и настройки */}
                {activeFiltersCount > 0 && (
                    <div className={styles.filterStats}>
                        <span>Применено фильтров: {activeFiltersCount}</span>
                        <button onClick={openAllFilters} className={styles.openAllButton}>
                            Открыть все фильтры
                        </button>
                    </div>
                )}

                {/* Выбранные фильтры (чипы) */}
                {selectedChips.length > 0 && (
                    <div className={styles.selectedFilters}>
                        <div className={styles.selectedFiltersTitle}>Выбранные фильтры:</div>
                        <div className={styles.chipContainer}>
                            {selectedChips.map((chip, index) => (
                                <div key={index} className={styles.filterChip}>
                                    <span>{chip.label}</span>
                                    <button 
                                        onClick={() => removeFilterChip(chip)}
                                        className={styles.chipRemove}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Алфавитная панель */}
                <div className={styles.alphabetPanel}>
                    <div className={styles.alphabetTitle}>Алфавитный указатель:</div>
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

                {/* Поиск */}
                <div className={styles.filterGroup}>
                    <label>Поиск топонима:</label>
                    <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleInputChange('search', e.target.value)}
                        placeholder="Введите название..."
                    />
                </div>

                {/* Язык */}
                <div className={styles.filterGroup}>
                    <label>Язык:</label>
                    <select
                        value={filters.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                    >
                        <option value="">Все языки</option>
                        {(directories?.languages || []).map((language) => (
                            <option key={language.id} value={language.id}>
                                {language.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Территориальные фильтры */}
                <div className={styles.filterSection}>
                    <div className={styles.filterSectionHeader} onClick={() => toggleFilterGroup('territories')}>
                        <span>Территориальные фильтры</span>
                        <span className={`${styles.arrow} ${openFilters.territories ? styles.open : ''}`}>▼</span>
                    </div>
                    
                    {openFilters.territories && (
                        <div className={styles.filterSectionContent}>
                            <div className={styles.filterGroup}>
                                <label>Регионы:</label>
                                <div className={styles.checkboxGroup}>
                                    {(directories?.regions || []).map((region) => (
                                        <label key={region.id} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={filters.region.includes(region.id)}
                                                onChange={(e) => handleMultiSelectChange('region', region.id, e.target.checked)}
                                            />
                                            {region.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Районы:</label>
                                <div className={styles.checkboxGroup}>
                                    {(directories?.districts || []).map((district) => (
                                        <label key={district.id} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={filters.district.includes(district.id)}
                                                onChange={(e) => handleMultiSelectChange('district', district.id, e.target.checked)}
                                            />
                                            {district.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Города:</label>
                                <div className={styles.checkboxGroup}>
                                    {(directories?.cities || []).map((city) => (
                                        <label key={city.id} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={filters.city.includes(city.id)}
                                                onChange={(e) => handleMultiSelectChange('city', city.id, e.target.checked)}
                                            />
                                            {city.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Айылы:</label>
                                <div className={styles.checkboxGroup}>
                                    {(directories?.aiyls || []).map((aiyl) => (
                                        <label key={aiyl.id} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={filters.aiyl.includes(aiyl.id)}
                                                onChange={(e) => handleMultiSelectChange('aiyl', aiyl.id, e.target.checked)}
                                            />
                                            {aiyl.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Айыл айымаки:</label>
                                <div className={styles.checkboxGroup}>
                                    {(directories?.aiyl_aimaks || []).map((aimak) => (
                                        <label key={aimak.id} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={filters.aiyl_aimak.includes(aimak.id)}
                                                onChange={(e) => handleMultiSelectChange('aiyl_aimak', aimak.id, e.target.checked)}
                                            />
                                            {aimak.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Специальные территории:</label>
                                <div className={styles.checkboxGroup}>
                                    {(directories?.special_territories || []).map((territory) => (
                                        <label key={territory.id} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={filters.special_territory.includes(territory.id)}
                                                onChange={(e) => handleMultiSelectChange('special_territory', territory.id, e.target.checked)}
                                            />
                                            {territory.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Другие фильтры */}
                <div className={styles.filterSection}>
                    <div className={styles.filterSectionHeader} onClick={() => toggleFilterGroup('other')}>
                        <span>Дополнительные фильтры</span>
                        <span className={`${styles.arrow} ${openFilters.other ? styles.open : ''}`}>▼</span>
                    </div>
                    
                    {openFilters.other && (
                        <div className={styles.filterSectionContent}>
                            <div className={styles.filterGroup}>
                                <label>Пласты:</label>
                                <div className={styles.checkboxGroup}>
                                    {(directories?.plasts || []).map((plast) => (
                                        <label key={plast.id} className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={filters.plast.includes(plast.id)}
                                                onChange={(e) => handleMultiSelectChange('plast', plast.id, e.target.checked)}
                                            />
                                            {plast.name}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Сортировка:</label>
                                <select
                                    value={filters.ordering}
                                    onChange={(e) => handleInputChange('ordering', e.target.value)}
                                >
                                    <option value="">По умолчанию</option>
                                    <option value="name">По названию (А-Я)</option>
                                    <option value="-name">По названию (Я-А)</option>
                                    <option value="created_at">По дате создания (старые)</option>
                                    <option value="-created_at">По дате создания (новые)</option>
                                </select>
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Количество на странице:</label>
                                <select
                                    value={filters.limit}
                                    onChange={(e) => handleInputChange('limit', e.target.value)}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './SimpleCustomSelect.module.scss';

export default function SimpleCustomSelect({
    options = [],
    selectedValues = [],
    onChange,
    placeholder = "Выберите опции",
    className = "",
    getOptionLabel = null,
    getOptionValue = null,
    multiSelect = true,

    searchableThreshold = 100,
    forceSearch = false,
    searchInputPlaceholder = 'Поиск...',
    remoteMode = false,
    onQueryChange,
    loading = false,
    emptyHint = 'Начните ввод для поиска'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [query, setQuery] = useState('');

    const isInlineSearch = remoteMode && forceSearch;
    const [inlineOpen, setInlineOpen] = useState(false);

    const t = useTranslations('filters.group')

    const defaultGetOptionLabel = (option) => {
        return option.name_ky || option.name_ru || option.name_en || option.name || option.title || option.toString();
    };

    const defaultGetOptionValue = (option) => {
        return option.id || option.value || option;
    };

    const optionLabel = getOptionLabel || defaultGetOptionLabel;
    const optionValue = getOptionValue || defaultGetOptionValue;

    const onQueryChangeRef = useRef(onQueryChange);
    useEffect(() => {
        onQueryChangeRef.current = onQueryChange;
    }, [onQueryChange]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setInlineOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filterTree = (items, q) => {
        if (!q) return items;
        const needle = q.trim().toLowerCase();
        const walk = (arr) => {
            const out = [];
            for (const node of arr || []) {
                const label = (optionLabel(node) || '').toString().toLowerCase();
                const kids = node.children ? walk(node.children) : [];
                if (label.includes(needle) || kids.length > 0) {
                    out.push(kids.length ? { ...node, children: kids } : node);
                }
            }
            return out;
        };
        return walk(items);
    };

    const flattenIds = (items) => {
        const acc = [];
        const walk = (arr) => {
            for (const node of arr || []) {
                acc.push(optionValue(node));
                if (node.children?.length) walk(node.children);
            }
        };
        walk(items);
        return acc;
    };

    const showSearch = forceSearch || remoteMode || (options?.length || 0) > searchableThreshold;

    const filteredTree = useMemo(
        () => (remoteMode ? options : filterTree(options, query)),
        [options, query, remoteMode]
    );
    const filteredIds = useMemo(() => flattenIds(filteredTree), [filteredTree]);

    useEffect(() => {
        if (!remoteMode || (!isOpen && !isInlineSearch)) return;
        const q = query.trim();
        const h = setTimeout(() => {
            onQueryChangeRef.current?.(q.length >= 2 ? q : '');
        }, 300);
        return () => clearTimeout(h);
    }, [query, remoteMode, isOpen, isInlineSearch]); // ★

    const renderOptionsRecursive = (items, level = 0) => {
        return items.map(option => {
            const value = optionValue(option);
            const label = optionLabel(option);
            const isSelected = selectedValues.includes(value);
            const hasChildren = option.children && option.children.length > 0;

            return (
                <div key={value} className={styles.optionGroup}>
                    <label
                        className={`${styles.option} ${level > 0 ? styles.childOption : ''}`}
                        style={{ paddingLeft: `${level * 20 + 12}px` }}
                    >
                        <input
                            type={multiSelect ? "checkbox" : "radio"}
                            checked={isSelected}
                            onChange={(e) => handleOptionChange(value, e.target.checked)}
                            className={styles.checkbox}
                            name={multiSelect ? undefined : "single-select"}
                        />
                        <span className={styles.optionLabel}>
                            {label}
                        </span>
                    </label>
                    {hasChildren && renderOptionsRecursive(option.children, level + 1)}
                </div>
            );
        });
    };

    const handleOptionChange = (value, isChecked) => {
        let newSelectedValues;

        if (multiSelect) {
            if (isChecked) {
                newSelectedValues = [...selectedValues, value];
            } else {
                newSelectedValues = selectedValues.filter(v => v !== value);
            }
        } else {
            newSelectedValues = isChecked ? [value] : [];
            setIsOpen(false);
            setInlineOpen(false);
        }

        onChange(newSelectedValues);
    };

    const handleToggleDropdown = () => {
        if (isInlineSearch) return;
        setIsOpen((v) => !v);
    };

    const handleSelectAllFiltered = () => {
        const set = new Set([...selectedValues, ...filteredIds]);
        onChange(Array.from(set));
    };

    const handleClearFiltered = () => {
        const set = new Set(filteredIds);
        onChange(selectedValues.filter((v) => !set.has(v)));
    };

    const getDisplayText = () => {
        if (selectedValues.length === 1) {
            const findById = (arr, id) => {
                for (const n of arr || []) {
                    if (optionValue(n) === id) return n;
                    if (n.children?.length) {
                        const f = findById(n.children, id);
                        if (f) return f;
                    }
                }
                return null;
            };
            const selectedNode = findById(options, selectedValues[0]);
            return selectedNode ? optionLabel(selectedNode) : selectedValues[0];
        }
        if (selectedValues.length > 1) {
            return `${t('choosed')}: ${selectedValues.length}`;
        }
        return '';
    };

    return (
        <div
            className={`${styles.simpleCustomSelect} ${className} ${inlineOpen ? styles.inlineOpen : ''}`}
            ref={dropdownRef}
        >
            <span className={styles.SimpleCustomSelectPlaceholder}>{placeholder}</span>

            {isInlineSearch ? (
                <>
                    {showSearch && (
                        <div className={styles.searchRow}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                value={query}
                                onChange={(e) => {
                                    const q = e.target.value;
                                    setQuery(e.target.value);
                                    const hasText = q.trim().length >= 1;
                                    setInlineOpen(hasText);
                                }}
                                onBlur={() => {
                                }}
                                placeholder={''}
                                id="scs-search"
                                name="scs-search"
                                autoComplete="off"
                                spellCheck={false}
                                aria-label="Поиск по опциям"
                            />
                        </div>
                    )}

                    {/* ★ абсолютная выпадашка, не двигает сетку */}
                    {inlineOpen && query.trim().length >= 1 && (
                        <div className={styles.dropdown}>
                            <div className={styles.optionsList}>
                                {loading ? (
                                    <div className={styles.noOptions}>Загрузка…</div>
                                ) : filteredTree.length > 0 ? (
                                    renderOptionsRecursive(filteredTree)
                                ) : (
                                    query.trim().length > 0 ? (
                                        <div className={styles.noOptions}>Ничего не найдено</div>
                                    ) : null
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div
                        className={`${styles.selectButton} ${isOpen ? styles.open : ''}`}
                        onClick={handleToggleDropdown}
                    >
                        <span className={styles.selectText}>
                            {getDisplayText()}
                        </span>
                        <span className={`${styles.arrow} ${isOpen ? styles.up : styles.down}`}>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.00065 3.5026L8.25065 0.252604C8.40343 0.0998263 8.59787 0.0234375 8.83398 0.0234375C9.0701 0.0234375 9.26454 0.0998264 9.41732 0.252604C9.5701 0.405382 9.64648 0.599826 9.64648 0.835938C9.64648 1.07205 9.5701 1.26649 9.41732 1.41927L5.58398 5.2526C5.50065 5.33594 5.41037 5.39497 5.31315 5.42969C5.21593 5.46441 5.11176 5.48177 5.00065 5.48177C4.88954 5.48177 4.78537 5.46441 4.68815 5.42969C4.59093 5.39497 4.50065 5.33594 4.41732 5.2526L0.583984 1.41927C0.431207 1.26649 0.354817 1.07205 0.354817 0.835937C0.354817 0.599826 0.431207 0.405382 0.583984 0.252604C0.736762 0.099826 0.931207 0.0234371 1.16732 0.0234371C1.40343 0.0234371 1.59787 0.099826 1.75065 0.252604L5.00065 3.5026Z" fill="#646464" />
                            </svg>
                        </span>
                    </div>

                    {isOpen && (
                        <div className={styles.dropdown}>
                            {showSearch && (
                                <div className={styles.searchRow}>
                                    <input
                                        type="text"
                                        className={styles.searchInput}
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder={searchInputPlaceholder}
                                        id="scs-search"
                                        name="scs-search"
                                        autoComplete="off"
                                        spellCheck={false}
                                        aria-label="Поиск по опциям"
                                    />
                                    <div className={styles.searchActions}>
                                        <button type="button" className={styles.btn} onClick={handleSelectAllFiltered}>
                                            Выбрать всё
                                        </button>
                                        <button type="button" className={styles.btnAlt} onClick={handleClearFiltered}>
                                            Очистить
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className={styles.optionsList}>
                                {remoteMode && !query.trim() ? (
                                    <div className={styles.noOptions}>{emptyHint}</div>
                                ) : loading ? (
                                    <div className={styles.noOptions}>Загрузка…</div>
                                ) : filteredTree.length > 0 ? (
                                    renderOptionsRecursive(filteredTree)
                                ) : (
                                    <div className={styles.noOptions}>Ничего не найдено</div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

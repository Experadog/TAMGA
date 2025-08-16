'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './CustomMultiSelect.module.scss';

export default function CustomMultiSelect({ 
    options = [], 
    selectedValues = [], 
    onChange, 
    placeholder = "Выберите опции",
    className = "",
    renderOption = null,
    getOptionLabel = null,
    getOptionValue = null
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Дефолтные функции для получения значений
    const defaultGetOptionLabel = (option) => {
        return option.name_ky || option.name_ru || option.name_en || option.name || option.title || option.toString();
    };

    const defaultGetOptionValue = (option) => {
        return option.id || option.value || option;
    };

    const optionLabel = getOptionLabel || defaultGetOptionLabel;
    const optionValue = getOptionValue || defaultGetOptionValue;

    // Закрытие при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Фильтрация опций по поисковому запросу
    const filteredOptions = options.filter(option => {
        const label = optionLabel(option).toLowerCase();
        return label.includes(searchTerm.toLowerCase());
    });

    // Рекурсивная функция для рендеринга опций с поддержкой иерархии
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
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleOptionChange(value, e.target.checked)}
                            className={styles.checkbox}
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
        
        if (isChecked) {
            newSelectedValues = [...selectedValues, value];
        } else {
            newSelectedValues = selectedValues.filter(v => v !== value);
        }
        
        onChange(newSelectedValues);
    };

    const handleToggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchTerm('');
        }
    };

    const getDisplayText = () => {
        if (selectedValues.length === 0) {
            return placeholder;
        }
        
        if (selectedValues.length === 1) {
            const selectedOption = options.find(opt => optionValue(opt) === selectedValues[0]) ||
                options.flatMap(opt => opt.children || []).find(opt => optionValue(opt) === selectedValues[0]);
            return selectedOption ? optionLabel(selectedOption) : selectedValues[0];
        }
        
        return `Выбрано: ${selectedValues.length}`;
    };

    const clearAll = (e) => {
        e.stopPropagation();
        onChange([]);
    };

    return (
        <div className={`${styles.customMultiSelect} ${className}`} ref={dropdownRef}>
            <div 
                className={`${styles.selectButton} ${isOpen ? styles.open : ''}`}
                onClick={handleToggleDropdown}
            >
                <span className={styles.selectText}>
                    {getDisplayText()}
                </span>
                <div className={styles.selectActions}>
                    {selectedValues.length > 0 && (
                        <button 
                            className={styles.clearButton}
                            onClick={clearAll}
                            type="button"
                        >
                            ×
                        </button>
                    )}
                    <span className={`${styles.arrow} ${isOpen ? styles.up : styles.down}`}>
                        ▼
                    </span>
                </div>
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Поиск..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    
                    <div className={styles.optionsList}>
                        {filteredOptions.length > 0 ? (
                            renderOptionsRecursive(filteredOptions)
                        ) : (
                            <div className={styles.noOptions}>
                                Опции не найдены
                            </div>
                        )}
                    </div>
                    
                    {selectedValues.length > 0 && (
                        <div className={styles.dropdownFooter}>
                            <button 
                                className={styles.clearAllButton}
                                onClick={clearAll}
                                type="button"
                            >
                                Очистить все
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

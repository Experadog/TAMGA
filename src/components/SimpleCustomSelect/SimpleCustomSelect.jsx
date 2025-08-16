'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './SimpleCustomSelect.module.scss';

export default function SimpleCustomSelect({ 
    options = [], 
    selectedValues = [], 
    onChange, 
    placeholder = "Выберите опции",
    className = "",
    getOptionLabel = null,
    getOptionValue = null,
    multiSelect = true
}) {
    const [isOpen, setIsOpen] = useState(false);
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
                            type={multiSelect ? "checkbox" : "radio"}
                            checked={isSelected}
                            onChange={(e) => handleOptionChange(value, e.target.checked)}
                            className={styles.checkbox}
                            name={multiSelect ? undefined : "single-select"}
                        />
                        <span className={styles.optionLabel}>
                            {level > 0 && '— '}
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
            // Для одиночного выбора
            newSelectedValues = isChecked ? [value] : [];
            setIsOpen(false); // Закрываем dropdown после выбора
        }
        
        onChange(newSelectedValues);
    };

    const handleToggleDropdown = () => {
        setIsOpen(!isOpen);
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

    return (
        <div className={`${styles.simpleCustomSelect} ${className}`} ref={dropdownRef}>
            <div 
                className={`${styles.selectButton} ${isOpen ? styles.open : ''}`}
                onClick={handleToggleDropdown}
            >
                <span className={styles.selectText}>
                    {getDisplayText()}
                </span>
                <span className={`${styles.arrow} ${isOpen ? styles.up : styles.down}`}>
                    ▼
                </span>
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.optionsList}>
                        {options.length > 0 ? (
                            renderOptionsRecursive(options)
                        ) : (
                            <div className={styles.noOptions}>
                                Опции не найдены
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

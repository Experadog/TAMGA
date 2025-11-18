'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './Pagination.module.scss';

export const Pagination = ({ currentPage = 1, totalPages = 1, totalCount = 0 }) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Добавляем проверки на валидность данных
    if (!totalPages || totalPages <= 1 || !totalCount) return null;

    // Создаем URL с параметром page
    const createPageURL = (pageNumber) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}#results-top`;
    };

    // Вычисляем диапазон отображаемых страниц
    const getPageNumbers = () => {
        const pages = [];
        // const maxVisiblePages = 5;

        // Добавляем проверку на валидность
        if (!totalPages || totalPages <= 0) return [1];

        if (totalPages <= 3) {
            // Если страниц мало, показываем все
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }

        // 1 или 2 страница → 1 2 3
        if (currentPage === 1 || currentPage === 2) {
            pages.push(1, 2, 3);
            return pages;
        }

        // Последняя или предпоследняя → (N-2, N-1, N)
        if (currentPage === totalPages || currentPage === totalPages - 1) {
            pages.push(totalPages - 2, totalPages - 1, totalPages);
            return pages;
        }

        // Всё остальное → (current-1, current, current+1)
        pages.push(currentPage - 1, currentPage, currentPage + 1);

        // else {
        //     // Логика для большого количества страниц
        //     if (currentPage <= 3) {
        //         pages.push(1, 2, 3, '...', totalPages);
        //     } else if (currentPage >= totalPages - 2) {
        //         pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
        //     } else {
        //         pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        //     }
        // }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={styles.pagination}>
            <nav className={styles.pagination__nav}>
                {/* Первая страница */}
                {currentPage > 1 && (
                    <Link
                        href={createPageURL(1)}
                        className={styles.pagination__arrow}
                    >
                        «
                    </Link>
                )}

                {/* Предыдущая страница */}
                {currentPage > 1 && (
                    <Link
                        href={createPageURL(currentPage - 1)}
                        className={styles.pagination__arrow}
                    >
                        ‹
                    </Link>
                )}

                {/* Номера страниц */}
                {pageNumbers.map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className={styles.pagination__ellipsis}>
                            ...
                        </span>
                    ) : (
                        <Link
                            key={page}
                            href={createPageURL(page)}
                            className={`${styles.pagination__page} ${page === currentPage ? styles.pagination__page_active : ''
                                }`}
                            aria-current={page === currentPage ? 'page' : undefined}
                        >
                            {page}
                        </Link>
                    )
                ))}

                {/* Следующая страница */}
                {currentPage < totalPages && (
                    <Link
                        href={createPageURL(currentPage + 1)}
                        className={styles.pagination__arrow}
                    >
                        ›
                    </Link>
                )}

                {/* Последняя страница */}
                {currentPage < totalPages && (
                    <Link
                        href={createPageURL(totalPages)}
                        className={styles.pagination__arrow}
                    >
                        »
                    </Link>
                )}
            </nav>
        </div>
    );
};

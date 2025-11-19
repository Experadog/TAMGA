'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from './Pagination.module.scss';

export const Pagination = ({ currentPage = 1, totalPages = 1, totalCount = 0 }) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    if (!totalPages || totalPages <= 1 || !totalCount) return null;

    const createPageURL = (pageNumber) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}#results-top`;
    };

    const getPageNumbers = () => {
        // защита
        if (!totalPages || totalPages <= 0) return [1];

        // 1) мало страниц → просто 1..N и сразу выходим
        if (totalPages <= 3) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // 2) 1 или 2 страница → 1 2 3
        if (currentPage === 1 || currentPage === 2) {
            return [1, 2, 3];
        }

        // 3) последняя или предпоследняя → N-2 N-1 N
        if (currentPage === totalPages || currentPage === totalPages - 1) {
            return [totalPages - 2, totalPages - 1, totalPages];
        }

        // 4) всё остальное → current-1 current current+1
        return [currentPage - 1, currentPage, currentPage + 1];
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={styles.pagination}>
            <nav className={styles.pagination__nav}>
                {currentPage > 1 && (
                    <Link href={createPageURL(1)} className={styles.pagination__arrow}>
                        «
                    </Link>
                )}

                {currentPage > 1 && (
                    <Link href={createPageURL(currentPage - 1)} className={styles.pagination__arrow}>
                        ‹
                    </Link>
                )}

                {pageNumbers.map((page, index) =>
                    page === '...' ? (
                        <span
                            key={`ellipsis-${index}`}
                            className={styles.pagination__ellipsis}
                        >
                            ...
                        </span>
                    ) : (
                        <Link
                            key={`page-${page}`} // можно оставить просто page, теперь он уникален
                            href={createPageURL(page)}
                            className={`${styles.pagination__page} ${page === currentPage ? styles.pagination__page_active : ''
                                }`}
                            aria-current={page === currentPage ? 'page' : undefined}
                        >
                            {page}
                        </Link>
                    )
                )}

                {currentPage < totalPages && (
                    <Link
                        href={createPageURL(currentPage + 1)}
                        className={styles.pagination__arrow}
                    >
                        ›
                    </Link>
                )}

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
import styles from './ResultsInfo.module.scss';

export default function ResultsInfo({ 
    count, 
    currentPage, 
    limit, 
    onPageChange,
    loading 
}) {
    const totalPages = Math.ceil(count / limit);
    const startIndex = (currentPage - 1) * limit + 1;
    const endIndex = Math.min(currentPage * limit, count);

    const generatePageNumbers = () => {
        const pages = [];
        const showPages = 5; // Количество страниц для отображения
        
        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
        let endPage = Math.min(totalPages, startPage + showPages - 1);
        
        // Корректировка если недостаточно страниц справа
        if (endPage - startPage + 1 < showPages) {
            startPage = Math.max(1, endPage - showPages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        return pages;
    };

    if (loading) {
        return (
            <div className={styles.resultsInfo}>
                <div className={styles.loading}>Загрузка топонимов...</div>
            </div>
        );
    }

    if (count === 0) {
        return (
            <div className={styles.resultsInfo}>
                <div className={styles.noResults}>
                    Топонимы не найдены. Попробуйте изменить фильтры.
                </div>
            </div>
        );
    }

    return (
        <div className={styles.resultsInfo}>
            <div className={styles.statsRow}>
                <div className={styles.resultsCount}>
                    Найдено топонимов: <strong>{count}</strong>
                    {count > limit && (
                        <span className={styles.pageInfo}>
                            (показано {startIndex}-{endIndex})
                        </span>
                    )}
                </div>
                
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button 
                            className={styles.pageButton}
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                        >
                            ««
                        </button>
                        
                        <button 
                            className={styles.pageButton}
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            «
                        </button>
                        
                        {generatePageNumbers().map(page => (
                            <button
                                key={page}
                                className={`${styles.pageButton} ${
                                    page === currentPage ? styles.active : ''
                                }`}
                                onClick={() => onPageChange(page)}
                            >
                                {page}
                            </button>
                        ))}
                        
                        <button 
                            className={styles.pageButton}
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            »
                        </button>
                        
                        <button 
                            className={styles.pageButton}
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            »»
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

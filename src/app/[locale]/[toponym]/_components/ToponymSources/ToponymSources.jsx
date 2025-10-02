import fileIcon from '@/assets/icons/file.svg';
import { getLocalizedValue } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ToponymSources.module.scss';

export const ToponymSources = ({ etymologies, locale }) => {
    // Проверяем есть ли хотя бы один источник
    const hasSources = etymologies?.length > 0 && etymologies.some(etymology =>
        etymology.dictionaries?.some(dict => dict.sources?.length > 0)
    );

    if (!hasSources) return null;

    return (
        <>
            {etymologies.map((etymology, index) => {
                const { dictionaries } = etymology;

                if (!dictionaries?.length) return null;

                return (
                    <div key={index} className={styles.toponymSourseces}>
                        {dictionaries.map((dict, dictIndex) => {
                            const { sources } = dict;
                            if (!sources?.length) return null;
                            const groupId = `source-${dict.id}-${dictIndex}`;

                            return (
                                <div
                                    key={dictIndex}
                                    className={styles.toponymSourseces__dictionaries}
                                    id={groupId}
                                    tabIndex={-1}
                                >
                                    {sources?.length > 0 && (
                                        <div className={styles.toponymSourseces__dictionariesItem}>
                                            {sources.map((source, sourceIndex) => {
                                                const itemId = `source-${dict.id}-${dictIndex}-${sourceIndex}`;
                                                return (
                                                    <div id={itemId} key={sourceIndex} className={styles.toponymSourseces__source}>
                                                        {source?.file ? (
                                                            <Link className={styles.toponymSourseces__sourceLink} href={source?.file} target="_blank" rel="noopener noreferrer">
                                                                <div className={styles.toponymSourseces__sourceFile}>
                                                                    <Image className={styles.toponymSourseces__sourceFileIcon} src={fileIcon} alt="" width={30} height={40} />
                                                                    {source.format_file && (
                                                                        <span className={`${styles.toponymSourseces__sourceFileFormat} ${source.format_file}`}>{source.format_file}</span>
                                                                    )}
                                                                </div>
                                                                <span data-highlight-text className={styles.sourceTextOnly}>
                                                                    {source.source?.name &&
                                                                        `${source.source?.name}, ${getLocalizedValue(source, 'name', locale)}`
                                                                    }
                                                                </span>
                                                            </Link>
                                                        ) : (
                                                            <div className={styles.toponymSourseces__sourceText}>
                                                                <div className={styles.toponymSourseces__sourceFileContainer}>
                                                                    <Image className={styles.toponymSourseces__sourceFileIcon} src={fileIcon} alt="" width={30} height={40} />
                                                                </div>
                                                                <span data-highlight-text className={styles.sourceTextOnly}>
                                                                    {getLocalizedValue(source, 'name', locale)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </>
    );
};

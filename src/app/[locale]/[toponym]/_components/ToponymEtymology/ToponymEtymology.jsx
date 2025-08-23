import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getLocalizedValue } from '@/lib/utils';
import arrowIcon from '@/assets/icons/arrow.svg';
import styles from './ToponymEtymology.module.scss';

export const ToponymEtymology = ({ etymologies, locale, l }) => {
    if (!etymologies?.length) return null;

    return (
        <>
            {etymologies.map((etymology, index) => {
                const description = getLocalizedValue(etymology, 'description', locale);
                const name = getLocalizedValue(etymology, 'name', locale);

                return (
                    <React.Fragment key={index}>
                        {name && <span className={styles.toponymEtymology__heading}>{name}</span>}
                        {description && <p className={styles.toponymEtymology__desc}>{description}</p>}
                        {etymology?.dictionaries?.length > 0 && (
                            <ul className={styles.toponymEtymology__dictionaries}>
                                {etymology.dictionaries.map((dict, dictIndex) => (
                                    <li className={styles.toponymEtymology__dictionary} key={dictIndex}>
                                        <span className={styles.toponym__label}>{getLocalizedValue(dict?.language, 'name', locale)}</span>
                                        {dict?.transcription && <span className={styles.toponymEtymology__transcription}>[{dict.transcription}]</span>}
                                        {dict?.translations?.length > 0 && (
                                            <ul className={styles.toponymEtymology__translations}>
                                                {dict.translations.map((translation, transIndex) => (
                                                    <li key={transIndex}>
                                                        <span>{getLocalizedValue(translation, 'name', locale)}{transIndex < dict.translations.length - 1 ? ';' : ''}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {dict?.sources?.some(source => getLocalizedValue(source, 'name', locale)) && (
                                            <Link className={styles.toponymEtymology__link} href={`#source-${dict.id}`}>
                                                {l('source')}
                                                <Image className={styles.toponymEtymology__arrow} src={arrowIcon} width='12' height='12' alt='' />
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
};

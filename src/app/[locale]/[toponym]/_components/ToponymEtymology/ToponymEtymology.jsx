import arrowIcon from '@/assets/icons/arrow.svg';
import { cleanHtml, getLocalizedValue } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';
import styles from './ToponymEtymology.module.scss';

export const ToponymEtymology = ({ etymologies, locale, l }) => {
    if (!etymologies?.length) return null;

    return (
        <>
            {etymologies.map((etymology, index) => {
                const description = getLocalizedValue(etymology, 'description', locale);
                const cleanDescription = cleanHtml(description);
                const name = getLocalizedValue(etymology, 'name', locale);

                return (
                    <React.Fragment key={index}>
                        {name && <span className={styles.toponymEtymology__heading}>{name}</span>}
                        {description && <div className={styles.toponymEtymology__desc} dangerouslySetInnerHTML={{ __html: cleanDescription }}></div>}
                        {etymology?.dictionaries?.length > 0 && (
                            <ul className={styles.toponymEtymology__dictionaries}>
                                {etymology.dictionaries.map((dict, dictIndex) => {
                                    const targetId = `source-${dict.id}-${dictIndex}`;
                                    return (
                                        <li className={styles.toponymEtymology__dictionary} key={dictIndex}>

                                            {/* <span className={styles.toponym__label}>{getLocalizedValue(dict?.language, 'name', locale)}</span> */}

                                            {dict?.dialects_speech?.map((dial, dialIndex) => (
                                                <span key={dialIndex} className={`${styles.toponym__label} ${styles.toponym__labelDialect}`}>{getLocalizedValue(dial, 'name', locale)}</span>
                                            ))}
                                            {[...(dict?.languages ?? [])]
                                                .sort((a, b) => {
                                                    const va = Number(a?.order_by);
                                                    const vb = Number(b?.order_by);
                                                    const aa = Number.isFinite(va) ? va : Infinity;
                                                    const bb = Number.isFinite(vb) ? vb : Infinity;
                                                    return aa - bb;
                                                })
                                                .map((lang, langIndex) => {
                                                    const langName = getLocalizedValue(lang, 'name', locale);
                                                    const langDesc = getLocalizedValue(lang, 'description', locale);
                                                    const descId = `lang-desc-${dictIndex}-${langIndex}`;

                                                    return (
                                                        <div
                                                            key={lang?.id ?? `${langIndex}-${lang?.order_by ?? 'x'}`}
                                                            className={styles.langBadge}
                                                            {...(langDesc ? { 'aria-describedby': descId } : {})}
                                                        >
                                                            <span className={styles.toponym__label} tabIndex={langDesc ? 0 : -1}>
                                                                {langName}
                                                            </span>

                                                            {langDesc && (
                                                                <span id={descId} role="tooltip" className={styles.langBadge__tooltip}>
                                                                    {langDesc}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
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
                                                <a
                                                    className={styles.toponymEtymology__link}
                                                    href={`#${targetId}`}
                                                >
                                                    {l('source')}
                                                    <Image className={styles.toponymEtymology__arrow} src={arrowIcon} width='12' height='12' alt='' />
                                                </a>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
};

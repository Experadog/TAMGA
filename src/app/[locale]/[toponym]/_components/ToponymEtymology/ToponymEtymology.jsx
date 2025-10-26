import { cleanHtml, getLocalizedValue } from '@/lib/utils';
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
                        {description && (
                            <div
                                className={styles.toponymEtymology__desc}
                                dangerouslySetInnerHTML={{ __html: cleanDescription }}
                            ></div>
                        )}
                        {etymology?.dictionaries?.length > 0 && (
                            <ul className={styles.toponymEtymology__dictionaries}>
                                {[...(etymology.dictionaries ?? [])]
                                    .sort((d1, d2) => {
                                        const minOrder = (d) => {
                                            const list = d?.languages ?? [];
                                            if (!list.length) return Number.POSITIVE_INFINITY;
                                            return Math.min(
                                                ...list.map((l) => {
                                                    const n = Number(l?.order_by);
                                                    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
                                                })
                                            );
                                        };
                                        return minOrder(d1) - minOrder(d2);
                                    }).map((dict, dictIndex) => {
                                        const targetId = `source-${dict.id}`;
                                        return (
                                            <li className={styles.toponymEtymology__dictionary} key={dictIndex}>
                                                <div className={styles.toponymEtymology__dictionary__elements}>
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
                                                    {[...(dict?.dialects_speech ?? [])]
                                                        // .sort((a, b) => {
                                                        //     const va = Number(a?.order_by);
                                                        //     const vb = Number(b?.order_by);
                                                        //     const aa = Number.isFinite(va) ? va : Infinity;
                                                        //     const bb = Number.isFinite(vb) ? vb : Infinity;
                                                        //     return aa - bb;
                                                        // })
                                                        .map((dial, dialIndex) => {
                                                            const dialName = getLocalizedValue(dial, 'name', locale);
                                                            const dialDesc = getLocalizedValue(dial, 'description', locale);
                                                            const dialId = `dial-desc-${dictIndex}-${dialIndex}`;

                                                            return (
                                                                <div
                                                                    key={dial?.id ?? `${dialIndex}`}
                                                                    className={styles.langBadge}
                                                                    {...(dialDesc ? { 'aria-describedby': dialId } : {})}
                                                                >
                                                                    <span
                                                                        className={`${styles.toponym__label} ${styles.toponym__labelDialect}`}
                                                                        tabIndex={dialDesc ? 0 : -1}
                                                                    >
                                                                        {dialName}
                                                                    </span>

                                                                    {dialDesc && (
                                                                        <span
                                                                            id={dialId}
                                                                            role="tooltip"
                                                                            className={styles.langBadge__tooltip}
                                                                        >
                                                                            {dialDesc}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}

                                                    {dict?.transcription && <span className={styles.toponymEtymology__transcription}>[{dict.transcription}]</span>}
                                                </div>
                                                <div className={styles.toponymEtymology__parent}>
                                                    {dict?.translations?.length > 0 && (
                                                        <ul className={styles.toponymEtymology__translations}>
                                                            {dict.translations.map((translation, transIndex) => (
                                                                <li key={transIndex}>
                                                                    <span className={styles.toponymEtymology__translations__el}>{getLocalizedValue(translation, 'name', locale)}{transIndex < dict.translations.length - 1 ? ';' : ''}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    {Array.isArray(dict?.sources) &&
                                                        dict.sources.some(s => typeof s?.source?.name === 'string' && s.source.name.trim() !== '') && (
                                                            <a className={styles.toponymEtymology__link} href={`#${targetId}`}>
                                                                <span className={styles.toponymEtymology__arrowMask} />
                                                            </a>
                                                        )}
                                                </div>
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

import Image from 'next/image';
import clss from './page.module.scss';

import mapTestImg from '@/assets/images/map-test.png';
import arrowDownImg from '@/assets/icons/arrow.svg';
import fileImg from '@/assets/icons/file.svg';
import { Link } from '@/i18n/navigation';
import AudioPlayer from '@/components/AudioPlayer/AudioPlayer';

export default async function Etymology({ params }) {
    const { id, locale } = params;
    const tranlateSuffix = `name_${locale}`;
    const defaultSuffix = 'name_ky';

    let data = await fetch(`${process.env.API_URL}/etymologies/${id}`)
    let etymologies = await data.json()

    function getFileExtension(url) {
        const pathname = new URL(url).pathname;
        const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
        return match ? match[1].toLowerCase() : null;
    }

    return (
        <div className={`container ${clss.etymology}`}>
            <section className={clss.etymologySection}>
                <section className={clss.etymologyMap}>
                    <Image src={mapTestImg} width='930' height='auto' alt='KG Map Logo' />
                </section>
                <article className={clss.etymologyArticle}>
                    <section className={clss.etymologyArticle__content}>
                        <h1 className={clss.etymologyArticle__heading}>{etymologies[tranlateSuffix] || etymologies[defaultSuffix]}</h1>
                    </section>

                    <section className={clss.etymologyArticle__content}>
                        <h2 className={clss.etymologyArticle__subheading}>Официальные наименования на разных языках</h2>
                        <div className={clss.etymologyArticle__officialNaming}>
                            {etymologies.name_ky && (
                                <span className={clss.etymologyArticle__officalNamingLangContainer}>
                                    <p className={clss.etymologyArticle__officialNamingLang}>Кыргызский</p>
                                    <p className={clss.etymologyArticle__officialNamingTitle}>{etymologies.name_ky}</p>
                                </span>
                            )}
                            {etymologies.name_ru && (
                                <span className={clss.etymologyArticle__officalNamingLangContainer}>
                                    <p className={clss.etymologyArticle__officialNamingLang}>Русский</p>
                                    <p className={clss.etymologyArticle__officialNamingTitle}>{etymologies.name_ru}</p>
                                </span>
                            )}
                            {etymologies.name_en && (
                                <span className={clss.etymologyArticle__officalNamingLangContainer}>
                                    <p className={clss.etymologyArticle__officialNamingLang}>Английский</p>
                                    <p className={clss.etymologyArticle__officialNamingTitle}>{etymologies.name_en}</p>
                                </span>
                            )}
                        </div>
                    </section>

                    <section className={clss.etymologyArticle__content}>
                        <h2 className={clss.etymologyArticle__subheading}>Этимология названия</h2>
                        <p className={clss.etymologyArticle__desc}>{etymologies.description_ky}</p>
                        <span className={clss.etymologyArticle__etymologyNaming}>{etymologies[tranlateSuffix] || etymologies[defaultSuffix]}</span>
                        <div className={clss.etymologyArticle__etymologyContent}>
                            {etymologies.dictionaries.map((el) => (
                                <div className={clss.etymologyArticle__etymologyLangContent}  key={el.id}>
                                    <span className={clss.etymologyArticle__etymologyLang}>{el.language[tranlateSuffix] || el.language[defaultSuffix]}</span>

                                    {el.translations.some(item => item[tranlateSuffix] || item[defaultSuffix]) && (
                                        <span className={clss.etymologyArticle__etymologyMeanings}>
                                            {el.translations
                                            .filter(item => item[tranlateSuffix] || item[defaultSuffix])
                                            .map((item, idx, arr) => (
                                                <p className={clss.etymologyArticle__etymologyMeaning} key={item.id}>
                                                    {item[tranlateSuffix] || item[defaultSuffix]}
                                                    {idx !== arr.length - 1 && ','}
                                                </p>
                                            ))}
                                        </span>
                                    )}

                                    {el.sources && (
                                        <Link
                                            className={clss.etymologyArticle__etymologyLink}
                                            href={`#source-${el.id}`}
                                        >
                                            Источники
                                            <Image src={arrowDownImg} alt='arrow-down' />
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={clss.etymologyArticle__content}>
                        <h2 className={clss.etymologyArticle__subheading}>Произношение</h2>
                        {etymologies.name_ky && <AudioPlayer text={etymologies.name_ky} className={clss.etymologyArticle__audio} />}
                    </section>

                    <section className={clss.etymologyArticle__content}>
                        <h2 className={clss.etymologyArticle__subheading}>Источники</h2>
                        <ul className={clss.etymologyArticle__sourceItems}>
                            {etymologies.dictionaries.map(el =>
                                el.sources?.length > 0 && el.sources.map((source, idx) => (
                                <li className={clss.etymologyArticle__sourceItem} key={`${el.id}-${idx}`} id={`source-${el.id}`}>
                                    <Image src={fileImg} alt='file-icon' />
                                    <span className={clss.etymologyArticle__sourceFormat}>{getFileExtension(source.file)}</span>
                                    <Link className={clss.etymologyArticle__sourceLink} href={source.file} target='_blank'>
                                        {source[tranlateSuffix] || source[defaultSuffix] || 'Источник'}
                                    </Link>
                                </li>
                                ))
                            )}
                        </ul>
                    </section>
                </article>
            </section>
            <aside className={clss.etymologyAside}>
                <section className={clss.etymologyAside__synonyms}>
                    <span className={clss.etymologyAside__heading}>{etymologies.synonyms.length} совподений</span>
                    <ul className={clss.etymologyAside__list}>
                        {etymologies.synonyms.map(synonym => (
                            <li key={synonym.id} className={clss.etymologyAside__item}>
                                {synonym[tranlateSuffix] || synonym[defaultSuffix]}
                            </li>
                        ))}
                    </ul>
                </section>
            </aside>
        </div>
    )
}
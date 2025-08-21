import Link from 'next/link';
import { cleanHtml, getLocalizedValue } from '@/lib/utils';
import clss from './page.module.scss';
import './styles.scss'
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getTranslations } from 'next-intl/server';
export async function fetchData({ post }) {
    try {
        const resp = await fetch(`${process.env.API_URL}/blogs/${post}`)
        const data = await resp.json();
        return data;
    } catch (error) {
        console.error('Error fetching blog data:', error);
        return null;
    }
}


export default async function Blog({ params }) {
    const { locale, post } = params;

    const data = await fetchData({ post });
    if (!data) throw new Error('Post data not found');

    const { image, autors, sources, published_date } = data;

    const b = await getTranslations({ locale, namespace: 'breadcrumbs.blog' });

    const title = getLocalizedValue(data, 'title', locale);
    const content = getLocalizedValue(data, 'content', locale);
    const cleanContent = cleanHtml(content); 

    const breadcrumbsItems = [
        {
            name: b('home'),
            href: `/${locale}/blog`,
            isLink: true
        },
        {
            name: data.autors[0].first_name + ' ' + data.autors[0].last_name,
            href: `/${locale}/map`,
            isLink: true
        },
        {
            name: getLocalizedValue(data, 'title', locale),
            href: null,
            isLink: false
        }
    ];

    return (
        <>
            <Link href={`/${locale}/blog`} className={clss.blogBackLink}>
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.80078 7.00078L6.70078 9.90078C6.88411 10.0841 6.97578 10.3174 6.97578 10.6008C6.97578 10.8841 6.88411 11.1174 6.70078 11.3008C6.51745 11.4841 6.28411 11.5758 6.00078 11.5758C5.71745 11.5758 5.48411 11.4841 5.30078 11.3008L0.700781 6.70078C0.600781 6.60078 0.529948 6.49245 0.488281 6.37578C0.446615 6.25911 0.425781 6.13411 0.425781 6.00078C0.425781 5.86745 0.446615 5.74245 0.488281 5.62578C0.529948 5.50911 0.600781 5.40078 0.700781 5.30078L5.30078 0.700781C5.48411 0.517448 5.71745 0.425781 6.00078 0.425781C6.28411 0.425781 6.51745 0.517448 6.70078 0.700781C6.88411 0.884115 6.97578 1.11745 6.97578 1.40078C6.97578 1.68411 6.88411 1.91745 6.70078 2.10078L3.80078 5.00078H17.0008C17.2841 5.00078 17.5216 5.09661 17.7133 5.28828C17.9049 5.47995 18.0008 5.71745 18.0008 6.00078C18.0008 6.28411 17.9049 6.52161 17.7133 6.71328C17.5216 6.90495 17.2841 7.00078 17.0008 7.00078H3.80078Z" fill="#646464" />
                </svg>
                <span>
                    {b('go-back')}
                </span>
            </Link>
            <Breadcrumbs items={breadcrumbsItems} className={clss.blogBreadcrumbs} />
            <article className={clss.blogPost}>
                <section className={clss.blogPost__section}>
                    {title && <h1 className={clss.blogPost__title}>{title}</h1>}
                    {published_date && 
                        <p className={clss.blogPost__date}>
                            {new Intl.DateTimeFormat('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            }).format(new Date(published_date))}
                        </p>
                    }
                    {autors?.length > 0 && (
                        <div className={clss.blogPost__autors}>
                            <ul className={clss.blogPost__autorsList}>
                                {autors.map((author) => (
                                    <li key={author?.id} className={clss.blogPost__author}>
                                        {author?.image 
                                            ? <img className={clss.blogPost__authorImage} src={author?.image} alt={author?.name} width={56} height={56} /> 
                                            : <div className={clss.blogPost__authorImagePlaceholder}></div>
                                        }

                                        <div className={clss.blogPost__authorInfo}>
                                            <p className={clss.blogPost__authorName}>{author?.first_name} {author?.last_name}</p>
                                            <p className={clss.blogPost__authorRole}>Автор</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                <section className={clss.blogPost__section}>
                    <img className={clss.blogPost__image} src={image} alt='' width={'100%'} height={532} loading='lazy'/>
                </section>

                <section className={clss.blogPost__section}>
                    <div className={clss.blogPost__content} dangerouslySetInnerHTML={{ __html: cleanContent }} />
                </section>

                <section className={clss.blogPost__section}>
                    {sources?.length > 0 && (
                        <>
                            <h4 className={clss.blogPost__sourcesTitle}>Все источники</h4>
                            <ul className={clss.blogPost__sourceList}>
                                {sources.map((source) => (
                                    <li key={source.id}>
                                        <a className={clss.blogPost__sourceLink} href={source?.file && '#'} target='_blank' rel='noopener noreferrer'>
                                            {getLocalizedValue(source, 'name', locale)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </section>

            </article>


            <aside>

            </aside>
        </>
    );
}
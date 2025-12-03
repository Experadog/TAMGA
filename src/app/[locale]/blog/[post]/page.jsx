import avaImgFallback from '@/assets/images/ava-img-fallback.png';
import blogImgFallback from '@/assets/images/blog-img-fallback.png';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import MainForm from '@/components/MainForm/MainForm';
import ToponymCardGrid from '@/components/ToponymCardGrid/ToponymCardGrid';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cleanHtml, formatDate, getLocalizedValue, stripHtmlTags } from '@/lib/utils';
import { fetchOSMData } from '@/lib/utils/fetchOSMData';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import clss from './page.module.scss';
import './styles.scss';

async function fetchData({ post }) {
    try {
        const resp = await fetch(`${process.env.API_URL}/blogs/${post}`)

        if (!resp.ok) {
            if (resp.status === 404) {
                return null;
            }
            throw new Error(`HTTP error! status: ${resp.status}`);
        }

        const data = await resp.json();

        if (!data || !data.id) {
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching blog data:', error);
        return null;
    }
}

async function fetchTopToponyms(slug) {
    try {
        const resp = await fetch(
            `${process.env.API_URL}/blogs/${slug}/top-toponyms/`
        );

        if (!resp.ok) {
            console.error('Error fetching top toponyms:', resp.status);
            return [];
        }

        const json = await resp.json();

        let arr = [];

        if (Array.isArray(json)) arr = json;
        else if (Array.isArray(json.results)) arr = json.results;

        // Ограничиваем до 3
        return arr.slice(0, 3);
    } catch (error) {
        console.error('Error fetching top toponyms:', error);
        return [];
    }
}

async function fetchSimilarBlogs(slug) {
    try {
        const resp = await fetch(
            `${process.env.API_URL}/blogs/${slug}/similar/`
        );

        if (!resp.ok) {
            console.error('Error fetching similar blogs:', resp.status);
            return [];
        }

        const json = await resp.json();

        if (Array.isArray(json)) return json;
        if (Array.isArray(json.results)) return json.results;

        return [];
    } catch (error) {
        console.error('Error fetching similar blogs:', error);
        return [];
    }
}

export async function generateMetadata({ params }) {
    const { locale, post } = await params;

    const data = await fetchData({ post });
    if (!data) { throw new Error('Blog Post data not found') }

    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
    const pathname = `/${locale}/blog/${post}`;
    const absoluteUrl = `${siteUrl}${pathname}`;

    const tMeta = await getTranslations({ locale, namespace: 'blogDetail' });

    const articleName = getLocalizedValue(data, 'title', locale) || '';

    const authorName = data.autors?.[0]
        ? `${data.autors[0].first_name} ${data.autors[0].last_name}`
        : '';


    const title = tMeta('metadata.title', {
        blogDetailName: articleName,
    }) || '';

    const description = tMeta('metadata.description', {
        authorDetailName: authorName,
    }) || '';

    const shareImage = '/openGraph.png';

    return {
        title,
        description,
        metadataBase: new URL(siteUrl),
        alternates: {
            canonical: pathname,
            languages: routing.locales.reduce((acc, loc) => {
                acc[loc] = `/${loc}/blog/${post}`;
                return acc;
            }, {})
        },
        openGraph: {
            type: 'article',
            locale,
            siteName: 'Tamga.kg',
            url: absoluteUrl,
            title,
            description,
            images: [
                {
                    url: shareImage,
                    width: 1200,
                    height: 630,
                    alt: title
                }
            ]
        },

        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [shareImage]
        },

        robots: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1
        }
    };
}


export default async function BlogDetail({ params }) {
    const { locale, post } = await params;
    setRequestLocale(locale);

    const truncateText = (text, maxLength = 120) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    const data = await fetchData({ post });
    // if (!data) throw new Error('Post data not found');
    if (!data) notFound();

    const topToponyms = await fetchTopToponyms(data.slug);
    const blogs = await fetchSimilarBlogs(data.slug);

    const cards = await Promise.all(
        topToponyms.map(async (item) => {
            const isCity = item?.terms_topomyns?.name_en?.toLowerCase() === 'city';
            const osmData = item?.osm_id ? await fetchOSMData(item.osm_id, isCity) : null;
            return { item, osmData };
        })
    );

    const { image, autors, sources, published_date, inspectors } = data;

    const t = await getTranslations({ locale, namespace: 'blog-details' });
    const b = await getTranslations({ locale, namespace: 'breadcrumbs' });
    const l = await getTranslations({ locale, namespace: 'link' });

    const title = getLocalizedValue(data, 'title', locale);
    const content = getLocalizedValue(data, 'content', locale);
    const cleanContent = cleanHtml(content);

    const breadcrumbsItems = [
        {
            name: b('blog.home'),
            href: `/blog`,
            isLink: true
        },
        {
            name: data.autors[0].first_name + ' ' + data.autors[0].last_name,
            href: `/blog/authors/${data.autors[0].slug}`,
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
            <Link href={`/blog`} className={clss.blogBackLink}>
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.80078 7.00078L6.70078 9.90078C6.88411 10.0841 6.97578 10.3174 6.97578 10.6008C6.97578 10.8841 6.88411 11.1174 6.70078 11.3008C6.51745 11.4841 6.28411 11.5758 6.00078 11.5758C5.71745 11.5758 5.48411 11.4841 5.30078 11.3008L0.700781 6.70078C0.600781 6.60078 0.529948 6.49245 0.488281 6.37578C0.446615 6.25911 0.425781 6.13411 0.425781 6.00078C0.425781 5.86745 0.446615 5.74245 0.488281 5.62578C0.529948 5.50911 0.600781 5.40078 0.700781 5.30078L5.30078 0.700781C5.48411 0.517448 5.71745 0.425781 6.00078 0.425781C6.28411 0.425781 6.51745 0.517448 6.70078 0.700781C6.88411 0.884115 6.97578 1.11745 6.97578 1.40078C6.97578 1.68411 6.88411 1.91745 6.70078 2.10078L3.80078 5.00078H17.0008C17.2841 5.00078 17.5216 5.09661 17.7133 5.28828C17.9049 5.47995 18.0008 5.71745 18.0008 6.00078C18.0008 6.28411 17.9049 6.52161 17.7133 6.71328C17.5216 6.90495 17.2841 7.00078 17.0008 7.00078H3.80078Z" fill="#646464" />
                </svg>
                <span>
                    {b('blog.go-back')}
                </span>
            </Link>
            <Breadcrumbs items={breadcrumbsItems} className={clss.blogBreadcrumbs} />
            <div className={clss.blogWrapper}>
                <article className={clss.blogPost}>
                    <section className={clss.blogPost__section}>
                        {title && <h1 className={clss.blogPost__title}>{title}</h1>}
                        {published_date &&
                            <p className={clss.blogPost__date}>
                                {formatDate(published_date, locale)}
                            </p>
                        }
                        {autors?.length > 0 && (
                            <div className={clss.blogPost__autors}>
                                <ul className={clss.blogPost__autorsList}>
                                    {autors.map((author) => (
                                        <Link key={author?.id} href={`/blog/authors/${data.autors[0].slug}`}>
                                            <li className={clss.blogPost__author}>
                                                {author?.avatar
                                                    ? <Image className={clss.blogPost__authorImage} src={author?.avatar} alt={author?.first_name} width={56} height={56} />
                                                    : <Image className={clss.blogPost__authorImage} src={avaImgFallback} alt="Avatar" width={56} height={56} />
                                                }

                                                <div className={clss.blogPost__authorInfo}>
                                                    <p className={clss.blogPost__authorName}>{author?.first_name} {author?.last_name}</p>
                                                    <p className={clss.blogPost__authorRole}>{t('author.heading')}</p>
                                                </div>
                                            </li>
                                        </Link>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>

                    <section className={clss.blogPost__section}>
                        {image &&
                            <Image className={clss.blogPost__image} src={image} alt='' width={930} height={532} loading='lazy' />
                        }
                    </section>

                    <section className={clss.blogPost__section}>
                        {inspectors?.length > 0 && (
                            <div className={clss.blogPost__inspector}>
                                <ul className={clss.blogPost__autorsList}>
                                    {inspectors.map((inspector) => (
                                        <li key={inspector?.id} className={clss.blogPost__author}>
                                            {inspector?.avatar
                                                ? <Image className={clss.blogPost__authorImage} src={inspector?.avatar} alt={inspector?.first_name} width={56} height={56} />
                                                : <Image className={clss.blogPost__authorImage} src={avaImgFallback} alt="Avatar" width={56} height={56} />
                                            }

                                            <div className={clss.blogPost__authorInfo}>
                                                <p className={clss.blogPost__authorName}>{inspector?.first_name} {inspector?.last_name}</p>
                                                <p className={clss.blogPost__authorRole}>{t('inspector.heading')}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>

                    <section className={clss.blogPost__section}>
                        <div className={`${clss.blogPost__content} htmlContent`} dangerouslySetInnerHTML={{ __html: cleanContent }} />
                    </section>

                    <section className={clss.blogPost__section}>
                        {sources?.length > 0 && (
                            <>
                                <h4 className={clss.blogPost__sourcesTitle}>{t('sources.heading')}</h4>
                                <ul className={clss.blogPost__sourceList}>
                                    {sources.map((source) => (
                                        <li key={source.id}>
                                            <a className={clss.blogPost__sourceLink} href={source?.file} target='_blank' rel='noopener noreferrer'>
                                                {getLocalizedValue(source, 'name', locale)}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </section>

                </article>


                {cards.length > 0 && (
                    <aside className={clss.toponymAside}>
                        <h2 className={clss.toponymAside__title}>
                            {t('popular.title')}
                        </h2>
                        <ul className={clss.results__cards}>
                            {cards.map(({ item, osmData }) => (
                                <li key={item.id}>
                                    <ToponymCardGrid toponym={item} osmData={osmData} locale={locale} />
                                </li>
                            ))}
                        </ul>
                    </aside>
                )}
            </div>

            {blogs.length > 0 && (
                <section className={clss.similar__block}>
                    <h2 className={clss.similar__title}>{t('similar-title')}</h2>
                    <ul className={clss.blog__contentList}>
                        {blogs.slice(0, 3).map((blog) => (
                            <li className={clss.blog__contentItem} key={blog.id}>
                                <Link href={`/blog/${blog.slug}`} className={clss.blog__contentItemMainLink}>
                                    {blog?.image ? (
                                        <Image
                                            className={clss.blog__contentItemImg}
                                            src={blog.image}
                                            width={264}
                                            height={264}
                                            loading="lazy"
                                            alt=""
                                            unoptimized
                                        />
                                    ) : (
                                        <Image
                                            className={clss.blog__contentItemImg}
                                            src={blogImgFallback}
                                            width={264}
                                            height={264}
                                            loading="lazy"
                                            alt=""
                                        />
                                    )}
                                    <div className={clss.blog__contentItemContent}>
                                        <span className={clss.blog__contentItemDate}>
                                            {formatDate(blog.published_date, locale)}
                                        </span>
                                        <h3 className={clss.blog__contentItemHeading}>
                                            {getLocalizedValue(blog, 'title', locale) || blog.title_ky}
                                        </h3>
                                        <p className={clss.blog__contentItemDesc}>
                                            {truncateText(
                                                cleanHtml(
                                                    stripHtmlTags(getLocalizedValue(blog, 'content', locale))
                                                )
                                            )}
                                        </p>
                                        <span className={clss.blog__contentItemLink}>
                                            <span className={clss.blog__contentLink}>{l('more-details')}</span>
                                            <svg
                                                width="22"
                                                height="13"
                                                viewBox="0 0 22 13"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M15.3195 1.5L21 6.5L15.3195 11.5M20.211 6.5H1"
                                                    stroke="#000"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className={clss.bottomBlock}>
                        <Link href='/blog' className={clss.bottomBlockButton}>
                            {l('see-all')}
                        </Link>
                    </div>
                </section>
            )}

            <section className={clss.formContainer}>
                <Suspense fallback={null}>
                    <MainForm />
                </Suspense>
            </section>
        </>
    );
}
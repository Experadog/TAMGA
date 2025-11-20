import blogImgFallback from '@/assets/images/blog-img-fallback.png';
import { Hero } from '@/components/Hero/Hero';
import { Pagination } from '@/components/Pagination';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cleanHtml, formatDate, getLocalizedValue, stripHtmlTags } from '@/lib/utils';
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from 'next/image';
import styles from './page.module.scss';

async function fetchData({ author }) {
  try {
    const resp = await fetch(`${process.env.API_URL}/blogs/autors/${author}`)

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

export async function generateMetadata({ params }) {
  const { locale, author } = await params;

  const data = await fetchData({ author });
  if (!data) { throw new Error('Blog Post data not found') }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://tamga.kg';
  const pathname = `/${locale}/blog/authors/${author}`;
  const absoluteUrl = `${siteUrl}${pathname}`;

  // helpers
  const collapse = (s = '') => String(s || '').replace(/\s+/g, ' ').trim();

  const tMeta = await getTranslations({ locale, namespace: 'authorDetail' });
  const titleTranslate = tMeta('metadata.title') || '';
  const descriptionTranslate = tMeta('metadata.description') || '';

  const fullName = collapse(
    [data.first_name, data.last_name].filter(Boolean).join(' ')
  );

  const title = collapse(
    [fullName, titleTranslate].filter(Boolean).join(' — ')
  );
  const description = collapse(descriptionTranslate);

  const shareImage = '/openGraph.png';

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: pathname,
      languages: routing.locales.reduce((acc, loc) => {
        acc[loc] = `/${loc}/blog/authors/${author}`;
        return acc;
      }, {})
    },
    openGraph: {
      type: 'website',
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

export default async function AuthorPage({ params, searchParams }) {
  const { locale, author } = await params;
  setRequestLocale(locale);

  const sp = await searchParams
  const page = sp?.page ? parseInt(sp.page) : 1;

  const data = await fetchData({ author });
  if (!data) notFound();

  const t = await getTranslations({ locale, namespace: 'author' });
  const b = await getTranslations({ locale, namespace: 'breadcrumbs' });
  const l = await getTranslations({ locale, namespace: 'link' })

  const {
    id,
    first_name,
    last_name,
    avatar,
  } = data;

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  const itemsPerPage = 9;
  const offset = (page - 1) * itemsPerPage;

  try {
    let response = await fetch(`${process.env.API_URL}/blogs/?autors=${id}&limit=${itemsPerPage}&offset=${offset}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    var dataArticle = await response.json()
  } catch (error) {
    console.error('Error fetching blogs:', error);
    var dataArticle = { results: [], count: 0 };
  }

  let blogs = dataArticle.results || []
  const totalCount = dataArticle.count || 0
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const authorType = locale == 'ru' ? 'Автор' : locale == 'ky' ? 'Автор' : 'Author'

  const breadcrumbsItems = [
    {
      name: b('blog.home'),
      href: `/blog`,
      isLink: true
    },
    {
      name: data.first_name + ' ' + data.last_name,
    },
  ];

  return (
    <>
      <Hero
        first_name={first_name}
        last_name={last_name}
        avatar={avatar}
        type={authorType}
        breadcrumbsItems={breadcrumbsItems}
      />
      <section className={`container ${styles.blog__content}`}>
        <h2 className={styles.blog__contentHeading}>{t('list.title')}</h2>
        <p className={styles.blog__contentDesc}>{t('list.description')}</p>

        <ul className={styles.blog__contentList}>
          {blogs.map((blog) => (
            <li className={styles.blog__contentItem} key={blog.id}>
              <Link href={`/blog/${blog.slug}`} className={styles.blog__contentItemMainLink}>
                {blog?.image ? (
                  <Image
                    className={styles.blog__contentItemImg}
                    src={blog.image}
                    width={264}
                    height={264}
                    loading='lazy'
                    alt=""
                  />
                ) : (
                  <Image
                    className={styles.blog__contentItemImg}
                    src={blogImgFallback}
                    width={264}
                    height={264}
                    loading='lazy'
                    alt=""
                  />
                )}
                <div className={styles.blog__contentItemContent}>
                  <span className={styles.blog__contentItemDate}>
                    {formatDate(blog.published_date, locale)}
                  </span>
                  <h3 className={styles.blog__contentItemHeading}>{blog.title_ky}</h3>
                  <p className={styles.blog__contentItemDesc}>{truncateText(cleanHtml(stripHtmlTags(getLocalizedValue(blog, 'content', locale))))}</p>
                  <span className={styles.blog__contentItemLink}>
                    <span className={styles.blog__contentLink}>{l('more-details')}</span>
                    <svg width="22" height="13" viewBox="0 0 22 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.3195 1.5L21 6.5L15.3195 11.5M20.211 6.5H1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
        />

      </section>
    </>
  )
}
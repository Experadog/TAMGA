import blogImgFallback from '@/assets/images/blog-img-fallback.png';
import { cleanHtml, formatDate, getLocalizedValue, stripHtmlTags } from '@/lib/utils';
import { getTranslations } from "next-intl/server";
import Image from 'next/image';
import Link from 'next/link';
import styles from './Blog.module.scss';

export default async function Blog({ locale, searchParams }) {
  const page = await searchParams?.page ? parseInt(searchParams.page) : 1;

  const t = await getTranslations({ locale, namespace: 'home' });
  const l = await getTranslations({ locale, namespace: 'link' })

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  const itemsPerPage = 9;
  const offset = (page - 1) * itemsPerPage;

  try {
    let response = await fetch(`${process.env.API_URL}/blogs/?limit=${itemsPerPage}&offset=${offset}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    var data = await response.json()
  } catch (error) {
    console.error('Error fetching blogs:', error);
    var data = { results: [], count: 0 };
  }


  let blogs = data.results || []

  return (

    <>
      <h2 className={styles.blog__contentHeading}>{t('blog.title')}</h2>
      <div className={styles.descriptionBlock}>
        <p className={styles.blog__contentDesc}>{t('blog.description')}</p>
        <button className={styles.button}>Посмотреть все</button>
      </div>

      <ul className={styles.blog__contentList}>
        {blogs.map((blog) => (
          <li className={styles.blog__contentItem} key={blog.id}>
            <Link href={`blog/${blog.slug}`} className={styles.blog__contentItemMainLink}>
              {blog?.image ? (
                <Image
                  className={styles.blog__contentItemImg}
                  src={blog.image}
                  width={264}
                  height={264}
                  loading='lazy'
                  alt=""
                  unoptimized
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
      <div className={styles.buttonBlock}>
        <button className={`${styles.button} ${styles.buttonDown}`}>Перейти на карту</button>
      </div>
    </>
  )
}


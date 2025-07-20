import Image from 'next/image';
import styles from './page.module.scss';
import testBlogImg from '@/assets/images/article.jpg';
import Link from 'next/link';
{/* FIXME: Remove testBlogImg */}


export default async function Blog({ params }) {

    let response = await fetch(`${process.env.API_URL}/blogs`)
    let data = await response.json()

    let blogs = data.results
    return (
        <>
            <section className={`${styles.blog__hero} full-width`}>
                <h1 className={styles.blog__heroHeading}>Блог</h1>
                <p className={styles.blog__heroDesc}>
                    We understand that every heartbeat, every breath, and every moment matters. As a beacon of health and healing in England, we are dedicated to 
                </p>
            </section>
            <section className={`container ${styles.blog__content}`}>
                <h2 className={styles.blog__contentHeading}>Интересные статьи</h2>
                <p className={styles.blog__contentDesc}>
                    We understand that every heartbeat, every breath, and every moment matters. As a beacon of health and healing in England, we are dedicated to 
                </p>

                <ul className={styles.blog__contentList}>
                    {blogs.map((blog) => (
                        <li className={styles.blog__contentItem} key={blog.id}>
                            {/* FIXME: Remove testBlogImg */}
                            <img 
                                className={styles.blog__contentItemImg}
                                src={blog?.image} 
                                width={264} 
                                height={264} 
                                alt="" 
                            />
                            <div className={styles.blog__contentItemContent}>
                                <span className={styles.blog__contentItemDate}>
                                    {new Intl.DateTimeFormat('ru-RU', {
                                        day: 'numeric',
                                        month: 'long'
                                    }).format(new Date(blog.published_date))}, {new Date(blog.published_date).getFullYear()}
                                </span>
                                <h3 className={styles.blog__contentItemHeading}>{blog.title_ky}</h3>
                                <p className={styles.blog__contentItemDesc}>Capitalize on low-hanging fruit to identify a value added matrix economically activity to beta test override the digital.</p>
                                <Link href={`blog/${blog.slug}`} className={styles.blog__contentItemLink}>
                                    <span>Подробнее</span>
                                    <svg width="22" height="13" viewBox="0 0 22 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.3195 1.5L21 6.5L15.3195 11.5M20.211 6.5H1" stroke="#0094EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>

            </section>
        </>
    )
}
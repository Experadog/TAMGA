import { cleanHtml, getLocalizedValue } from '@/lib/utils';
import clss from './page.module.scss';
import './styles.scss'
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

    const title = getLocalizedValue(data, 'title', locale);
    const content = getLocalizedValue(data, 'content', locale);
    const cleanContent = cleanHtml(content); 

    return (
        <>
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
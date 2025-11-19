import Image from 'next/image';
import { Breadcrumbs } from '../Breadcrumbs';
import clss from './index.module.scss';

function Hero({
    heading,
    description,
    first_name,
    last_name,
    avatar,
    type,
    breadcrumbsItems,
}) {

    const hasHeroText = Boolean(heading || description);

    const hasAuthorInfo =
        first_name || last_name || avatar || type;

    const fullName = [first_name, last_name].filter(Boolean).join(' ');

    return (
        <section className={`${clss.hero} full-width`}>
            {hasAuthorInfo && (
                <Breadcrumbs items={breadcrumbsItems} className={clss.blogBreadcrumbs} />
            )}
            {hasHeroText && (
                <>
                    {heading && (
                        <h1 className={clss.hero__heading}>{heading}</h1>
                    )}
                    {description && (
                        <p className={clss.hero__desc}>{description}</p>
                    )}
                </>
            )}

            {hasAuthorInfo && (
                <div className={clss.hero__author}>
                    {avatar && (
                        <div className={clss.hero__authorAvatar}>
                            <Image
                                src={avatar}
                                alt={fullName || 'Автор'}
                                width={64}
                                height={64}
                                className={clss.hero__authorAvatar__image}
                            />
                        </div>
                    )}

                    <div className={clss.hero__authorInfo}>
                        {fullName && (
                            <div className={clss.hero__authorName}>
                                {fullName}
                            </div>
                        )}

                        {type && (
                            <div className={clss.hero__authorType}>
                                {type}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    )
}

export { Hero };

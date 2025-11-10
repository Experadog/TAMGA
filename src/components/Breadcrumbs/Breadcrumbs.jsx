import { Link } from '@/i18n/navigation';
import clss from './Breadcrumbs.module.scss';

export const Breadcrumbs = ({ items, ariaLabel = 'Breadcrumb navigation', className }) => {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <nav className={`${clss.breadcrumbs} ${className}`} aria-label={ariaLabel}>
            <ol className={clss.breadcrumbs__list}>
                {items.map((breadcrumb, index) => (
                    <li key={index} className={clss.breadcrumbs__item}>
                        {breadcrumb.isLink ? (
                            <Link
                                href={breadcrumb.href}
                                className={clss.breadcrumbs__link}
                            >
                                {breadcrumb.name}
                            </Link>
                        ) : (
                            <span className={clss.breadcrumbs__current}>
                                {breadcrumb.name}
                            </span>
                        )}
                        {index < items.length - 1 && (
                            <span className={clss.breadcrumbs__separator} aria-hidden="true">
                                <svg width="4" height="8" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.585938 1L3.58594 4L0.585938 7" stroke="#605F5F" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

import { getLocalizedValue } from "@/lib/utils";

import clss from './index.module.scss';

export function ToponymAsideItem({ heading, data, amount, locale }) {
    return (
        <div className={clss.toponymAsideItem}>
            <h3 className={clss.toponymAsideItem__heading}>{amount && amount} {heading}</h3>
            <ul className={clss.toponymAsideItem__list}>
                {data.map((item, index) => (
                    <li className={clss.toponymAsideItem__item} key={item.name_ky}>{getLocalizedValue(item, 'name', locale)}</li>
                ))}
            </ul>
        </div>
    )
}
import { ToponymHeading } from "../ToponymHeading.jsx";
import chevron from '@/assets/icons/chevron.svg'
import Image from "next/image.js";

import clss from './index.module.scss';

export function ToponymDetails({ heading, headingLevel, children}) {
    return (
        <details className={clss.toponymDetails} open>
            <summary className={clss.toponymDetails__summary}>
                {heading && <ToponymHeading level={headingLevel}>{heading}</ToponymHeading>}
                <Image className={clss.toponymDetails__chevron} src={chevron} width='8' height='5' alt='' />
            </summary>

            {children}
        </details>
    )
}
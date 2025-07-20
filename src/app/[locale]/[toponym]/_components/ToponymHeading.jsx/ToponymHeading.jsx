import clss from './index.module.scss'

export function ToponymHeading({ level, children }) {

    if (level === 1) {
        return <h1 className={clss.toponymHeading}>{children}</h1>;
    } 

    return (
        <h2 className={`${clss.toponymHeading} ${clss.toponymSubheading}`}>{children}</h2>
    )
}
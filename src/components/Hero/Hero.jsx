import clss from './index.module.scss';

function Hero({ heading, description }) {
    return (
        <section className={`${clss.hero} full-width`}>
            <h1 className={clss.hero__heading}>{heading}</h1>
            <p className={clss.hero__desc}>
                {description}
            </p>
        </section>
    )
}

export { Hero };
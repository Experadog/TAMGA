'use client';

import arrow from '@/assets/icons/arrowRight.svg';
import chevron from '@/assets/icons/chevron.svg';
import imgDefault from '@/assets/images/toponym-day-default.png';
import Image from 'next/image';
import styles from './ToponymDay.module.scss';

export const ToponymDay = () => {
  return (
    <section className={styles.toponymDay}>
      <div className={styles.toponymDayLeft}>
        <div className={styles.cardTop}>
          <h2 className={styles.title}>Топоним дня</h2>
          <div className={styles.dateBlock}>
            <button className={styles.arrowBtn}>
              <Image className={styles.chevronLeft} src={chevron} alt='' width={32} height={32} />
            </button>
            <span className={styles.date}>2025-02-10</span>
            <button className={styles.arrowBtn}>
              <Image className={styles.chevronRight} src={chevron} alt='' width={32} height={32} />
            </button>
          </div>
        </div>
        <div className={styles.cardBottom}>
          <div className={styles.imagePlaceholder}>
            <Image
              src={imgDefault ?? imgDefault}
              alt=''
              width={322}
              height={255}
              className={styles.imagePlaceholderImage}
            />
          </div>
          <div className={styles.info}>
            <div className={styles.infoBlock}>
              <h3 className={styles.name}>Название</h3>
              <p className={styles.meta}>Регион</p>
              <p className={styles.meta}>Тип объекта</p>
              <p className={styles.meta}>Краткое описание</p>
            </div>

            <div className={styles.moreBlock}>
              <button className={styles.moreBtn}>
                Подробнее
                <Image
                  src={arrow}
                  alt=''
                  width={24}
                  height={24}
                  className={styles.moreArrow}
                />
              </button>

            </div>
          </div>
        </div>
      </div>

      <div className={styles.toponymDayRight}>
        <div className={styles.topBlock}>
          <h2 className={styles.topBlockTitle}>О проекте</h2>
          <p className={styles.topBlockDescription}>
            Our design team helps clients achieve their marketing and business goals through user-friendly, engaging target branding that appeals to a website. Our design team helps clients achieve their marketing and business goals throug ...
          </p>
        </div>
        <div className={styles.bottomBlock}>
          <button className={styles.bottomBlockButton}>Подробнее</button>
        </div>
      </div>
    </section>
  );
};
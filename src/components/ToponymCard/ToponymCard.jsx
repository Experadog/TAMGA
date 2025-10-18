import arrow from '@/assets/icons/arrowRight.svg';
import imgDefault from '@/assets/images/toponym-day-default.png';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import styles from './ToponymCard.module.scss';

function ToponymCard({ }) {
  return (
    <Link href={`/`} className={styles.cardContainer}>
      <div className={styles.cardImage}>
        <Image src={imgDefault} alt='' width={184} height={184} />
      </div>
      <div className={styles.cardContent}>
        <div className={styles.topContent}>
          <h3 className={styles.title}>Название</h3>
          <p className={styles.description}>Регион</p>
          <p className={styles.description}>Тип объекта</p>
          <p className={styles.description}>Краткое описание</p>
        </div>
        <div className={styles.bottomContent}>
          <p className={styles.similar}>31 cовпадений</p>
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
    </Link>
  )
}

export default ToponymCard

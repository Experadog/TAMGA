import ToponymCard from '../ToponymCard/ToponymCard';
import styles from './PopularToponyms.module.scss';

const data = [
  {
    id: 0,
    title: '5,000 +',
    description: 'Ороним'
  },
  {
    id: 1,
    title: '2,500 +',
    description: 'Ойконим'
  },
  {
    id: 2,
    title: '5,000 +',
    description: 'Антропотопонимы'
  },
  {
    id: 3,
    title: '2,000 +',
    description: 'Неотопонимы'
  },
  {
    id: 4,
    title: '2,400 +',
    description: 'Этнотопонимы'
  }
]

function PopularToponyms() {
  return (
    <>
      <div className={styles.popularToponymsTop}>
        <h2 className={styles.title}>Популярные топонимы</h2>
        <div className={styles.descriptionBlock}>
          <p className={styles.description}>
            We understand that every heartbeat, every breath, and every moment matters. As a beacon of health and healing in England, we are dedicated to
          </p>
          <button className={styles.button}>Посмотреть все</button>
        </div>

        <div className={styles.cardsBlock}>
          <ToponymCard />
          <ToponymCard />
          <ToponymCard />
          <ToponymCard />
        </div>

        <div className={styles.buttonBlock}>
          <button className={`${styles.button} ${styles.buttonDown}`}>Посмотреть все</button>
        </div>
      </div>


      <div className={styles.popularToponymsBottom}>
        {data.map(item => (
          <ul key={item.id} className={styles.list}>
            <li className={styles.elOne}>{item.title}</li>
            <li className={styles.elTwo}>{item.description}</li>
          </ul>
        ))}
      </div>
    </>
  )
}

export default PopularToponyms

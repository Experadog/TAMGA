import { getTranslations } from 'next-intl/server';
import RequestFormModal from '../RequestFormModal/RequestFormModal';
import styles from './MainForm.module.scss';

async function MainForm({ locale, toponym }) {
  const t = await getTranslations({ locale, namespace: 'home' });
  return (
    <div className={styles.formBlock}>
      <div className={styles.form__bg} />
      <div className={styles.contentLeft}>
        <h3 className={styles.title}>{t('form.title')}</h3>
        <p className={styles.description}>
          {t('form.description')}
        </p>
      </div>
      <div className={styles.contentRight}>
        <RequestFormModal buttonLabel={t('add-title')} toponym={toponym} />
        {/* <button className={styles.button}>{t('add-title')}</button> */}
      </div>
    </div>
  )
}

export default MainForm

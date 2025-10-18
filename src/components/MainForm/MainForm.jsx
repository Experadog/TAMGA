import styles from './MainForm.module.scss'

function MainForm() {
  return (
    <div className={styles.formBlock}>
      <div className={styles.form__bg} />
      <div className={styles.contentLeft}>
        <h3 className={styles.title}>Как внести данные?</h3>
        <p className={styles.description}>
          Каждый желающий может добавить дополнительные данные к существующей базе. Необходимо заполнить соответствующую форму
        </p>
      </div>
      <div className={styles.contentRight}>
        <button className={styles.button}>Добавить название</button>
      </div>
    </div>
  )
}

export default MainForm

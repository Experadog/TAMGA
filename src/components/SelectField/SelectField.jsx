import styles from './SelectField.module.scss';

export default function SelectField({ value, onChange, children }) {
  return (
    <div className={styles.selectWrapper}>
      <select
        className={styles.select}
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      <span className={styles.selectArrow}>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.00065 3.5026L8.25065 0.252604C8.40343 0.0998263 8.59787 0.0234375 8.83398 0.0234375C9.0701 0.0234375 9.26454 0.0998264 9.41732 0.252604C9.5701 0.405382 9.64648 0.599826 9.64648 0.835938C9.64648 1.07205 9.5701 1.26649 9.41732 1.41927L5.58398 5.2526C5.50065 5.33594 5.41037 5.39497 5.31315 5.42969C5.21593 5.46441 5.11176 5.48177 5.00065 5.48177C4.88954 5.48177 4.78537 5.46441 4.68815 5.42969C4.59093 5.39497 4.50065 5.33594 4.41732 5.2526L0.583984 1.41927C0.431207 1.26649 0.354817 1.07205 0.354817 0.835937C0.354817 0.599826 0.431207 0.405382 0.583984 0.252604C0.736762 0.099826 0.931207 0.0234371 1.16732 0.0234371C1.40343 0.0234371 1.59787 0.099826 1.75065 0.252604L5.00065 3.5026Z" fill="#646464" />
        </svg>
      </span>
    </div>
  );
}
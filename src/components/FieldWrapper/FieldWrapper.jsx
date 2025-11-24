
import styles from './FieldWrapper.module.scss';

export default function FieldWrapper({ label, required, children, error }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {label} {required && <span className={styles.fieldRequired}>*</span>}
      </label>
      {children}
      {error && <div className={styles.fieldError}>{error}</div>}
    </div>
  );
}
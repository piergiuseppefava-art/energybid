import styles from './Disclaimer.module.css'

export default function Disclaimer({ t, lang }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>⚠</span>
      <span className={styles.text}>
        <strong>{lang === 'en' ? 'Demo version.' : 'Demo dimostrativa.'}</strong>{' '}
        {t.disclaimer}{' '}
        <a href="https://www.mercatoelettrico.org" target="_blank" rel="noopener noreferrer" className={styles.link}>
          mercatoelettrico.org
        </a>.
      </span>
    </div>
  )
}

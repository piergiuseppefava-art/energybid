import styles from './WelcomeHub.module.css'

export default function WelcomeHub({ onContinue, t }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.grid} />
      <div className={styles.content}>
        <h1 className={styles.mission}>{t.mission}</h1>
        <p className={styles.sub}>{t.sub}</p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statNum}>{t.stat1Num}</div>
            <div className={styles.statDesc}>{t.stat1Desc}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>{t.stat2Num}</div>
            <div className={styles.statDesc}>{t.stat2Desc}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>{t.stat3Num}</div>
            <div className={styles.statDesc}>{t.stat3Desc}</div>
          </div>
        </div>
        <button className={styles.cta} onClick={onContinue}>{t.cta}</button>
      </div>
    </div>
  )
}

import { useCountUp } from '../hooks/useCountUp'
import styles from './WelcomeHub.module.css'

export default function WelcomeHub({ onContinue, t, lang }) {
  const [val1, done1, ref1] = useCountUp(25, { start: 0, duration: 1500 })
  const [val2, done2, ref2] = useCountUp(5.7, { start: 0, duration: 1500 })
  const [val3, done3, ref3] = useCountUp(2025, { start: 2020, duration: 1500 })

  // When done, show exact i18n string — no rounding artefacts at the end
  const display1 = done1 ? t.stat1Num : `${Math.round(val1)}%`
  const display2 = done2
    ? t.stat2Num
    : lang === 'en'
      ? `€${val2.toFixed(1)}B`
      : `${val2.toFixed(1).replace('.', ',')} mld`
  const display3 = done3 ? t.stat3Num : `${Math.floor(val3)}`

  return (
    <div className={styles.wrap}>
      <div className={styles.grid} />
      <div className={styles.particle1} />
      <div className={styles.particle2} />
      <div className={styles.particle3} />
      <div className={styles.particle4} />
      <div className={styles.particle5} />
      <div className={styles.content}>
        <h1 className={styles.mission}>{t.mission}</h1>
        <p className={styles.sub}>{t.sub}</p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div ref={ref1} className={styles.statNum}>{display1}</div>
            <div className={styles.statDesc}>{t.stat1Desc}</div>
          </div>
          <div className={styles.stat}>
            <div ref={ref2} className={styles.statNum}>{display2}</div>
            <div className={styles.statDesc}>{t.stat2Desc}</div>
          </div>
          <div className={styles.stat}>
            <div ref={ref3} className={styles.statNum}>{display3}</div>
            <div className={styles.statDesc}>{t.stat3Desc}</div>
          </div>
        </div>
        <button className={styles.cta} onClick={onContinue}>{t.cta}</button>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { T } from '../i18n'
import styles from './Landing.module.css'

export default function Landing({ onEntra, lang, setLang }) {
  const t = T[lang].landing
  const [scrolled, setScrolled] = useState(false)
  


  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className={styles.wrap}>
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <span className={styles.navLogo}>⚡ EnergyBid</span>
        <div className={styles.navRight}>
          <div className={styles.langSwitch}>
            <button
              className={`${styles.langBtn} ${lang === 'it' ? styles.langActive : ''}`}
              onClick={() => setLang('it')}
            >IT</button>
            <span className={styles.langDivider}>|</span>
            <button
              className={`${styles.langBtn} ${lang === 'en' ? styles.langActive : ''}`}
              onClick={() => setLang('en')}
            >EN</button>
          </div>
          <button className={styles.navCta} onClick={onEntra}>
            {lang === 'it' ? 'Entra →' : 'Enter →'}
          </button>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.grid} />
        <div className={styles.heroContent}>
          <div className={styles.pill}>{t.pill}</div>
          <h1 className={styles.heroTitle}>
            {t.heroTitle1}<br />
            {t.heroTitle2}<br />
            <span className={styles.heroAccent}>{t.heroTitle3}</span>
          </h1>
          <p className={styles.heroSub}>{t.heroSub}</p>
          <button className={styles.heroCta} onClick={onEntra}>{t.heroCta}</button>
        </div>
        <div className={styles.scroll}>{t.scroll}</div>
      </section>

      <section className={styles.problema}>
        <div className={styles.problemaInner}>
          <div className={styles.sectionTag}>{t.sectionTag1}</div>
          <h2 className={styles.sectionTitle}>
            {t.sectionTitle1}<br />
            <span style={{ color: 'var(--text3)' }}>{t.sectionTitle1b}</span>
          </h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNum}>{t.stat1Num}</div>
              <div className={styles.statLabel}>{t.stat1Label}</div>
              <div className={styles.statDesc}>{t.stat1Desc}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>{t.stat2Num}</div>
              <div className={styles.statLabel}>{t.stat2Label}</div>
              <div className={styles.statDesc}>{t.stat2Desc}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>{t.stat3Num}</div>
              <div className={styles.statLabel}>{t.stat3Label}</div>
              <div className={styles.statDesc}>{t.stat3Desc}</div>
            </div>
          </div>
          <div className={styles.fonti}>{t.fonti}</div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <div className={styles.sectionTag}>{t.sectionTag2}</div>
          <h2 className={styles.sectionTitle}>{t.sectionTitle2}<br />{t.sectionTitle2b}</h2>
          <div className={styles.featureGrid}>
            {t.features.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>{t.ctaTitle}</h2>
          <button className={styles.ctaBtn} onClick={onEntra}>{t.ctaBtn}</button>
          <p className={styles.ctaNote}>{t.ctaNote}</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>{t.footer1}</span>
        <span style={{ color: 'var(--text3)' }}>{t.footer2}</span>
      </footer>
    </div>
  )
}

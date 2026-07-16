import { useEffect, useState } from 'react'
import { T } from '../i18n'
import styles from './Landing.module.css'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useCountUp } from '../hooks/useCountUp'

export default function Landing({ onEntra, lang, setLang }) {
  const t = T[lang].landing
  const [scrolled, setScrolled] = useState(false)

  const problemaRef = useScrollReveal()
  const featuresRef = useScrollReveal()
  const ctaRef = useScrollReveal()

  const [val1, done1, statRef1] = useCountUp(24,    { start: 0,    duration: 1500 })
  const [val2, done2, statRef2] = useCountUp(10000, { start: 0,    duration: 1800 })
  const [val3, done3, statRef3] = useCountUp(2025,  { start: 2020, duration: 1500 })

  const display1 = done1 ? t.stat1Num : `+${Math.round(val1)}%`
  const display2 = done2
    ? t.stat2Num
    : lang === 'en'
      ? `€${Math.round(val2).toLocaleString('en-US')}`
      : `${Math.round(val2).toLocaleString('it-IT')}€`
  const display3 = done3 ? t.stat3Num : `${Math.floor(val3)}`

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const line1 = t.heroTitle1.split(' ')
  const line2 = t.heroTitle2.split(' ')
  const line3 = t.heroTitle3.split(' ')
  const totalWords = line1.length + line2.length + line3.length

  return (
    <div className={styles.wrap}>
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <span className={styles.navLogo}>⚡ Lumia</span>
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
        <div className={styles.particle1} />
        <div className={styles.particle2} />
        <div className={styles.particle3} />
        <div className={styles.particle4} />
        <div className={styles.particle5} />
        <div className={styles.heroContent}>
          <div className={styles.pill} style={{ animationDelay: '0ms' }}>{t.pill}</div>
          <h1 className={styles.heroTitle}>
            {line1.map((word, i) => (
              <span
                key={`l1-${i}`}
                className={styles.heroWord}
                style={{ animationDelay: `${i * 80 + 100}ms` }}
              >
                {word}{' '}
              </span>
            ))}
            <br />
            {line2.map((word, i) => (
              <span
                key={`l2-${i}`}
                className={styles.heroWord}
                style={{ animationDelay: `${(line1.length + i) * 80 + 100}ms` }}
              >
                {word}{' '}
              </span>
            ))}
            <br />
            <span className={styles.heroAccent}>
              {line3.map((word, i) => (
                <span
                  key={`l3-${i}`}
                  className={styles.heroWord}
                  style={{ animationDelay: `${(line1.length + line2.length + i) * 80 + 100}ms` }}
                >
                  {word}{' '}
                </span>
              ))}
            </span>
          </h1>
          <p
            className={styles.heroSub}
            style={{ animationDelay: `${totalWords * 80 + 200}ms` }}
          >
            {t.heroSub}
          </p>
          <button
            className={styles.heroCta}
            style={{ animationDelay: `${totalWords * 80 + 320}ms` }}
            onClick={onEntra}
          >
            {t.heroCta}
          </button>
        </div>
        <div className={styles.scroll}>{t.scroll}</div>
      </section>

      <section ref={problemaRef} className={`${styles.problema} ${styles.revealSection}`}>
        <div className={styles.problemaInner}>
          <div className={styles.sectionTag}>{t.sectionTag1}</div>
          <h2 className={styles.sectionTitle}>
            {t.sectionTitle1}<br />
            <span style={{ color: 'var(--text3)' }}>{t.sectionTitle1b}</span>
          </h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div ref={statRef1} className={styles.statNum}>{display1}</div>
              <div className={styles.statLabel}>{t.stat1Label}</div>
              <div className={styles.statDesc}>{t.stat1Desc}</div>
            </div>
            <div className={styles.stat}>
              <div ref={statRef2} className={styles.statNum}>{display2}</div>
              <div className={styles.statLabel}>{t.stat2Label}</div>
              <div className={styles.statDesc}>{t.stat2Desc}</div>
            </div>
            <div className={styles.stat}>
              <div ref={statRef3} className={styles.statNum}>{display3}</div>
              <div className={styles.statLabel}>{t.stat3Label}</div>
              <div className={styles.statDesc}>{t.stat3Desc}</div>
            </div>
          </div>
          <div className={styles.fonti}>{t.fonti}</div>
        </div>
      </section>

      <section ref={featuresRef} className={`${styles.features} ${styles.revealSection}`}>
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

      <section ref={ctaRef} className={`${styles.cta} ${styles.revealSection}`}>
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

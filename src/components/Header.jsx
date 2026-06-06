import styles from './Header.module.css'
import { useOrganization } from '../store/organization.store'

export default function Header({ tab, setTab, onBack, lang, setLang, t }) {
  const [org] = useOrganization()

  const tabs = [
    { id: 'calc', label: t.calc },
    { id: 'compare', label: t.compare },
    { id: 'history', label: t.history },
    { id: 'cer', label: t.cer },
    { id: 'esg', label: t.esg },
    { id: 'market', label: '🤖 Market Watcher' },
  ]

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <button className={styles.backBtn} onClick={onBack}>←</button>
        <span className={styles.logo}>⚡</span>
        <span className={styles.name}>EnergyBid</span>
        {org.nome && (
          <>
            <span className={styles.divider}>/</span>
            <span className={styles.orgName}>{org.nome}</span>
          </>
        )}
      </div>
      <div className={styles.right}>
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
        <nav className={styles.nav}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`${styles.tab} ${tab === t.id ? styles.active : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

import styles from './Header.module.css'
import { useOrganization } from '../store/organization.store'

export default function Header({ lang, setLang, t, onMenuOpen }) {
  const [org] = useOrganization()

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
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
        <button className={styles.hamburger} onClick={onMenuOpen} title="Menu">☰</button>
      </div>
    </header>
  )
}

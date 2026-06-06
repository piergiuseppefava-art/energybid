import styles from './SubTabs.module.css'

const TABS = [
  { id: 'calc', labelKey: 'calc' },
  { id: 'compare', labelKey: 'compare' },
  { id: 'history', labelKey: 'history' },
]

export default function SubTabs({ subTab, setSubTab, t }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.bar}>
        {TABS.map(tb => (
          <button
            key={tb.id}
            className={`${styles.tab} ${subTab === tb.id ? styles.active : ''}`}
            onClick={() => setSubTab(tb.id)}
          >
            {t[tb.labelKey]}
          </button>
        ))}
      </div>
    </div>
  )
}

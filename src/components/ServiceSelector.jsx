import styles from './ServiceSelector.module.css'

export default function ServiceSelector({ onSelect, t }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.grid} />
      <div className={styles.content}>
        <div className={styles.tag}>{t.tag}</div>
        <h2 className={styles.title}>{t.title}</h2>
        <div className={styles.cards}>
          {t.services.map((s) => (
            <button key={s.id} className={styles.card} onClick={() => onSelect(s.id)}>
              <div className={styles.icon}>{s.icon}</div>
              <div className={styles.name}>{s.name}</div>
              <div className={styles.desc}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

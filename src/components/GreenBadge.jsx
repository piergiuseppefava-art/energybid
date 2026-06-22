import styles from './GreenBadge.module.css'

const BADGE = {
  it: {
    fonte: { solare: '☀ Solare', eolico: '◎ Eolico', idroelettrico: '≋ Idroelettrico' },
    notGreen: '◆ Non rinnovabile',
    green: '✓ Energia verde',
    go: 'GO certificata',
  },
  en: {
    fonte: { solare: '☀ Solar', eolico: '◎ Wind', idroelettrico: '≋ Hydro' },
    notGreen: '◆ Non-renewable',
    green: '✓ Green energy',
    go: 'GO certified',
  },
}

export default function GreenBadge({ green, fonte, go_certificata, provenienza, lang = 'it' }) {
  const b = BADGE[lang] ?? BADGE.it
  if (!green) {
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className={styles.notGreen}>{b.notGreen}</span>
        {provenienza && <span className={styles.provenienza}>{provenienza}</span>}
      </div>
    )
  }
  return (
    <div className={styles.wrap}>
      <span className={styles.green}>{b.green}</span>
      {fonte && <span className={styles.fonte}>{b.fonte[fonte] || fonte}</span>}
      {go_certificata && <span className={styles.go}>{b.go}</span>}
      {provenienza && <span className={styles.provenienza}>{provenienza}</span>}
    </div>
  )
}

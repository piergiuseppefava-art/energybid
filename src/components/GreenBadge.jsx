import styles from './GreenBadge.module.css'

const FONTE_LABEL = {
  solare: '☀ Solare',
  eolico: '◎ Eolico',
  idroelettrico: '≋ Idroelettrico',
}

export default function GreenBadge({ green, fonte, go_certificata, provenienza }) {
  if (!green) {
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className={styles.notGreen}>◆ Non rinnovabile</span>
        {provenienza && <span className={styles.provenienza}>{provenienza}</span>}
      </div>
    )
  }
  return (
    <div className={styles.wrap}>
      <span className={styles.green}>✓ Energia verde</span>
      {fonte && <span className={styles.fonte}>{FONTE_LABEL[fonte] || fonte}</span>}
      {go_certificata && <span className={styles.go}>GO certificata</span>}
      {provenienza && <span className={styles.provenienza}>{provenienza}</span>}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { OFFERTE, PUN_RIFERIMENTO } from '../data/offerte'
import { calcCostoOfferta, calcCostoAttuale, fmt } from '../utils/calc'
import styles from './AlertContratto.module.css'

export default function AlertContratto({ inputs, t }) {
  const [soglia, setSoglia] = useState(200)
  const [chiuso, setChiuso] = useState(false)

  const analisi = useMemo(() => {
    const { consumoAnnuo, prezzoAttuale, quotaFissaAttuale } = inputs
    const results = OFFERTE.map(o => {
      const annual = calcCostoOfferta(consumoAnnuo, o, PUN_RIFERIMENTO)
      return { ...o, annual }
    }).sort((a, b) => a.annual - b.annual)

    const migliore = results[0]
    const attuale = {
      annual: calcCostoAttuale(consumoAnnuo, prezzoAttuale, quotaFissaAttuale),
    }

    const risparmioAnno = attuale.annual - migliore.annual
    const conviene = risparmioAnno >= soglia

    return { migliore, attuale, risparmioAnno, conviene }
  }, [inputs, soglia])

  if (chiuso) return null

  const { migliore, risparmioAnno, conviene } = analisi

  return (
    <div className={`${styles.wrap} ${conviene ? styles.alert : styles.ok}`}>
      <div className={styles.left}>
        {conviene ? (
          <>
            <div className={styles.icon}>⚠</div>
            <div className={styles.content}>
              <div className={styles.title}>{t.notOptimal}</div>
              <div className={styles.sub}>
                {t.notOptimalDesc(migliore.nome, fmt(risparmioAnno), fmt(soglia, 0))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.icon} style={{ color: 'var(--green)' }}>✓</div>
            <div className={styles.content}>
              <div className={styles.title} style={{ color: 'var(--green)' }}>{t.optimal}</div>
              <div className={styles.sub}>{t.optimalDesc(fmt(soglia, 0))}</div>
            </div>
          </>
        )}
      </div>
      <div className={styles.right}>
        <div className={styles.sogliaWrap}>
          <label className={styles.sogliaLabel}>{t.soglia}</label>
          <div className={styles.sogliaInput}>
            <input
              type="number"
              value={soglia}
              min={0}
              step={50}
              onChange={(e) => setSoglia(parseFloat(e.target.value) || 0)}
            />
            <span className={styles.sogliaUnit}>{t.unit}</span>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={() => setChiuso(true)}>×</button>
      </div>
    </div>
  )
}

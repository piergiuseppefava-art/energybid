import { useMemo } from 'react'
import { OFFERTE, COSTO_GO, FATTORE_EMISSIONI } from '../data/offerte'
import { calcOfferCost, fmt } from '../utils/calc'
import styles from './PremiumVerde.module.css'

export default function PremiumVerde({ inputs, t }) {
  const { f1, f2, f3 } = inputs
  const totKwh = f1 + f2 + f3

  const analisi = useMemo(() => {
    const verdi = OFFERTE.filter(o => o.green && o.go_certificata)
    const nonVerdi = OFFERTE.filter(o => !o.green)

    if (!verdi.length || !nonVerdi.length) return null

    const miglioreVerde = verdi
      .map(o => ({ ...o, monthly: calcOfferCost(inputs, o) }))
      .sort((a, b) => a.monthly - b.monthly)[0]

    const miglioreNonVerde = nonVerdi
      .map(o => ({ ...o, monthly: calcOfferCost(inputs, o) }))
      .sort((a, b) => a.monthly - b.monthly)[0]

    const premiumMese = miglioreVerde.monthly - miglioreNonVerde.monthly
    const premiumAnno = premiumMese * 12
    const co2Evitata = totKwh * FATTORE_EMISSIONI * 12 / 1000
    const costoGO = totKwh * COSTO_GO * 12
    const costoPertCO2 = co2Evitata > 0 ? premiumAnno / co2Evitata : 0

    return { miglioreVerde, miglioreNonVerde, premiumMese, premiumAnno, co2Evitata, costoGO, costoPertCO2 }
  }, [inputs])

  if (!analisi) return null

  const { miglioreVerde, miglioreNonVerde, premiumMese, premiumAnno, co2Evitata, costoPertCO2 } = analisi
  const conveniente = premiumAnno < 500

  return (
    <div className={styles.wrap}>
      <div className={styles.cardTitle}>{t.title}</div>

      <div className={styles.confronto}>
        <div className={styles.offertaBox}>
          <div className={styles.offertaLabel}>{t.migliorVerde}</div>
          <div className={styles.offertaNome}>{miglioreVerde.name}</div>
          <div className={styles.offertaPrezzo}>{fmt(miglioreVerde.monthly)} €/mese</div>
          <div className={styles.offertaBadge} style={{ color: 'var(--green)', background: 'rgba(46,204,113,0.1)' }}>
            ✓ GO · {miglioreVerde.provenienza}
          </div>
        </div>

        <div className={styles.vs}>vs</div>

        <div className={styles.offertaBox}>
          <div className={styles.offertaLabel}>{t.migliorStd}</div>
          <div className={styles.offertaNome}>{miglioreNonVerde.name}</div>
          <div className={styles.offertaPrezzo}>{fmt(miglioreNonVerde.monthly)} €/mese</div>
          <div className={styles.offertaBadge} style={{ color: 'var(--text3)', background: 'var(--bg3)' }}>
            ◆ {miglioreNonVerde.provenienza}
          </div>
        </div>
      </div>

      <div className={styles.metriche}>
        <div className={styles.metrica}>
          <div className={styles.metricaLabel}>{t.premiumMese}</div>
          <div className={styles.metricaVal} style={{ color: premiumMese > 0 ? 'var(--amber)' : 'var(--green)' }}>
            {premiumMese > 0 ? '+' : ''}{fmt(premiumMese)} €
          </div>
        </div>
        <div className={styles.metrica}>
          <div className={styles.metricaLabel}>{t.premiumAnno}</div>
          <div className={styles.metricaVal} style={{ color: premiumMese > 0 ? 'var(--amber)' : 'var(--green)' }}>
            {premiumAnno > 0 ? '+' : ''}{fmt(premiumAnno)} €
          </div>
        </div>
        <div className={styles.metrica}>
          <div className={styles.metricaLabel}>{t.co2Evitata}</div>
          <div className={styles.metricaVal} style={{ color: 'var(--green)' }}>
            {fmt(co2Evitata, 2)} tCO₂
          </div>
        </div>
        <div className={styles.metrica}>
          <div className={styles.metricaLabel}>{t.costoTco2}</div>
          <div className={styles.metricaVal}>{fmt(costoPertCO2)} €/t</div>
        </div>
      </div>

      <div className={`${styles.verdetto} ${conveniente ? styles.verdettoPro : styles.verdettoNeutro}`}>
        {conveniente
          ? t.verdettoPro(fmt(premiumAnno), fmt(premiumAnno / 12))
          : t.verdettoNeutro(fmt(premiumAnno))
        }
      </div>
    </div>
  )
}

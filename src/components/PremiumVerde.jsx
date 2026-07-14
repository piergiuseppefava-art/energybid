import { useMemo } from 'react'
import { OFFERTE, FATTORE_EMISSIONI, PUN_RIFERIMENTO } from '../data/offerte'
import { calcCostoOfferta, fmt } from '../utils/calc'
import styles from './PremiumVerde.module.css'

export default function PremiumVerde({ inputs, t }) {
  const { consumoAnnuo } = inputs

  const analisi = useMemo(() => {
    const verdi = OFFERTE.filter(o => o.green)
    const nonVerdi = OFFERTE.filter(o => !o.green)

    if (!verdi.length || !nonVerdi.length) return null

    const miglioreVerde = verdi
      .map(o => ({ ...o, costoAnnuo: calcCostoOfferta(consumoAnnuo, o, PUN_RIFERIMENTO) }))
      .sort((a, b) => a.costoAnnuo - b.costoAnnuo)[0]

    const miglioreNonVerde = nonVerdi
      .map(o => ({ ...o, costoAnnuo: calcCostoOfferta(consumoAnnuo, o, PUN_RIFERIMENTO) }))
      .sort((a, b) => a.costoAnnuo - b.costoAnnuo)[0]

    const premiumAnno = miglioreVerde.costoAnnuo - miglioreNonVerde.costoAnnuo
    const premiumMese = premiumAnno / 12
    const co2Evitata = consumoAnnuo * FATTORE_EMISSIONI / 1000
    const costoPertCO2 = co2Evitata > 0 ? premiumAnno / co2Evitata : 0

    return { miglioreVerde, miglioreNonVerde, premiumMese, premiumAnno, co2Evitata, costoPertCO2 }
  }, [consumoAnnuo])

  if (!analisi) return null

  const { miglioreVerde, miglioreNonVerde, premiumMese, premiumAnno, co2Evitata, costoPertCO2 } = analisi
  const conveniente = premiumAnno < 500

  return (
    <div className={styles.wrap}>
      <div className={styles.cardTitle}>{t.title}</div>

      <div className={styles.confronto}>
        <div className={styles.offertaBox}>
          <div className={styles.offertaLabel}>{t.migliorVerde}</div>
          <div className={styles.offertaNome}>{miglioreVerde.nome}</div>
          <div className={styles.offertaPrezzo}>{fmt(miglioreVerde.costoAnnuo)} {t.perYear}</div>
          <div className={styles.offertaBadge} style={{ color: 'var(--green)', background: 'rgba(46,204,113,0.1)' }}>
            ✓ {t.verde}
          </div>
        </div>

        <div className={styles.vs}>vs</div>

        <div className={styles.offertaBox}>
          <div className={styles.offertaLabel}>{t.migliorStd}</div>
          <div className={styles.offertaNome}>{miglioreNonVerde.nome}</div>
          <div className={styles.offertaPrezzo}>{fmt(miglioreNonVerde.costoAnnuo)} {t.perYear}</div>
          <div className={styles.offertaBadge} style={{ color: 'var(--text3)', background: 'var(--bg3)' }}>
            ◆ {t.standard}
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

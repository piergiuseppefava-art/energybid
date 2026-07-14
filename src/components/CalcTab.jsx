import { calcCostoAttuale, calcCostoRiferimentoPun, fmt, fmtSign, monthLabel } from '../utils/calc'
import { FATTORE_EMISSIONI, PUN_RIFERIMENTO } from '../data/offerte'
import BollettaUpload from './BollettaUpload'
import styles from './CalcTab.module.css'

function MetricCard({ label, value, sub, highlight }) {
  return (
    <div className={styles.metric}>
      <div className={styles.mlabel}>{label}</div>
      <div className={styles.mval} style={highlight ? { color: highlight } : {}}>
        {value}
      </div>
      {sub && <div className={styles.msub}>{sub}</div>}
    </div>
  )
}

function CompareBar({ label, attualeCost, punCost }) {
  const max = Math.max(attualeCost, punCost, 0.01)
  const pctA = Math.round((attualeCost / max) * 100)
  const pctP = Math.round((punCost / max) * 100)
  return (
    <div className={styles.barRow}>
      <span className={styles.barLabel}>{label}</span>
      <div className={styles.bars}>
        <div className={styles.track}>
          <div className={styles.fillA} style={{ width: `${pctA}%` }} />
        </div>
        <div className={styles.track}>
          <div className={styles.fillP} style={{ width: `${pctP}%` }} />
        </div>
      </div>
      <span className={styles.barVal}>
        {fmt(attualeCost)} / {fmt(punCost)} €
      </span>
    </div>
  )
}

export default function CalcTab({ inputs, setInputs, onSave, onBollettaEstratta, t, tUpload }) {
  const setNum = (k) => (e) => setInputs((p) => ({ ...p, [k]: parseFloat(e.target.value) || 0 }))
  const setPod = (e) => setInputs((p) => ({ ...p, numeroPod: e.target.value }))

  function toggleFasceAvanzate() {
    setInputs((p) => {
      if (!p.fasceAvanzate) {
        return { ...p, fasceAvanzate: true, consumoAnnuo: p.f1 + p.f2 + p.f3 }
      }
      return { ...p, fasceAvanzate: false }
    })
  }

  function setFascia(k) {
    return (e) => {
      const val = parseFloat(e.target.value) || 0
      setInputs((p) => {
        const next = { ...p, [k]: val }
        next.consumoAnnuo = next.f1 + next.f2 + next.f3
        return next
      })
    }
  }

  function handleDatiEstratti(dati) {
    setInputs((p) => {
      const f1 = dati.f1 ?? p.f1
      const f2 = dati.f2 ?? p.f2
      const f3 = dati.f3 ?? p.f3
      return {
        ...p,
        fasceAvanzate: true,
        f1, f2, f3,
        consumoAnnuo: f1 + f2 + f3,
        prezzoAttuale: dati.pc || p.prezzoAttuale,
      }
    })
    onBollettaEstratta?.(dati)
  }

  const { consumoAnnuo, fasceAvanzate, f1, f2, f3, prezzoAttuale, quotaFissaAttuale, numeroPod } = inputs

  const cCurr = calcCostoAttuale(consumoAnnuo, prezzoAttuale, quotaFissaAttuale)
  const cPun = calcCostoRiferimentoPun(consumoAnnuo, PUN_RIFERIMENTO)
  const deltaAnno = cCurr - cPun

  const co2AnnoKg = consumoAnnuo * FATTORE_EMISSIONI
  const co2AnnoTon = co2AnnoKg / 1000
  const co2MeseKg = co2AnnoKg / 12

  const statusColor = Math.abs(deltaAnno) < 70 ? 'var(--text2)' : deltaAnno > 0 ? 'var(--green)' : 'var(--red)'
  const statusLabel = Math.abs(deltaAnno) < 70 ? t.tariffeSim : deltaAnno > 0 ? t.risparmio : t.conveniente

  return (
    <div className={styles.wrap}>
      <div className={styles.inputSection}>
        <div className={styles.sectionTitle}>{t.upload}</div>
        <BollettaUpload onDatiEstratti={handleDatiEstratti} t={tUpload} />

        <div className={styles.divider} />
        <div className={styles.sectionTitle}>{t.consumoTitle}</div>

        <button
          className={`${styles.toggleBtn} ${fasceAvanzate ? styles.toggleActive : ''}`}
          onClick={toggleFasceAvanzate}
        >
          {fasceAvanzate ? '✓' : '○'} {t.fasceToggle}
        </button>

        {fasceAvanzate ? (
          <>
            <div className={styles.grid3}>
              {[
                { id: 'f1', label: t.f1, sub: t.f1sub, val: f1 },
                { id: 'f2', label: t.f2, sub: t.f2sub, val: f2 },
                { id: 'f3', label: t.f3, sub: t.f3sub, val: f3 },
              ].map((field) => (
                <div key={field.id} className={styles.field}>
                  <label>{field.label}<span className={styles.fsub}>{field.sub}</span></label>
                  <div className={styles.inputWrap}>
                    <input type="number" value={field.val} min={0} onChange={setFascia(field.id)} />
                    <span className={styles.unit}>kWh</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.hint}>{t.fasceToggleOn}</div>
            <div className={styles.field}>
              <label>{t.consumoAnnuo}</label>
              <div className={styles.readonlyBox}>{Math.round(consumoAnnuo)} kWh</div>
            </div>
          </>
        ) : (
          <div className={styles.field}>
            <label>{t.consumoAnnuo}</label>
            <div className={styles.inputWrap}>
              <input type="number" value={consumoAnnuo} min={0} onChange={setNum('consumoAnnuo')} />
              <span className={styles.unit}>kWh</span>
            </div>
          </div>
        )}

        <div className={styles.divider} />
        <div className={styles.sectionTitle}>{t.contrattoTitle}</div>
        <div className={styles.grid3}>
          <div className={styles.field}>
            <label>{t.prezzoAttuale}</label>
            <div className={styles.inputWrap}>
              <input type="number" value={prezzoAttuale} step="0.001" onChange={setNum('prezzoAttuale')} />
              <span className={styles.unit}>€/kWh</span>
            </div>
          </div>
          <div className={styles.field}>
            <label>{t.quotaFissaAttuale}</label>
            <div className={styles.inputWrap}>
              <input type="number" value={quotaFissaAttuale} step="1" onChange={setNum('quotaFissaAttuale')} />
              <span className={styles.unit}>€/anno</span>
            </div>
          </div>
          <div className={styles.field}>
            <label>{t.punRiferimentoLabel}</label>
            <div className={styles.readonlyBox}>{PUN_RIFERIMENTO} €/kWh</div>
          </div>
        </div>

        <div className={styles.divider} />
        <div className={styles.sectionTitle}>{t.podTitle}</div>
        <div className={styles.field}>
          <label>{t.pod}<span className={styles.fsub}>{t.podSub}</span></label>
          <input type="text" value={numeroPod} onChange={setPod} placeholder="IT001Exxxxxxxxx" />
        </div>

        <div className={styles.divider} />
        <div className={styles.sectionTitle}>{t.co2}</div>
        <div className={styles.co2Box}>
          <div className={styles.co2Row}>
            <span className={styles.co2Label}>{t.co2Anno}</span>
            <span className={styles.co2Val}>{fmt(co2AnnoTon, 2)} <span className={styles.co2Unit}>tCO₂</span></span>
          </div>
          <div className={styles.co2Row}>
            <span className={styles.co2Label}>{t.co2Mese}</span>
            <span className={styles.co2Val}>{fmt(co2MeseKg, 1)} <span className={styles.co2Unit}>kgCO₂</span></span>
          </div>
          <div className={styles.co2Note}>{t.co2Note}</div>
        </div>
      </div>

      <div className={styles.resultSection}>
        <div className={styles.statusBar} style={{ borderColor: statusColor, color: statusColor }}>
          {statusLabel}
        </div>
        <div className={styles.grid3}>
          <MetricCard label={t.costoAttualeAnno} value={`${fmt(cCurr)} €`} sub={`${Math.round(consumoAnnuo)} ${t.kwhTotali}`} />
          <MetricCard label={t.costoPunAnno} value={`${fmt(cPun)} €`} sub={`${t.fonte} ${PUN_RIFERIMENTO} €/kWh`} />
          <MetricCard label={t.diffAnno} value={`${fmtSign(deltaAnno)} €`} sub={fmtSign(deltaAnno / 12) + ' € / mese'} highlight={statusColor} />
        </div>

        <div className={styles.barsSection}>
          <div className={styles.barsLegend}>
            {t.legend} <span style={{ color: '#4a9eff' }}>■</span> {t.attuale} vs <span style={{ color: '#2ecc71' }}>■</span> {t.pun}
          </div>
          <CompareBar label={t.kwhTotali} attualeCost={cCurr} punCost={cPun} />
        </div>

        <div className={styles.note}>{t.note}</div>

        <button className={styles.saveBtn} onClick={onSave}>
          {t.salva(monthLabel())}
        </button>
      </div>
    </div>
  )
}

import { calcCurrentCost, calcPunCost, calcPunF2, fmt, fmtSign, monthLabel } from '../utils/calc'
import { FATTORE_EMISSIONI } from '../data/offerte'
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

function FasciaBar({ label, currentCost, punCost, max }) {
  const pctA = max > 0 ? Math.round((currentCost / max) * 100) : 0
  const pctP = max > 0 ? Math.round((punCost / max) * 100) : 0
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
        {fmt(currentCost)} / {fmt(punCost)} €
      </span>
    </div>
  )
}

export default function CalcTab({ inputs, setInputs, onSave, onBollettaEstratta, t, tUpload }) {
  const set = (k) => (e) => setInputs((p) => ({ ...p, [k]: parseFloat(e.target.value) || 0 }))

  function handleDatiEstratti(dati) {
    setInputs((p) => ({
      ...p,
      f1: dati.f1 || p.f1,
      f2: dati.f2 || p.f2,
      f3: dati.f3 || p.f3,
      pc: dati.pc || p.pc,
    }))
    onBollettaEstratta?.(dati)
  }

  const { f1, f2, f3, pc, pf1, pf3 } = inputs
  const pf2 = calcPunF2(pf1, pf3)
  const cCurr = calcCurrentCost(inputs)
  const cPun = calcPunCost(inputs)
  const deltaM = cCurr - cPun
  const deltaY = deltaM * 12
  const totKwh = f1 + f2 + f3
  const co2Mese = totKwh * FATTORE_EMISSIONI
  const co2Anno = co2Mese * 12

  const fasciaData = [
    { label: 'F1', ca: f1 * pc, cp: f1 * pf1 },
    { label: 'F2', ca: f2 * pc, cp: f2 * pf2 },
    { label: 'F3', ca: f3 * pc, cp: f3 * pf3 },
  ]
  const maxBar = Math.max(...fasciaData.map((b) => Math.max(b.ca, b.cp)), 0.01)

  const statusColor = Math.abs(deltaY) < 6 ? 'var(--text2)' : deltaY > 0 ? 'var(--green)' : 'var(--red)'
  const statusLabel = Math.abs(deltaM) < 0.5 ? t.tariffeSim : deltaM > 0 ? t.risparmio : t.conveniente

  return (
    <div className={styles.wrap}>
      <div className={styles.inputSection}>
        <div className={styles.sectionTitle}>{t.upload}</div>
        <BollettaUpload onDatiEstratti={handleDatiEstratti} t={tUpload} />

        <div className={styles.divider} />
        <div className={styles.sectionTitle}>{t.consumi}</div>
        <div className={styles.grid3}>
          {[
            { id: 'f1', label: t.f1, sub: t.f1sub, val: f1 },
            { id: 'f2', label: t.f2, sub: t.f2sub, val: f2 },
            { id: 'f3', label: t.f3, sub: t.f3sub, val: f3 },
          ].map((field) => (
            <div key={field.id} className={styles.field}>
              <label>{field.label}<span className={styles.fsub}>{field.sub}</span></label>
              <div className={styles.inputWrap}>
                <input type="number" value={field.val} min={0} onChange={set(field.id)} />
                <span className={styles.unit}>kWh</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.divider} />
        <div className={styles.sectionTitle}>{t.tariffe}</div>
        <div className={styles.grid3}>
          {[
            { id: 'pc', label: t.contratto, val: pc, step: '0.001' },
            { id: 'pf1', label: t.punF1, val: pf1, step: '0.001' },
            { id: 'pf3', label: t.punF3, val: pf3, step: '0.001' },
          ].map((field) => (
            <div key={field.id} className={styles.field}>
              <label>{field.label}</label>
              <div className={styles.inputWrap}>
                <input type="number" value={field.val} step={field.step} onChange={set(field.id)} />
                <span className={styles.unit}>€/kWh</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.divider} />
        <div className={styles.sectionTitle}>{t.co2}</div>
        <div className={styles.co2Box}>
          <div className={styles.co2Row}>
            <span className={styles.co2Label}>{t.co2Mese}</span>
            <span className={styles.co2Val}>{fmt(co2Mese, 1)} <span className={styles.co2Unit}>kgCO₂</span></span>
          </div>
          <div className={styles.co2Row}>
            <span className={styles.co2Label}>{t.co2Anno}</span>
            <span className={styles.co2Val}>{fmt(co2Anno / 1000, 2)} <span className={styles.co2Unit}>tCO₂</span></span>
          </div>
          <div className={styles.co2Note}>{t.co2Note}</div>
        </div>
      </div>

      <div className={styles.resultSection}>
        <div className={styles.statusBar} style={{ borderColor: statusColor, color: statusColor }}>
          {statusLabel}
        </div>
        <div className={styles.grid3}>
          <MetricCard label={t.costoMese} value={`${fmt(cCurr)} €`} sub={`${Math.round(totKwh)} ${t.kwhTotali}`} />
          <MetricCard label={t.costoPun} value={`${fmt(cPun)} €`} sub={`${t.punF2}: ${fmt(pf2, 3)} €/kWh`} />
          <MetricCard label={t.diffAnno} value={`${fmtSign(deltaY)} €`} sub={`${fmtSign(deltaM)} € / mese`} highlight={statusColor} />
        </div>

        <div className={styles.barsSection}>
          <div className={styles.barsLegend}>
            {t.legend} <span style={{ color: '#4a9eff' }}>■</span> {t.attuale} vs <span style={{ color: '#2ecc71' }}>■</span> {t.pun}
          </div>
          {fasciaData.map((b) => (
            <FasciaBar key={b.label} label={b.label} currentCost={b.ca} punCost={b.cp} max={maxBar} />
          ))}
        </div>

        <div className={styles.note}>{t.note}</div>

        <button className={styles.saveBtn} onClick={onSave}>
          {t.salva(monthLabel())}
        </button>
      </div>
    </div>
  )
}

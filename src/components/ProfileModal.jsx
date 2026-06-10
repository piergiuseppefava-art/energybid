import { useState, useEffect } from 'react'
import { useOrganization } from '../store/organization.store'
import ConfirmModal from './ConfirmModal'
import styles from './ProfileModal.module.css'

// Valori identici a Onboarding.jsx
const SETTORI_ATECO = [
  { code: 'C', label: 'Manifattura' },
  { code: 'G', label: 'Commercio' },
  { code: 'I', label: 'Ristorazione e ricettività' },
  { code: 'F', label: 'Costruzioni' },
  { code: 'M', label: 'Servizi professionali' },
  { code: 'H', label: 'Trasporti e logistica' },
  { code: 'J', label: 'Servizi informatici' },
  { code: 'altro', label: 'Altro' },
]

const FASCE_DIPENDENTI = [
  { val: 5, label: '1–9' },
  { val: 25, label: '10–49' },
  { val: 100, label: '50–249' },
  { val: 500, label: '250+' },
]

export default function ProfileModal({ isOpen, onClose, onResetAll, t }) {
  const [org, store] = useOrganization()
  const [draft, setDraft] = useState({
    nome: '',
    partitaIva: '',
    settoreAteco: '',
    numeroDipendenti: null,
  })
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setDraft({
        nome: org.nome || '',
        partitaIva: org.partitaIva || '',
        settoreAteco: org.settoreAteco || '',
        numeroDipendenti: org.numeroDipendenti || null,
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleSave() {
    store.setIdentita(draft)
    onClose()
  }

  const canSave = draft.nome.trim().length > 0

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>{t.title}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>{t.nome}</label>
            <input
              type="text"
              value={draft.nome}
              onChange={e => setDraft(d => ({ ...d, nome: e.target.value }))}
              placeholder="es. Acme S.r.l."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.piva}</label>
            <input
              type="text"
              value={draft.partitaIva}
              onChange={e => setDraft(d => ({ ...d, partitaIva: e.target.value }))}
              placeholder="es. IT12345678901"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.settore}</label>
            <select
              className={styles.select}
              value={draft.settoreAteco}
              onChange={e => setDraft(d => ({ ...d, settoreAteco: e.target.value }))}
            >
              <option value="">—</option>
              {SETTORI_ATECO.map(s => (
                <option key={s.code} value={s.code}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.dipendenti}</label>
            <select
              className={styles.select}
              value={draft.numeroDipendenti ?? ''}
              onChange={e => setDraft(d => ({
                ...d,
                numeroDipendenti: e.target.value ? parseInt(e.target.value, 10) : null,
              }))}
            >
              <option value="">—</option>
              {FASCE_DIPENDENTI.map(f => (
                <option key={f.val} value={f.val}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>{t.cancel}</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={!canSave}>
            {t.save}
          </button>
        </div>

        <div className={styles.dangerZone}>
          <div className={styles.dangerTitle}>{t.dangerZone}</div>
          <button className={styles.resetBtn} onClick={() => setConfirmReset(true)}>
            {t.resetBtn}
          </button>
        </div>

        <ConfirmModal
          isOpen={confirmReset}
          message={t.resetConfirm}
          onConfirm={() => { setConfirmReset(false); onResetAll() }}
          onCancel={() => setConfirmReset(false)}
          confirmLabel={t.resetBtn}
          cancelLabel={t.cancel}
        />
      </div>
    </div>
  )
}

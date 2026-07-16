import { useState, useEffect, useId, useRef } from 'react'
import { useOrganization } from '../store/organization.store'
import { isValidPartitaIva } from '../utils/validation'
import { SETTORI_ATECO, FASCE_DIPENDENTI } from '../data/azienda-options'
import { useFocusTrap } from '../hooks/useFocusTrap'
import ConfirmModal from './ConfirmModal'
import styles from './ProfileModal.module.css'

export default function ProfileModal({ isOpen, onClose, onResetAll, t }) {
  const [org, store] = useOrganization()
  const [draft, setDraft] = useState({
    nome: '',
    partitaIva: '',
    settoreAteco: '',
    numeroDipendenti: null,
  })
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmImport, setConfirmImport] = useState(false)
  const [pendingImport, setPendingImport] = useState(null)
  const [importError, setImportError] = useState(null)
  const importInputRef = useRef()
  const panelRef = useRef(null)
  const titleId = useId()
  useFocusTrap(panelRef, isOpen)

  useEffect(() => {
    if (isOpen) {
      setDraft({
        nome: org.nome || '',
        partitaIva: org.partitaIva || '',
        settoreAteco: org.settoreAteco || '',
        numeroDipendenti: org.numeroDipendenti || null,
      })
      setImportError(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function handleKey(e) {
      if (e.key === 'Escape' && !confirmReset && !confirmImport) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose, confirmReset, confirmImport])

  if (!isOpen) return null

  function handleSave() {
    store.setIdentita(draft)
    onClose()
  }

  function handleExport() {
    const backup = {
      _version: 1,
      _exportedAt: new Date().toISOString(),
      eb_organization: JSON.parse(localStorage.getItem('eb_organization') || 'null'),
      eb_inputs: JSON.parse(localStorage.getItem('eb_inputs') || 'null'),
      eb_history: JSON.parse(localStorage.getItem('eb_history') || '[]'),
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `energybid-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    setImportError(null)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (typeof data._version !== 'number' || !data.eb_organization?.id) {
          setImportError(t.importError)
          return
        }
        setPendingImport(data)
        setConfirmImport(true)
      } catch {
        setImportError(t.importError)
      }
    }
    reader.readAsText(file)
  }

  function executeImport() {
    if (!pendingImport) return
    if (pendingImport.eb_organization) localStorage.setItem('eb_organization', JSON.stringify(pendingImport.eb_organization))
    if (pendingImport.eb_inputs)       localStorage.setItem('eb_inputs',       JSON.stringify(pendingImport.eb_inputs))
    if (pendingImport.eb_history)      localStorage.setItem('eb_history',      JSON.stringify(pendingImport.eb_history))
    window.location.reload()
  }

  const canSave = draft.nome.trim().length > 0

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <span id={titleId} className={styles.title}>{t.title}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label={t.close}>✕</button>
        </div>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>{t.nome}</label>
            <input
              type="text"
              value={draft.nome}
              onChange={e => setDraft(d => ({ ...d, nome: e.target.value }))}
              placeholder={t.nomePh}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t.piva}</label>
            <input
              type="text"
              value={draft.partitaIva}
              onChange={e => setDraft(d => ({ ...d, partitaIva: e.target.value }))}
              placeholder={t.pivaPh}
            />
            {draft.partitaIva && !isValidPartitaIva(draft.partitaIva) && (
              <p className={styles.fieldError}>{t.pivaError}</p>
            )}
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

        <div className={styles.backupZone}>
          <div className={styles.backupTitle}>{t.backupTitle}</div>
          <div className={styles.backupBtns}>
            <button className={styles.exportBtn} onClick={handleExport}>
              {t.exportBtn}
            </button>
            <button className={styles.importBtn} onClick={() => importInputRef.current.click()}>
              {t.importBtn}
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
          </div>
          {importError && <div className={styles.importError}>{importError}</div>}
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

        <ConfirmModal
          isOpen={confirmImport}
          message={t.importConfirm}
          onConfirm={() => { setConfirmImport(false); executeImport() }}
          onCancel={() => { setConfirmImport(false); setPendingImport(null) }}
          confirmLabel={t.importBtn}
          cancelLabel={t.cancel}
        />
      </div>
    </div>
  )
}

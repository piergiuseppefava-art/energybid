import { useState, useRef } from 'react'
import claudeClient from '../services/claude.client'
import styles from './BollettaUpload.module.css'

export default function BollettaUpload({ onDatiEstratti, t }) {
  const [stato, setStato] = useState('idle')
  const [errore, setErrore] = useState(null)
  const [datiEstratti, setDatiEstratti] = useState(null)
  const inputRef = useRef()

  const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

  async function handleFile(file) {
    if (!file || !ACCEPTED_TYPES.includes(file.type)) {
      setErrore(t.error)
      return
    }
    setStato('caricamento')
    setErrore(null)
    setDatiEstratti(null)

    try {
      const base64 = await toBase64(file)
      const dati = await claudeClient.extractBolletta(base64, file.type)

      const totale = dati.f1 + dati.f2 + dati.f3
      if (totale === 0) throw new Error('Nessun consumo trovato nella bolletta.')

      setDatiEstratti(dati)
      onDatiEstratti(dati)
      setStato('successo')
    } catch (e) {
      console.error('Errore:', e)
      setErrore(`${e.message}`)
      setStato('idle')
    }
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.dropzone} ${stato === 'caricamento' ? styles.loading : ''} ${stato === 'successo' ? styles.success : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => stato === 'idle' && inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {stato === 'idle' && (
          <>
            <div className={styles.icon}>⤓</div>
            <div className={styles.label}>{t.label}</div>
            <div className={styles.sub}>{t.sub}</div>
          </>
        )}
        {stato === 'caricamento' && (
          <>
            <div className={styles.spinner} />
            <div className={styles.label}>{t.loading}</div>
            <div className={styles.sub}>{t.loadingSub}</div>
          </>
        )}
        {stato === 'successo' && datiEstratti && (
          <>
            <div className={styles.icon} style={{ color: 'var(--green)' }}>✓</div>
            <div className={styles.label} style={{ color: 'var(--green)' }}>
              {t.success(datiEstratti.fornitore, datiEstratti.periodo)}
            </div>
            <div className={styles.riepilogo}>
              <span>F1: <strong>{datiEstratti.f1} kWh</strong></span>
              <span>F2: <strong>{datiEstratti.f2} kWh</strong></span>
              <span>F3: <strong>{datiEstratti.f3} kWh</strong></span>
              <span>€/kWh: <strong>{datiEstratti.pc}</strong></span>
            </div>
            <div
              className={styles.sub}
              onClick={(e) => { e.stopPropagation(); setStato('idle'); setDatiEstratti(null) }}
              style={{ cursor: 'pointer', textDecoration: 'underline', marginTop: 8 }}
            >
              {t.another}
            </div>
          </>
        )}
      </div>
      {errore && <div className={styles.errore}>{errore}</div>}
      <div className={styles.disclaimerUpload}>{t.disclaimer}</div>
    </div>
  )
}

import { useState } from 'react'
import store from '../store/organization.store'
import { T } from '../i18n'
import { isValidPartitaIva } from '../utils/validation'
import { SETTORI_ATECO, FASCE_DIPENDENTI } from '../data/azienda-options'
import styles from './Onboarding.module.css'

export default function Onboarding({ onComplete, lang }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    nome: '',
    partitaIva: '',
    settoreAteco: '',
    numeroDipendenti: null,
  })

  const t = T[lang].onboarding

  const totalSteps = 4
  const canProceed = {
    1: data.nome.trim().length > 0,
    2: true,
    3: data.settoreAteco !== '',
    4: data.numeroDipendenti !== null,
  }

  function handleFinish() {
    store.setIdentita(data)
    onComplete()
  }

  function handleSkip() {
    store.setIdentita({ nome: 'Demo', partitaIva: '', settoreAteco: 'altro', numeroDipendenti: 25 })
    onComplete()
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.grid} />
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.logo}>⚡ EnergyBid</span>
          <span className={styles.progress}>{step} {t.of} {totalSteps}</span>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        {step === 1 && (
          <>
            <h1 className={styles.title}>{t.title}</h1>
            <p className={styles.subtitle}>{t.subtitle}</p>
            <div className={styles.field}>
              <label>{t.step1}</label>
              <input
                type="text"
                value={data.nome}
                onChange={(e) => setData({ ...data, nome: e.target.value })}
                placeholder={t.step1ph}
                autoFocus
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className={styles.title}>{t.step2}</h1>
            <div className={styles.field}>
              <input
                type="text"
                value={data.partitaIva}
                onChange={(e) => setData({ ...data, partitaIva: e.target.value })}
                placeholder={t.step2ph}
                autoFocus
              />
              {data.partitaIva && !isValidPartitaIva(data.partitaIva) && (
                <p className={styles.fieldError}>{t.step2err}</p>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className={styles.title}>{t.step3}</h1>
            <div className={styles.options}>
              {SETTORI_ATECO.map(s => (
                <button
                  key={s.code}
                  className={`${styles.option} ${data.settoreAteco === s.code ? styles.optionActive : ''}`}
                  onClick={() => setData({ ...data, settoreAteco: s.code })}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className={styles.title}>{t.step4}</h1>
            <div className={styles.options}>
              {FASCE_DIPENDENTI.map(f => (
                <button
                  key={f.val}
                  className={`${styles.option} ${data.numeroDipendenti === f.val ? styles.optionActive : ''}`}
                  onClick={() => setData({ ...data, numeroDipendenti: f.val })}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </>
        )}

        <div className={styles.actions}>
          {step > 1 && (
            <button className={styles.backBtn} onClick={() => setStep(step - 1)}>
              {t.back}
            </button>
          )}
          {step < totalSteps && (
            <button
              className={styles.nextBtn}
              onClick={() => setStep(step + 1)}
              disabled={!canProceed[step]}
            >
              {t.next}
            </button>
          )}
          {step === totalSteps && (
            <button
              className={styles.finishBtn}
              onClick={handleFinish}
              disabled={!canProceed[step]}
            >
              {t.finish}
            </button>
          )}
        </div>

        <button className={styles.skip} onClick={handleSkip}>
          {t.skip}
        </button>
      </div>
    </div>
  )
}

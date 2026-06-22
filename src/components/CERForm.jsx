import { useState } from 'react'
import { useOrganization } from '../store/organization.store'
import styles from './CERForm.module.css'

const LEGAL_FORM_VALS = ['associazione', 'cooperativa', 'consorzio', 'altro']
const PLANT_TYPE_ICONS = { fotovoltaico: '☀', eolico: '◎', idroelettrico: '≋', biogas: '◯', misto: '⊕' }
const PLANT_TYPE_VALS = Object.keys(PLANT_TYPE_ICONS)

export default function CERForm({ onCreated, onCancel, t }) {
  const [, store] = useOrganization()
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    nome: '',
    formaGiuridica: 'associazione',
    indirizzoSede: '',
    cap: '',
    provincia: '',
    cabinaPrimaria: '',
    potenzaTotaleKw: 0,
    tipologiaImpianto: 'fotovoltaico',
    numeroMembri: 1,
  })

  const totalSteps = 4
  const canProceed = {
    1: data.nome.trim().length > 0 && data.formaGiuridica,
    2: data.indirizzoSede && data.cap && data.provincia,
    3: data.cabinaPrimaria && data.potenzaTotaleKw > 0,
    4: data.numeroMembri >= 1 && data.tipologiaImpianto,
  }

  function handleFinish() {
    const cer = store.addCER(data)
    onCreated(cer)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onCancel}>← {t.cancel}</button>
          <span className={styles.progress}>{t.step} {step}/{totalSteps}</span>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        {step === 1 && (
          <>
            <h2 className={styles.title}>{t.formStep1Title}</h2>
            <p className={styles.subtitle}>{t.formStep1Sub}</p>
            <div className={styles.field}>
              <label>{t.cerName}</label>
              <input
                type="text"
                value={data.nome}
                onChange={(e) => setData({ ...data, nome: e.target.value })}
                placeholder={t.cerNamePh}
                autoFocus
              />
            </div>
            <div className={styles.field}>
              <label>{t.legalForm}</label>
              <div className={styles.options}>
                {LEGAL_FORM_VALS.map(val => (
                  <button
                    key={val}
                    className={`${styles.option} ${data.formaGiuridica === val ? styles.optionActive : ''}`}
                    onClick={() => setData({ ...data, formaGiuridica: val })}
                  >
                    {t.legalForms[val]}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className={styles.title}>{t.formStep2Title}</h2>
            <p className={styles.subtitle}>{t.formStep2Sub}</p>
            <div className={styles.field}>
              <label>{t.address}</label>
              <input
                type="text"
                value={data.indirizzoSede}
                onChange={(e) => setData({ ...data, indirizzoSede: e.target.value })}
                placeholder={t.addressPh}
                autoFocus
              />
            </div>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label>{t.cap}</label>
                <input
                  type="text"
                  value={data.cap}
                  onChange={(e) => setData({ ...data, cap: e.target.value })}
                  placeholder="20100"
                  maxLength={5}
                />
              </div>
              <div className={styles.field}>
                <label>{t.province}</label>
                <input
                  type="text"
                  value={data.provincia}
                  onChange={(e) => setData({ ...data, provincia: e.target.value.toUpperCase() })}
                  placeholder="MI"
                  maxLength={2}
                />
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className={styles.title}>{t.formStep3Title}</h2>
            <p className={styles.subtitle}>{t.formStep3Sub}</p>
            <div className={styles.field}>
              <label>{t.cabin}</label>
              <input
                type="text"
                value={data.cabinaPrimaria}
                onChange={(e) => setData({ ...data, cabinaPrimaria: e.target.value })}
                placeholder={t.cabinPh}
                autoFocus
              />
            </div>
            <div className={styles.field}>
              <label>{t.power}</label>
              <input
                type="number"
                value={data.potenzaTotaleKw}
                onChange={(e) => setData({ ...data, potenzaTotaleKw: parseFloat(e.target.value) || 0 })}
                placeholder="100"
                min={0}
                step={0.1}
              />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className={styles.title}>{t.formStep4Title}</h2>
            <p className={styles.subtitle}>{t.formStep4Sub}</p>
            <div className={styles.field}>
              <label>{t.plantType}</label>
              <div className={styles.options}>
                {PLANT_TYPE_VALS.map(val => (
                  <button
                    key={val}
                    className={`${styles.option} ${data.tipologiaImpianto === val ? styles.optionActive : ''}`}
                    onClick={() => setData({ ...data, tipologiaImpianto: val })}
                  >
                    {PLANT_TYPE_ICONS[val]} {t.plantTypes[val]}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label>{t.members}</label>
              <input
                type="number"
                value={data.numeroMembri}
                onChange={(e) => setData({ ...data, numeroMembri: parseInt(e.target.value) || 1 })}
                placeholder="10"
                min={1}
              />
            </div>
          </>
        )}

        <div className={styles.actions}>
          {step > 1 && (
            <button className={styles.prevBtn} onClick={() => setStep(step - 1)}>
              ← {t.back}
            </button>
          )}
          {step < totalSteps && (
            <button
              className={styles.nextBtn}
              onClick={() => setStep(step + 1)}
              disabled={!canProceed[step]}
            >
              {t.next} →
            </button>
          )}
          {step === totalSteps && (
            <button
              className={styles.finishBtn}
              onClick={handleFinish}
              disabled={!canProceed[step]}
            >
              {t.createCER}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

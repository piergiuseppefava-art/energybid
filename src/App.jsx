import { useState } from 'react'
import './index.css'
import { useStorage } from './hooks/useStorage'
import { monthLabel } from './utils/calc'
import { T } from './i18n'
import { useOrganization } from './store/organization.store'
import Header from './components/Header'
import CalcTab from './components/CalcTab'
import CompareTab from './components/CompareTab'
import HistoryTab from './components/HistoryTab'
import CERTab from './components/CERTab'
import ESGTab from './components/ESGTab'
import MarketWatcherTab from './components/MarketWatcherTab'
import AlertContratto from './components/AlertContratto'
import Landing from './components/Landing'
import Disclaimer from './components/Disclaimer'
import Onboarding from './components/Onboarding'

const DEFAULT_INPUTS = { f1: 300, f2: 150, f3: 80, pc: 0.16, pf1: 0.1144, pf3: 0.095 }

export default function App() {
  const [showApp, setShowApp] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [lang, setLang] = useState('it')
  const [tab, setTab] = useState('calc')
  const [inputs, setInputs] = useStorage('eb_inputs', DEFAULT_INPUTS)
  const [history, setHistory] = useStorage('eb_history', [])
  const [savedMsg, setSavedMsg] = useState(false)
  const [org, store] = useOrganization()
  const t = T[lang]

  function handleEnterApp() {
    if (!org.id) setNeedsOnboarding(true)
    else setShowApp(true)
  }

  function handleOnboardingComplete() {
    setNeedsOnboarding(false)
    setShowApp(true)
  }

  function handleBollettaEstratta(dati) {
    const kwh = (dati.f1 || 0) + (dati.f2 || 0) + (dati.f3 || 0)
    store.addBolletta({ kwh, f1: dati.f1, f2: dati.f2, f3: dati.f3, pc: dati.pc, fornitore: dati.fornitore, periodo: dati.periodo })
  }

  function handleSave() {
    const { f1, f2, f3, pc, pf1, pf3 } = inputs
    const pf2 = (pf1 + pf3) / 2
    const cost = Math.round((f1 + f2 + f3) * pc * 100) / 100
    const pun = Math.round((f1 * pf1 + f2 * pf2 + f3 * pf3) * 100) / 100
    const kwh = Math.round(f1 + f2 + f3)
    setHistory((prev) => [
      { label: monthLabel(), cost, pun, kwh },
      ...prev.slice(0, 23),
    ])
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }

  if (needsOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} lang={lang} />
  }

  if (!showApp) {
    return <Landing onEntra={handleEnterApp} lang={lang} setLang={setLang} />
  }

  const showAlert = tab !== 'cer' && tab !== 'esg'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header tab={tab} setTab={setTab} onBack={() => setShowApp(false)} lang={lang} setLang={setLang} t={t.header} />
      {showAlert && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 2rem 0', width: '100%' }}>
          <AlertContratto inputs={inputs} t={t.alert} />
        </div>
      )}
      {savedMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          background: '#2ecc71', color: '#0d0d0d', padding: '10px 20px',
          borderRadius: 6, fontWeight: 700, fontSize: 13,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {t.saved}
        </div>
      )}
      <div style={{ flex: 1 }}>
        {tab === 'calc' && <CalcTab inputs={inputs} setInputs={setInputs} onSave={handleSave} onBollettaEstratta={handleBollettaEstratta} t={t.calc} tUpload={t.upload} />}
        {tab === 'compare' && <CompareTab inputs={inputs} t={t.compare} tPremium={t.premium} />}
        {tab === 'history' && <HistoryTab history={history} onClear={() => setHistory([])} t={t.history} />}
        {tab === 'cer' && <CERTab t={t.cer} lang={lang} />}
        {tab === 'esg' && <ESGTab t={t.esg} lang={lang} />}
        {tab === 'market' && <MarketWatcherTab />}
      </div>
      <Disclaimer t={t} lang={lang} />
    </div>
  )
}

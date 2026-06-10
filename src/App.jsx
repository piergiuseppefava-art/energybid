import { useState } from 'react'
import './index.css'
import { useStorage } from './hooks/useStorage'
import { monthLabel } from './utils/calc'
import { T } from './i18n'
import { useOrganization } from './store/organization.store'
import Header from './components/Header'
import Drawer from './components/Drawer'
import SubTabs from './components/SubTabs'
import CalcTab from './components/CalcTab'
import CompareTab from './components/CompareTab'
import HistoryTab from './components/HistoryTab'
import CERTab from './components/CERTab'
import ESGTab from './components/ESGTab'
import AlertContratto from './components/AlertContratto'
import Landing from './components/Landing'
import Disclaimer from './components/Disclaimer'
import Onboarding from './components/Onboarding'
import WelcomeHub from './components/WelcomeHub'
import ServiceSelector from './components/ServiceSelector'
import ProfileModal from './components/ProfileModal'

const DEFAULT_INPUTS = { f1: 300, f2: 150, f3: 80, pc: 0.16, pf1: 0.1144, pf3: 0.095 }

export default function App() {
  const [view, setView] = useState('landing')
  const [lang, setLang] = useState('it')
  const [modulo, setModulo] = useState('energybid')   // 'energybid' | 'cer' | 'esg'
  const [subTab, setSubTab] = useState('calc')         // 'calc' | 'compare' | 'history'
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [inputs, setInputs] = useStorage('eb_inputs', DEFAULT_INPUTS)
  const [history, setHistory] = useStorage('eb_history', [])
  const [savedMsg, setSavedMsg] = useState(false)
  const [org, store] = useOrganization()
  const t = T[lang]

  function handleEnterApp() {
    if (!org.id) setView('onboarding')
    else setView('selector')
  }

  function handleOnboardingComplete() {
    setView('welcome')
  }

  // Called from ServiceSelector (svcId: 'calc' | 'cer' | 'esg')
  // and from Drawer (same ids, from hub.selector.services)
  function handleSelectService(svcId) {
    if (svcId === 'calc') {
      setModulo('energybid')
      setSubTab('calc')
    } else if (svcId === 'cer') {
      setModulo('cer')
    } else if (svcId === 'esg') {
      setModulo('esg')
    }
    setView('app')
  }

  function handleResetAll() {
    store.reset()
    setHistory([])
    setInputs(DEFAULT_INPUTS)
    setProfileModalOpen(false)
    setView('landing')
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

  if (view === 'landing') {
    return <Landing onEntra={handleEnterApp} lang={lang} setLang={setLang} />
  }

  if (view === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} lang={lang} />
  }

  if (view === 'welcome') {
    return <WelcomeHub onContinue={() => setView('selector')} lang={lang} t={t.hub.welcome} />
  }

  if (view === 'selector') {
    return <ServiceSelector onSelect={handleSelectService} lang={lang} t={t.hub.selector} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header lang={lang} setLang={setLang} t={t.header} onMenuOpen={() => setDrawerOpen(true)} />
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        modulo={modulo}
        onSelectModulo={handleSelectService}
        onHome={() => setView('selector')}
        onOpenProfile={() => setProfileModalOpen(true)}
        t={t}
      />
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onResetAll={handleResetAll}
        t={t.profile}
      />
      {modulo === 'energybid' && (
        <>
          <SubTabs subTab={subTab} setSubTab={setSubTab} t={t.header} />
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 2rem 0', width: '100%' }}>
            <AlertContratto inputs={inputs} t={t.alert} />
          </div>
        </>
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
        {modulo === 'energybid' && subTab === 'calc' && (
          <CalcTab inputs={inputs} setInputs={setInputs} onSave={handleSave} onBollettaEstratta={handleBollettaEstratta} t={t.calc} tUpload={t.upload} />
        )}
        {modulo === 'energybid' && subTab === 'compare' && (
          <CompareTab inputs={inputs} t={t.compare} tPremium={t.premium} />
        )}
        {modulo === 'energybid' && subTab === 'history' && (
          <HistoryTab history={history} onClear={() => setHistory([])} t={t.history} />
        )}
        {modulo === 'cer' && <CERTab t={t.cer} lang={lang} />}
        {modulo === 'esg' && <ESGTab t={t.esg} lang={lang} />}
      </div>
      <Disclaimer t={t} lang={lang} />
    </div>
  )
}

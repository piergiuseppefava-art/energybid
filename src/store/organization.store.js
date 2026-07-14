/**
 * Organization Store
 * Stato globale dell'organizzazione loggata.
 * Tutti e tre i moduli (EnergyBid, CER Navigator, ESG) leggono da qui.
 */

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'eb_organization'

const DEFAULT_ORG = {
  // Identità
  id: null,
  nome: '',
  partitaIva: '',
  settoreAteco: '',
  numeroDipendenti: null,

  // Modulo EnergyBid
  bollette: [],
  contrattoAttuale: null,
  consumoAnnuoDichiarato: null,

  // Modulo CER Navigator
  cerAssociate: [],

  // Modulo ESG
  esg: {
    risposte: {},          // { indicatorId: value }
    score: null,           // { E: 75, S: 60, G: 80, total: 72, classe: 'B' }
    ultimoReport: null,    // { content, generatedAt }
    storico: [],           // [{ score, date }]
  },

  // Metadata
  createdAt: null,
  updatedAt: null,
}

class OrganizationStore {
  constructor() {
    this.listeners = new Set()
    this.state = this._load()
  }

  _load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = stored ? JSON.parse(stored) : DEFAULT_ORG
      // Migration: aggiungi esg se manca
      if (!parsed.esg) parsed.esg = DEFAULT_ORG.esg
      return parsed
    } catch {
      return DEFAULT_ORG
    }
  }

  _save() {
    this.state.updatedAt = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
    this._notify()
  }

  _notify() {
    this.listeners.forEach(fn => fn(this.state))
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  get() { return this.state }

  update(patch) {
    this.state = { ...this.state, ...patch }
    this._save()
  }

  setIdentita({ nome, partitaIva, settoreAteco, numeroDipendenti }) {
    this.update({
      id: this.state.id || this._generateId(),
      nome, partitaIva, settoreAteco, numeroDipendenti,
      createdAt: this.state.createdAt || new Date().toISOString(),
    })
  }

  // EnergyBid
  addBolletta(bolletta) {
    this.update({
      bollette: [bolletta, ...this.state.bollette].slice(0, 24),
    })
  }

  setConsumoAnnuoDichiarato(kwh) {
    this.update({ consumoAnnuoDichiarato: kwh })
  }

  // CER NAVIGATOR
  addCER(cer) {
    const newCER = {
      id: this._generateId(),
      nome: cer.nome,
      formaGiuridica: cer.formaGiuridica || 'associazione',
      cabinaPrimaria: cer.cabinaPrimaria || '',
      indirizzoSede: cer.indirizzoSede || '',
      provincia: cer.provincia || '',
      cap: cer.cap || '',
      potenzaTotaleKw: cer.potenzaTotaleKw || 0,
      tipologiaImpianto: cer.tipologiaImpianto || 'fotovoltaico',
      numeroMembri: cer.numeroMembri || 1,
      stato: 'in_costituzione',
      documentiGenerati: {
        statuto: null, regolamento: null,
        letteraDistributore: null, checklistGSE: null,
      },
      dataCreazione: new Date().toISOString(),
      dataCostituzione: null,
      ...cer,
    }
    this.update({
      cerAssociate: [...this.state.cerAssociate, newCER],
    })
    return newCER
  }

  updateCER(cerId, patch) {
    this.update({
      cerAssociate: this.state.cerAssociate.map(c =>
        c.id === cerId ? { ...c, ...patch } : c
      ),
    })
  }

  removeCER(cerId) {
    this.update({
      cerAssociate: this.state.cerAssociate.filter(c => c.id !== cerId),
    })
  }

  saveCERDocument(cerId, docType, content) {
    this.update({
      cerAssociate: this.state.cerAssociate.map(c =>
        c.id === cerId
          ? { ...c, documentiGenerati: { ...c.documentiGenerati, [docType]: { content, generatedAt: new Date().toISOString() } } }
          : c
      ),
    })
  }

  // ESG MODULE
  setESGAnswer(indicatorId, value) {
    this.update({
      esg: {
        ...this.state.esg,
        risposte: { ...this.state.esg.risposte, [indicatorId]: value },
      },
    })
  }

  setESGAnswers(answersObject) {
    this.update({
      esg: {
        ...this.state.esg,
        risposte: { ...this.state.esg.risposte, ...answersObject },
      },
    })
  }

  setESGScore(score) {
    const newSnapshot = { score, date: new Date().toISOString() }
    this.update({
      esg: {
        ...this.state.esg,
        score,
        storico: [newSnapshot, ...(this.state.esg.storico || [])].slice(0, 12),
      },
    })
  }

  setESGReport(content) {
    this.update({
      esg: {
        ...this.state.esg,
        ultimoReport: { content, generatedAt: new Date().toISOString() },
      },
    })
  }

  resetESG() {
    this.update({
      esg: { risposte: {}, score: null, ultimoReport: null, storico: [] },
    })
  }

  reset() {
    this.state = DEFAULT_ORG
    localStorage.removeItem(STORAGE_KEY)
    this._notify()
  }

  _generateId() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }
}

const store = new OrganizationStore()

export function useOrganization() {
  const [state, setState] = useState(store.get())
  useEffect(() => store.subscribe(setState), [])
  return [state, store]
}

export default store

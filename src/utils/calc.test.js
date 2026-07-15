import { describe, it, expect } from 'vitest'
import { calcCostoOfferta, calcCostoRiferimentoPun, calcCostoAttuale } from './calc.js'
import { OFFERTE, PUN_RIFERIMENTO } from '../data/offerte.js'

const offertaFissa = OFFERTE.find((o) => o.id === 'sorgenia-next-ebusiness')
const offertaIndicizzata = OFFERTE.find((o) => o.id === 'hera-prezzo-netto-impresa')

describe('calcCostoOfferta', () => {
  it('calcola il costo di un\'offerta fissa (Sorgenia Next E-Business)', () => {
    // 50000 * 0.1540 + 180 = 7880
    expect(calcCostoOfferta(50000, offertaFissa, PUN_RIFERIMENTO)).toBeCloseTo(7880, 5)
  })

  it('calcola il costo di un\'offerta indicizzata (Hera Prezzo Netto Impresa)', () => {
    // 50000 * (0.1195 + 0.0030) + 168 = 6293
    expect(calcCostoOfferta(50000, offertaIndicizzata, PUN_RIFERIMENTO)).toBeCloseTo(6293, 5)
  })

  it('scala correttamente con un consumo diverso (15000 kWh)', () => {
    // 15000 * 0.1540 + 180 = 2490
    expect(calcCostoOfferta(15000, offertaFissa, PUN_RIFERIMENTO)).toBeCloseTo(2490, 5)
  })

  it('con consumo 0 restituisce solo la quota fissa annua', () => {
    expect(calcCostoOfferta(0, offertaFissa, PUN_RIFERIMENTO)).toBe(offertaFissa.quotaFissaAnnua)
    expect(calcCostoOfferta(0, offertaIndicizzata, PUN_RIFERIMENTO)).toBe(offertaIndicizzata.quotaFissaAnnua)
  })
})

describe('calcCostoAttuale', () => {
  it('calcola il costo del contratto attuale con quota fissa', () => {
    // 50000 * 0.18 + 150 = 9150
    expect(calcCostoAttuale(50000, 0.18, 150)).toBeCloseTo(9150, 5)
  })
})

describe('calcCostoRiferimentoPun', () => {
  it('calcola il costo di riferimento al solo PUN', () => {
    // 50000 * 0.1195 = 5975
    expect(calcCostoRiferimentoPun(50000, PUN_RIFERIMENTO)).toBeCloseTo(5975, 5)
  })
})

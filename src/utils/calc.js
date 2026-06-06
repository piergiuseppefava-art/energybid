export function calcPunF2(pf1, pf3) {
  return (pf1 + pf3) / 2
}

export function calcCurrentCost({ f1, f2, f3, pc }) {
  return (f1 + f2 + f3) * pc
}

export function calcPunCost({ f1, f2, f3, pf1, pf3 }) {
  const pf2 = calcPunF2(pf1, pf3)
  return f1 * pf1 + f2 * pf2 + f3 * pf3
}

export function calcOfferCost({ f1, f2, f3, pf1, pf3 }, offer) {
  if (offer.price !== null && offer.price !== '') {
    return (f1 + f2 + f3) * parseFloat(offer.price)
  }
  return calcPunCost({ f1, f2, f3, pf1, pf3 })
}

export function fmt(n, d = 2) {
  return Number(n).toFixed(d).replace('.', ',')
}

export function fmtSign(n) {
  return (n >= 0 ? '+' : '') + fmt(n)
}

export function monthLabel(date = new Date()) {
  return date.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })
}

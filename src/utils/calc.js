export function calcCostoOfferta(consumoAnnuo, offerta, punRiferimento) {
  const prezzoEnergia = offerta.tipo === 'fissa'
    ? offerta.prezzoFisso
    : punRiferimento + offerta.spreadPun
  return consumoAnnuo * prezzoEnergia + offerta.quotaFissaAnnua
}

export function calcCostoRiferimentoPun(consumoAnnuo, punRiferimento) {
  return consumoAnnuo * punRiferimento
}

export function calcCostoAttuale(consumoAnnuo, prezzoAttuale, quotaFissaAttuale = 0) {
  return consumoAnnuo * prezzoAttuale + quotaFissaAttuale
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

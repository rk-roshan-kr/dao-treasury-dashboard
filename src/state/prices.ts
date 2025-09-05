import type { CryptoSymbol } from './cryptoStore'

type Listener = (prices: Record<CryptoSymbol, number>) => void

const LS_KEY = 'crypto_prices_v1'

function loadInitial(): Record<CryptoSymbol, number> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    BTC: 65000,
    ETH: 3300,
    USDT: 1,
    SOL: 150,
    BAT: 0.25,
    SEPOLIA_ETH: 13, // same as ETH for testing purposes
  }
}

class PricesStore {
  private prices: Record<CryptoSymbol, number> = loadInitial()
  private listeners: Set<Listener> = new Set()

  private persist() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(this.prices)) } catch {}
  }

  getAll(): Record<CryptoSymbol, number> { return { ...this.prices } }
  get(symbol: CryptoSymbol): number { return this.prices[symbol] ?? 0 }
  set(symbol: CryptoSymbol, usd: number) { this.prices[symbol] = usd; this.persist(); this.emit() }
  subscribe(l: Listener) { this.listeners.add(l); return () => this.listeners.delete(l) }
  private emit() { const snap = this.getAll(); this.listeners.forEach(l => l(snap)) }
}

export const prices = new PricesStore()

declare global { interface Window { cryptoPrices?: any } }
if (typeof window !== 'undefined') {
  window.cryptoPrices = {
    get: (s?: CryptoSymbol) => (s ? prices.get(s) : prices.getAll()),
    set: (s: CryptoSymbol, v: number) => prices.set(s, v),
  }
}



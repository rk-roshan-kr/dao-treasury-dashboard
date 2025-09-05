type Listener = (balance: number) => void

const LS_KEY = 'investment_wallet_balance_v1'

function loadInitial(): number {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return 0 // Default starting balance
}

class InvestmentWalletStore {
  private balance: number = loadInitial()
  private listeners: Set<Listener> = new Set()

  private persist() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(this.balance)) } catch {}
  }

  getBalance(): number {
    return this.balance
  }

  setBalance(amount: number) {
    this.balance = Math.max(0, amount)
    this.persist()
    this.emit()
  }

  add(amount: number) {
    this.balance += amount
    this.persist()
    this.emit()
  }

  subtract(amount: number) {
    this.balance = Math.max(0, this.balance - amount)
    this.persist()
    this.emit()
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit() {
    this.listeners.forEach((l) => l(this.balance))
  }
}

export const investmentWallet = new InvestmentWalletStore()

// Dev helper: allow backend/console to update investment balance
declare global { interface Window { investmentBalance?: any } }
if (typeof window !== 'undefined') {
  window.investmentBalance = {
    get: () => investmentWallet.getBalance(),
    set: (v: number) => investmentWallet.setBalance(v),
    add: (v: number) => investmentWallet.add(v),
    subtract: (v: number) => investmentWallet.subtract(v),
  }
}

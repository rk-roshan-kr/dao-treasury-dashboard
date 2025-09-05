export type CryptoSymbol = 'BTC' | 'ETH' | 'USDT' | 'SOL' | 'BAT' | 'SEPOLIA_ETH'

export interface CryptoBalance {
  symbol: CryptoSymbol
  amount: number
  price?: number
  value?: number
}

export interface Transaction {
  id: string
  type: 'buy' | 'sell' | 'send' | 'receive'
  symbol: CryptoSymbol
  amount: number
  price?: number
  timestamp: number
  description?: string
}

export interface PortfolioState {
  balances: Record<CryptoSymbol, number>
  transactions: Transaction[]
  totalValue: number
  lastUpdated: number
}

type Listener = (state: PortfolioState) => void
type BalanceListener = (balances: Record<CryptoSymbol, number>) => void
type TransactionListener = (transactions: Transaction[]) => void

const LS_KEY = 'crypto_portfolio_v2'
const TX_KEY = 'crypto_transactions_v2'

function loadInitial(): Record<CryptoSymbol, number> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  // Defaults: 4 famous + BAT + Sepolia ETH
  return {
    BTC: 0,
    ETH: 0,
    USDT: 0,
    SOL: 0,
    BAT: 0,
    SEPOLIA_ETH: 0,
  }
}

function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TX_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

class CryptoStore {
  private balances: Record<CryptoSymbol, number>
  private transactions: Transaction[]
  private listeners: Set<Listener> = new Set()
  private balanceListeners: Set<BalanceListener> = new Set()
  private transactionListeners: Set<TransactionListener> = new Set()

  constructor() {
    this.balances = loadInitial()
    this.transactions = loadTransactions()
  }

  private persist() {
    try { 
      localStorage.setItem(LS_KEY, JSON.stringify(this.balances))
      localStorage.setItem(TX_KEY, JSON.stringify(this.transactions))
    } catch {}
  }

  // Balance methods
  getAll(): Record<CryptoSymbol, number> {
    return { ...this.balances }
  }

  get(symbol: CryptoSymbol): number {
    return this.balances[symbol] ?? 0
  }

  set(symbol: CryptoSymbol, value: number) {
    const oldValue = this.balances[symbol] ?? 0
    this.balances[symbol] = Math.max(0, value)
    
    // Record transaction if there's a change
    if (oldValue !== this.balances[symbol]) {
      this.addTransaction({
        type: this.balances[symbol] > oldValue ? 'receive' : 'send',
        symbol,
        amount: Math.abs(this.balances[symbol] - oldValue),
        description: 'Manual balance update'
      })
    }
    
    this.persist()
    this.emit()
  }

  delta(symbol: CryptoSymbol, change: number, description?: string) {
    const oldValue = this.balances[symbol] ?? 0
    this.balances[symbol] = Math.max(0, oldValue + change)
    
    // Record transaction
    if (change !== 0) {
      this.addTransaction({
        type: change > 0 ? 'receive' : 'send',
        symbol,
        amount: Math.abs(change),
        description
      })
    }
    
    this.persist()
    this.emit()
  }

  // Transaction methods
  addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>) {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }
    
    this.transactions.unshift(newTransaction) // Add to beginning
    this.transactions = this.transactions.slice(0, 1000) // Keep last 1000 transactions
    
    this.persist()
    this.emit()
  }

  getTransactions(limit?: number): Transaction[] {
    return limit ? this.transactions.slice(0, limit) : [...this.transactions]
  }

  getTransactionsBySymbol(symbol: CryptoSymbol): Transaction[] {
    return this.transactions.filter(tx => tx.symbol === symbol)
  }

  // Portfolio value calculation
  calculateTotalValue(prices?: Record<CryptoSymbol, number>): number {
    if (!prices) return 0
    
    return Object.entries(this.balances).reduce((total, [symbol, amount]) => {
      const price = prices[symbol as CryptoSymbol] || 0
      return total + (amount * price)
    }, 0)
  }

  // Subscription methods
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  subscribeToBalances(listener: BalanceListener): () => void {
    this.balanceListeners.add(listener)
    return () => this.balanceListeners.delete(listener)
  }

  subscribeToTransactions(listener: TransactionListener): () => void {
    this.transactionListeners.add(listener)
    return () => this.transactionListeners.delete(listener)
  }

  // Utility methods
  getPortfolioState(): PortfolioState {
    return {
      balances: this.getAll(),
      transactions: this.getTransactions(),
      totalValue: 0, // Will be calculated when prices are available
      lastUpdated: Date.now()
    }
  }

  reset() {
    this.balances = loadInitial()
    this.transactions = []
    this.persist()
    this.emit()
  }

  private emit() {
    const state = this.getPortfolioState()
    const balances = this.getAll()
    const transactions = this.getTransactions()
    
    this.listeners.forEach((l) => l(state))
    this.balanceListeners.forEach((l) => l(balances))
    this.transactionListeners.forEach((l) => l(transactions))
  }
}

export const cryptoStore = new CryptoStore()

// Dev helper: allow backend/console to update balances
declare global { 
  interface Window { 
    cryptoStore?: any
    cryptoBalances?: any 
  } 
}

if (typeof window !== 'undefined') {
  window.cryptoStore = {
    get: (s?: CryptoSymbol) => (s ? cryptoStore.get(s) : cryptoStore.getAll()),
    set: (s: CryptoSymbol, v: number) => cryptoStore.set(s, v),
    delta: (s: CryptoSymbol, d: number, desc?: string) => cryptoStore.delta(s, d, desc),
    transactions: () => cryptoStore.getTransactions(),
    reset: () => cryptoStore.reset(),
    state: () => cryptoStore.getPortfolioState()
  }
  
  // Keep backward compatibility
  window.cryptoBalances = {
    get: (s?: CryptoSymbol) => (s ? cryptoStore.get(s) : cryptoStore.getAll()),
    set: (s: CryptoSymbol, v: number) => cryptoStore.set(s, v),
    delta: (s: CryptoSymbol, d: number) => cryptoStore.delta(s, d),
  }
}



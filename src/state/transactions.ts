export type Transaction = {
  id: string
  date: string
  coin: string
  network: string
  qty: number
  fee: number
  gst: number
  deb: number
  recipient: string
  recipientFull: string
  self: boolean
  status: 'Completed' | 'Failed'
  type: 'transfer' | 'auto-sweep' | 'send' | 'receive' | 'investment'
}

type Listener = (transactions: Transaction[]) => void

const LS_KEY = 'wallet_transactions_v1'

function loadInitial(): Transaction[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

class TransactionsStore {
  private transactions: Transaction[] = loadInitial()
  private listeners: Set<Listener> = new Set()

  private persist() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(this.transactions)) } catch {}
  }

  getAll(): Transaction[] {
    return [...this.transactions]
  }

  add(transaction: Transaction) {
    this.transactions.unshift(transaction) // Add to beginning
    this.persist()
    this.emit()
  }

  addMultiple(transactions: Transaction[]) {
    this.transactions.unshift(...transactions)
    this.persist()
    this.emit()
  }

  remove(id: string) {
    this.transactions = this.transactions.filter(tx => tx.id !== id)
    this.persist()
    this.emit()
  }

  clear() {
    this.transactions = []
    this.persist()
    this.emit()
  }

  getByType(type: Transaction['type']): Transaction[] {
    return this.transactions.filter(tx => tx.type === type)
  }

  getByCoin(coin: string): Transaction[] {
    return this.transactions.filter(tx => tx.coin === coin)
  }

  getRecent(limit: number = 10): Transaction[] {
    return this.transactions.slice(0, limit)
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit() {
    this.listeners.forEach((l) => l(this.getAll()))
  }
}

export const transactionsStore = new TransactionsStore()

// Dev helper: allow backend/console to manage transactions
declare global { interface Window { transactions?: any } }
if (typeof window !== 'undefined') {
  window.transactions = {
    get: () => transactionsStore.getAll(),
    add: (tx: Transaction) => transactionsStore.add(tx),
    addMultiple: (txs: Transaction[]) => transactionsStore.addMultiple(txs),
    remove: (id: string) => transactionsStore.remove(id),
    clear: () => transactionsStore.clear(),
    getByType: (type: Transaction['type']) => transactionsStore.getByType(type),
    getByCoin: (coin: string) => transactionsStore.getByCoin(coin),
    getRecent: (limit?: number) => transactionsStore.getRecent(limit),
  }
}

import { useState, useEffect } from 'react'
import { cryptoStore, type CryptoSymbol, type Transaction, type PortfolioState } from './cryptoStore'

export function useCryptoStore() {
  const [state, setState] = useState<PortfolioState>(cryptoStore.getPortfolioState())

  useEffect(() => {
    const unsubscribe = cryptoStore.subscribe(setState)
    return unsubscribe
  }, [])

  return {
    ...state,
    // Balance methods
    getBalance: (symbol: CryptoSymbol) => cryptoStore.get(symbol),
    setBalance: (symbol: CryptoSymbol, value: number) => cryptoStore.set(symbol, value),
    updateBalance: (symbol: CryptoSymbol, change: number, description?: string) => 
      cryptoStore.delta(symbol, change, description),
    
    // Transaction methods
    addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => 
      cryptoStore.addTransaction(transaction),
    getTransactions: (limit?: number) => cryptoStore.getTransactions(limit),
    getTransactionsBySymbol: (symbol: CryptoSymbol) => cryptoStore.getTransactionsBySymbol(symbol),
    
    // Utility methods
    calculateTotalValue: (prices?: Record<CryptoSymbol, number>) => cryptoStore.calculateTotalValue(prices),
    reset: () => cryptoStore.reset()
  }
}

export function useCryptoBalances() {
  const [balances, setBalances] = useState(cryptoStore.getAll())

  useEffect(() => {
    const unsubscribe = cryptoStore.subscribeToBalances(setBalances)
    return unsubscribe
  }, [])

  return {
    balances,
    getBalance: (symbol: CryptoSymbol) => cryptoStore.get(symbol),
    setBalance: (symbol: CryptoSymbol, value: number) => cryptoStore.set(symbol, value),
    updateBalance: (symbol: CryptoSymbol, change: number, description?: string) => 
      cryptoStore.delta(symbol, change, description)
  }
}

export function useCryptoTransactions() {
  const [transactions, setTransactions] = useState(cryptoStore.getTransactions())

  useEffect(() => {
    const unsubscribe = cryptoStore.subscribeToTransactions(setTransactions)
    return unsubscribe
  }, [])

  return {
    transactions,
    addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => 
      cryptoStore.addTransaction(transaction),
    getTransactionsBySymbol: (symbol: CryptoSymbol) => cryptoStore.getTransactionsBySymbol(symbol)
  }
}

// Hook for a specific crypto balance
export function useCryptoBalance(symbol: CryptoSymbol) {
  const [balance, setBalance] = useState(cryptoStore.get(symbol))

  useEffect(() => {
    const unsubscribe = cryptoStore.subscribeToBalances((balances) => {
      setBalance(balances[symbol] ?? 0)
    })
    return unsubscribe
  }, [symbol])

  return {
    balance,
    setBalance: (value: number) => cryptoStore.set(symbol, value),
    updateBalance: (change: number, description?: string) => 
      cryptoStore.delta(symbol, change, description)
  }
}

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BalanceCard } from '../components/wallet/BalanceCard'
import { InvestmentCard } from '../components/wallet/InvestmentCard'
import { TransactionsTable } from '../components/wallet/TransactionsTable'
import { cryptoStore, type CryptoSymbol } from '../state/cryptoStore'
import { investmentWallet } from '../state/investmentWallet'
import { transactionsStore, type Transaction } from '../state/transactions'
import { cryptoMeta } from '../state/cryptoMeta'

// Generate volatile sparkline data
const generateVolatileSparklineData = () => {
  const data = []
  let value = 375000
  const baseVolatility = 0.25 // High base volatility
  const cryptoVolatility = 0.15 // Additional crypto-specific volatility
  
  for (let i = 0; i < 7; i++) {
    // Extreme volatility with multiple factors
    const randomFactor = Math.random() - 0.5
    const volatility = baseVolatility + cryptoVolatility
    const dailyChange = randomFactor * volatility * 12 // 12x multiplier for extreme swings
    
    // Add occasional extreme spikes (crypto-style)
    const spikeChance = Math.random()
    let spikeMultiplier = 1
    if (spikeChance > 0.95) {
      spikeMultiplier = 4 // 400% spike
    } else if (spikeChance < 0.05) {
      spikeMultiplier = 0.2 // 80% crash
    }
    
    value = value * (1 + (dailyChange * spikeMultiplier) / 100)
    const date = new Date(2024, 0, i + 1).toISOString().split('T')[0]
    
    data.push({
      value: Math.max(value, 100000), // Much lower minimum for extreme drops
      date: date
    })
  }
  
  return data
}

// Mock sparkline data for the investment card with extreme volatility
const mockSparklineData = generateVolatileSparklineData()

export default function Wallet() {
  // State from your existing wallet
  const [selectedWallet, setSelectedWallet] = useState<CryptoSymbol>(() => {
    const saved = localStorage.getItem('last_selected_wallet')
    return (saved as CryptoSymbol) || 'BTC'
  })
  const [walletBalance, setWalletBalance] = useState<number>(cryptoStore.get(selectedWallet))
  const [investmentBalance, setInvestmentBalance] = useState<number>(investmentWallet.getBalance())
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Save selected wallet to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('last_selected_wallet', selectedWallet)
  }, [selectedWallet])

  // Keep wallet balance synced from global store
  useEffect(() => {
    const unsub = cryptoStore.subscribeToBalances((bals) => {
      setWalletBalance(bals[selectedWallet] ?? 0)
    })
    setWalletBalance(cryptoStore.get(selectedWallet))
    return unsub
  }, [selectedWallet])

  // Keep investment balance synced from global store
  useEffect(() => {
    const unsub = investmentWallet.subscribe((balance) => {
      setInvestmentBalance(balance)
    })
    setInvestmentBalance(investmentWallet.getBalance())
    return unsub
  }, [])

  // Subscribe to transaction updates
  useEffect(() => {
    setTransactions(transactionsStore.getAll())
    
    const unsubscribe = transactionsStore.subscribe((txs) => {
      setTransactions(txs)
    })
    
    return unsubscribe
  }, [])

  // Convert transactions to the format expected by the table
  const tableTransactions = transactions.map(tx => ({
    ...tx,
    status: tx.status as 'Completed' | 'Failed'
  }))

  const handleTransfer = () => {
    // This would open your transfer modal/form
    console.log('Transfer clicked')
  }

  const handleInvest = () => {
    // This would open your investment modal/form
    console.log('Invest clicked')
  }

  const handleViewPortfolio = () => {
    // Navigate to portfolio page
    window.location.href = '/app/portfolio'
  }

  return (
    <div className="min-h-screen bg-[#12132a] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-[#e9ecff] mb-2">Wallet</h1>
            <p className="text-[#8b90b2]">Manage your crypto assets and investments</p>
          </div>
          
          {/* Wallet Selector */}
          <div className="flex items-center gap-3">
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value as CryptoSymbol)}
              className="px-4 py-2 bg-[#1e2044] border border-[#2a2c54] rounded-lg text-[#e9ecff] focus:outline-none focus:border-[#6a7bff]"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDT">Tether (USDT)</option>
              <option value="SOL">Solana (SOL)</option>
              <option value="BAT">Basic Attention Token (BAT)</option>
              <option value="SEPOLIA_ETH">Sepolia ETH</option>
            </select>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BalanceCard
            coin={cryptoMeta[selectedWallet]?.name || selectedWallet}
            balance={walletBalance}
            onTransfer={handleTransfer}
          />
          
          <InvestmentCard
            totalUSD={investmentBalance}
            onInvest={handleInvest}
            onViewPortfolio={handleViewPortfolio}
            sparklineData={mockSparklineData}
          />
        </div>

        {/* Transactions Table */}
        <TransactionsTable transactions={tableTransactions} />
      </div>
    </div>
  )
}

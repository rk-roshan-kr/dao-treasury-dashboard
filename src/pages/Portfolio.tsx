import { useMemo, useEffect, useState } from 'react'
import { Card, CardContent, Typography, Chip, Avatar, Divider } from '@mui/material'
import InvestmentChart from '../components/InvestmentChart/InvestmentChart'
import TokenCard from '../components/TokenCard/TokenCard'
import { mockEthernet } from '../data/ethernet.js'
import { cryptoStore, type CryptoSymbol } from '../state/cryptoStore'
import { cryptoMeta } from '../state/cryptoMeta'
import { prices } from '../state/prices'
import { transactionsStore, type Transaction } from '../state/transactions'
import { motion } from 'framer-motion'

export default function Portfolio() {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [balances, setBalances] = useState(cryptoStore.getAll())

  // Subscribe to transaction updates
  useEffect(() => {
    setRecentTransactions(transactionsStore.getRecent(5))
    
    const unsubscribe = transactionsStore.subscribe((transactions) => {
      setRecentTransactions(transactions.slice(0, 5))
    })
    
    return unsubscribe
  }, [])

  // Subscribe to crypto balance updates
  useEffect(() => {
    setBalances(cryptoStore.getAll())
    
    const unsubscribe = cryptoStore.subscribeToBalances((newBalances) => {
      setBalances(newBalances)
    })
    
    return unsubscribe
  }, [])

  const portfolio = [
    { symbol: 'BTC', name: 'Bitcoin', logo: '', qty: balances.BTC },
    { symbol: 'ETH', name: 'Ethereum', logo: '', qty: balances.ETH },
    { symbol: 'USDT', name: 'Tether', logo: '', qty: balances.USDT },
    { symbol: 'SOL', name: 'Solana', logo: '', qty: balances.SOL },
    { symbol: 'BAT', name: 'Basic Attention Token', logo: '', qty: balances.BAT },
    { symbol: 'SEPOLIA_ETH', name: 'Sepolia ETH', logo: '', qty: balances.SEPOLIA_ETH },
  ] as const

  const assets = portfolio.map(p => {
    const usd = prices.get(p.symbol as CryptoSymbol)
    const valueUsd = Math.max(0, p.qty * usd)
    return {
      symbol: p.symbol,
      name: cryptoMeta[p.symbol as CryptoSymbol]?.name || p.name,
      logo: cryptoMeta[p.symbol as CryptoSymbol]?.icon || p.logo,
      qty: p.qty,
      valueUsd,
      percentOfTreasury: 0,
      change24hPercent: (() => {
        // Generate extreme volatility for 24h changes
        const baseVolatility = 0.4 // High base volatility
        const cryptoVolatility = 0.2 // Additional crypto-specific volatility
        const randomFactor = Math.random() - 0.5
        const volatility = baseVolatility + cryptoVolatility
        const dailyChange = randomFactor * volatility * 15 // 15x multiplier for extreme swings
        
        // Add occasional extreme spikes (crypto-style)
        const spikeChance = Math.random()
        let spikeMultiplier = 1
        if (spikeChance > 0.95) {
          spikeMultiplier = 5 // 500% spike
        } else if (spikeChance < 0.05) {
          spikeMultiplier = 0.1 // 90% crash
        }
        
        return (dailyChange * spikeMultiplier) * 100 // Convert to percentage
      })(),
    }
  })

  const totalTreasuryValue = assets.reduce((acc, a) => acc + a.valueUsd, 0)
  const tokenAllocations = assets
    .filter(a => a.valueUsd > 0)
    .map(a => ({ symbol: a.symbol, percent: totalTreasuryValue ? +(a.valueUsd / totalTreasuryValue * 100).toFixed(2) : 0, color: cryptoMeta[a.symbol as CryptoSymbol]?.color || '#60a5fa' }))

  // Calculate active wallets (cryptocurrencies with balance > 0)
  const activeWallets = Object.values(balances).filter(balance => balance > 0).length

  const totalChange = useMemo(() => {
    // Generate extreme volatility for total portfolio change
    const baseVolatility = 0.3 // High base volatility
    const cryptoVolatility = 0.15 // Additional crypto-specific volatility
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
    
    return (dailyChange * spikeMultiplier) * 100 // Convert to percentage
  }, [])

  return (
    <motion.div 
      className="space-y-6 text-coolgray dark:text-slate-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-base">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Typography className="text-sm text-slate-300">Total Treasury Value</Typography>
                  <Typography
                    variant="h4"
                    className="text-white font-bold mt-1"
                    style={{ textShadow: '0 0 12px rgba(250,204,21,0.25)' }}
                  >
                    ${totalTreasuryValue.toLocaleString()}
                  </Typography>
                </div>
                <Chip label={(totalChange >= 0 ? '+' : '') + totalChange.toFixed(2) + ' 24h'} color={totalChange >= 0 ? 'success' : 'error'} className="rounded-xl" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-base">
            <CardContent>
              <Typography className="text-sm text-slate-300">Active Wallets</Typography>
              <div className="flex items-end gap-2 mt-1">
                <Typography variant="h4" className="text-white font-bold">{activeWallets}</Typography>
                <Typography className="text-xs text-slate-400">tracked</Typography>
              </div>
              <div className="flex -space-x-2 mt-3">
                {recentTransactions.slice(0,5).map((tx) => (
                  <Avatar key={tx.id} sx={{ width: 28, height: 28 }} className="ring-2 ring-white">
                    {tx.coin.charAt(0)}
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="card-base">
            <CardContent>
              <Typography className="text-sm text-slate-300">Lifetime Earnings</Typography>
              <Typography variant="h4" className="text-white font-bold mt-1">$23.31</Typography>
              <Typography className="text-xs text-slate-400">from investments</Typography>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-w-0">
          <Card className="card-base lg:col-span-1 min-w-0">
            <CardContent>
              <div className="flex items-center justify-between">
                <Typography variant="h6" className="text-white">Portfolio Allocation</Typography>
                <span className="chip" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>Donut</span>
              </div>
              <div className="mt-4 min-w-0">
                <InvestmentChart data={tokenAllocations} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {tokenAllocations.map(a => (
                  <div key={a.symbol} className="flex items-center justify-between bg-transparent rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                      <span className="text-sm text-slate-300">{a.symbol}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{a.percent}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-w-0">
            {assets.map(asset => (
              <TokenCard key={asset.symbol} asset={asset} />
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="card-base">
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <Typography variant="h6" className="text-white">Recent Transactions</Typography>
              <div className="text-right">
                <div className="text-sm text-slate-300">24h Transactions</div>
                <div className="text-lg text-white font-bold">{transactionsStore.getAll().length}</div>
              </div>
            </div>
            <Divider className="my-3" />
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <div className="text-center text-slate-400 py-4">No transactions yet</div>
              ) : (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {tx.coin.charAt(0)}
                      </Avatar>
                      <div>
                        <div className="text-sm text-white font-medium">{tx.type} {tx.coin}</div>
                        <div className="text-xs text-slate-400">{tx.recipient}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white font-medium">{tx.qty} {tx.coin}</div>
                      <div className="text-xs text-slate-400">{tx.network}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </motion.div>
  )
}



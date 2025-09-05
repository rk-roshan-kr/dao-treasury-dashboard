import { useMemo, useEffect, useState } from 'react'
import { Card, CardContent, Typography, Button, Chip, Avatar, Box, Grid } from '@mui/material'
import { TrendingUp, TrendingDown, ArrowUpward, ArrowDownward, Visibility, VisibilityOff } from '@mui/icons-material'
import { cryptoStore, type CryptoSymbol } from '../../state/cryptoStore'
import { cryptoMeta } from '../../state/cryptoMeta'
import { prices } from '../../state/prices'
import { transactionsStore, type Transaction } from '../../state/transactions'
import { investmentWallet } from '../../state/investmentWallet'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const [balances, setBalances] = useState(cryptoStore.getAll())
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [investmentBalance, setInvestmentBalance] = useState(investmentWallet.getBalance())
  const [hideAmounts, setHideAmounts] = useState(false)

  // Subscribe to crypto balance updates
  useEffect(() => {
    setBalances(cryptoStore.getAll())
    
    const unsubscribe = cryptoStore.subscribeToBalances((newBalances) => {
      setBalances(newBalances)
    })
    
    return unsubscribe
  }, [])

  // Subscribe to transaction updates
  useEffect(() => {
    setRecentTransactions(transactionsStore.getRecent(5))
    
    const unsubscribe = transactionsStore.subscribe((transactions) => {
      setRecentTransactions(transactions.slice(0, 5))
    })
    
    return unsubscribe
  }, [])

  // Subscribe to investment wallet updates
  useEffect(() => {
    setInvestmentBalance(investmentWallet.getBalance())
    
    const unsubscribe = investmentWallet.subscribe((balance) => {
      setInvestmentBalance(balance)
    })
    
    return unsubscribe
  }, [])

  const portfolio = [
    { symbol: 'BTC', name: 'Bitcoin', qty: balances.BTC },
    { symbol: 'ETH', name: 'Ethereum', qty: balances.ETH },
    { symbol: 'USDT', name: 'Tether', qty: balances.USDT },
    { symbol: 'SOL', name: 'Solana', qty: balances.SOL },
    { symbol: 'BAT', name: 'Basic Attention Token', qty: balances.BAT },
    { symbol: 'SEPOLIA_ETH', name: 'Sepolia ETH', qty: balances.SEPOLIA_ETH },
  ] as const

  const assets = portfolio.map(p => {
    const usd = prices.get(p.symbol as CryptoSymbol)
    const valueUsd = Math.max(0, p.qty * usd)
    return {
      symbol: p.symbol,
      name: cryptoMeta[p.symbol as CryptoSymbol]?.name || p.name,
      logo: cryptoMeta[p.symbol as CryptoSymbol]?.icon || '',
      qty: p.qty,
      valueUsd,
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
      })(), // Mock data with extreme volatility
    }
  })

  const totalTreasuryValue = assets.reduce((acc, a) => acc + a.valueUsd, 0)
  const activeWallets = Object.values(balances).filter(balance => balance > 0).length
  const totalTransactions = transactionsStore.getAll().length
  const lifetimeEarnings = 23.31

  const formatAmount = (amount: number) => {
    if (hideAmounts) return '****'
    return amount.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatCrypto = (amount: number) => {
    if (hideAmounts) return '****'
    return amount.toFixed(4)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <Typography variant="h2" className="text-white font-bold mb-4" style={{ textShadow: '0 0 20px rgba(59,130,246,0.5)' }}>
                DAO Treasury Dashboard
              </Typography>
              <Typography variant="h6" className="text-slate-300 mb-6">
                Manage your digital assets with precision and insight
              </Typography>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="contained"
                  size="large"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg"
                >
                  Start Trading
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  className="border-2 border-slate-400 text-slate-300 hover:border-white hover:text-white font-bold px-8 py-3 rounded-xl"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Typography variant="h4" className="text-white font-bold">Portfolio Overview</Typography>
            <Button
              onClick={() => setHideAmounts(!hideAmounts)}
              startIcon={hideAmounts ? <Visibility /> : <VisibilityOff />}
              className="text-slate-300 hover:text-white"
            >
              {hideAmounts ? 'Show' : 'Hide'} Amounts
            </Button>
          </div>

          <Grid container spacing={3} className="mb-8">
            <Grid item xs={12} sm={6} md={3}>
              <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Typography className="text-blue-300 text-sm font-medium">Total Portfolio Value</Typography>
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-300 text-lg">$</span>
                    </div>
                  </div>
                  <Typography variant="h4" className="text-white font-bold mb-2">
                    {formatAmount(totalTreasuryValue)}
                  </Typography>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-green-400 text-sm" />
                    <Typography className="text-green-400 text-sm font-medium">+2.45%</Typography>
                    <Typography className="text-slate-400 text-sm">24h</Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Typography className="text-purple-300 text-sm font-medium">Investment Balance</Typography>
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-300 text-lg">📈</span>
                    </div>
                  </div>
                  <Typography variant="h4" className="text-white font-bold mb-2">
                    {formatAmount(investmentBalance)}
                  </Typography>
                  <div className="flex items-center gap-2">
                    <ArrowUpward className="text-green-400 text-sm" />
                    <Typography className="text-green-400 text-sm font-medium">+5.67%</Typography>
                    <Typography className="text-slate-400 text-sm">24h</Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Typography className="text-green-300 text-sm font-medium">Active Wallets</Typography>
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-300 text-lg">💼</span>
                    </div>
                  </div>
                  <Typography variant="h4" className="text-white font-bold mb-2">
                    {activeWallets}
                  </Typography>
                  <Typography className="text-slate-400 text-sm">tracked</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Typography className="text-orange-300 text-sm font-medium">Lifetime Earnings</Typography>
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <span className="text-orange-300 text-lg">💰</span>
                    </div>
                  </div>
                  <Typography variant="h4" className="text-white font-bold mb-2">
                    {formatAmount(lifetimeEarnings)}
                  </Typography>
                  <Typography className="text-slate-400 text-sm">from investments</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Market Overview */}
          <div className="mb-8">
            <Typography variant="h5" className="text-white font-bold mb-4">Market Overview</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.filter(asset => asset.qty > 0).map(asset => (
                <Card key={asset.symbol} className="bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: cryptoMeta[asset.symbol as CryptoSymbol]?.color || '#60a5fa' }}
                        >
                          {asset.symbol.charAt(0)}
                        </div>
                        <div>
                          <Typography className="text-white font-medium">{asset.name}</Typography>
                          <Typography className="text-slate-400 text-sm">{asset.symbol}</Typography>
                        </div>
                      </div>
                      <Chip 
                        label={`${asset.change24hPercent >= 0 ? '+' : ''}${asset.change24hPercent.toFixed(2)}%`}
                        color={asset.change24hPercent >= 0 ? 'success' : 'error'}
                        size="small"
                        icon={asset.change24hPercent >= 0 ? <TrendingUp /> : <TrendingDown />}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Typography className="text-slate-400 text-sm">Balance</Typography>
                        <Typography className="text-white font-medium">{formatCrypto(asset.qty)}</Typography>
                      </div>
                      <div className="flex justify-between">
                        <Typography className="text-slate-400 text-sm">Value</Typography>
                        <Typography className="text-white font-medium">{formatAmount(asset.valueUsd)}</Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Typography variant="h5" className="text-white font-bold">Recent Activity</Typography>
              <Chip label={`${totalTransactions} total transactions`} color="primary" />
            </div>
            <Card className="bg-slate-800/50 border border-slate-700/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentTransactions.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                      <Typography variant="h6" className="mb-2">No transactions yet</Typography>
                      <Typography className="text-sm">Start trading to see your activity here</Typography>
                    </div>
                  ) : (
                    recentTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40,
                              backgroundColor: cryptoMeta[tx.coin as CryptoSymbol]?.color || '#60a5fa'
                            }}
                          >
                            {tx.coin.charAt(0)}
                          </Avatar>
                          <div>
                            <Typography className="text-white font-medium capitalize">{tx.type} {tx.coin}</Typography>
                            <Typography className="text-slate-400 text-sm">{tx.recipient}</Typography>
                          </div>
                        </div>
                        <div className="text-right">
                          <Typography className="text-white font-medium">{tx.qty} {tx.coin}</Typography>
                          <Typography className="text-slate-400 text-sm">{tx.network}</Typography>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Typography variant="h5" className="text-white font-bold mb-4">Quick Actions</Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="contained"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl"
                size="large"
              >
                Transfer to Investment
              </Button>
              <Button
                variant="contained"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl"
                size="large"
              >
                Send Crypto
              </Button>
              <Button
                variant="contained"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 rounded-xl"
                size="large"
              >
                View Portfolio
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



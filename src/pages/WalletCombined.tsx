import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BalanceCard } from '../components/wallet/BalanceCard'
import { InvestmentCard } from '../components/wallet/InvestmentCard'
import { cryptoStore, type CryptoSymbol } from '../state/cryptoStore'
import { prices } from '../state/prices'
import { cryptoMeta } from '../state/cryptoMeta'
import { investmentWallet } from '../state/investmentWallet'
import { transactionsStore, type Transaction } from '../state/transactions'

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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  }
}

const buttonVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
}

export default function WalletCombined() {
  const [hideAmounts, setHideAmounts] = useState(false)
  
  // Tab state
  type TabKey = 'balance' | 'send' | 'receive'
  const [activeTab, setActiveTab] = useState<TabKey>('balance')

  // Send tab state
  const [sendCoin, setSendCoin] = useState<string>('')
  const [sendNetwork, setSendNetwork] = useState<string>('')
  const [sendRecipient, setSendRecipient] = useState<string>('')
  const [sendQty, setSendQty] = useState<string>('')

  // Receive tab state
  const [recvCoin, setRecvCoin] = useState<string>('')
  const [recvNetwork, setRecvNetwork] = useState<string>('')
  const [recvLabel, setRecvLabel] = useState<string>('')
  const [recvAck, setRecvAck] = useState<boolean>(false)
  const [recvAddress, setRecvAddress] = useState<string>('')

  // Balance tab state (wallet balances and transfers)
  const [selectedWallet, setSelectedWallet] = useState<CryptoSymbol>(() => {
    const saved = localStorage.getItem('last_selected_wallet')
    return (saved as CryptoSymbol) || 'BTC'
  })
  const [wallet1Balance, setWallet1Balance] = useState<number>(cryptoStore.get(selectedWallet))
  const [investmentBalance, setInvestmentBalance] = useState<number>(investmentWallet.getBalance())
  const [showTransferWallet1, setShowTransferWallet1] = useState<boolean>(false)
  const [transferAmount, setTransferAmount] = useState<string>('')
  const [showInvest, setShowInvest] = useState<boolean>(false)
  const [investAmount, setInvestAmount] = useState<string>('') // USD amount for investment

  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Subscribe to transaction updates
  useEffect(() => {
    setTransactions(transactionsStore.getAll())
    
    const unsubscribe = transactionsStore.subscribe((txs) => {
      setTransactions(txs)
    })
    
    return unsubscribe
  }, [])

  const quickMaxByCoin: Record<string, number> = useMemo(() => ({ BTC: 0.05, ETH: 0.8, USDT: 250, SOL: 12, BAT: 10, SEPOLIA_ETH: 10 }), [])

  // Save selected wallet to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('last_selected_wallet', selectedWallet)
  }, [selectedWallet])

  const parsedQty = useMemo(() => {
    const n = parseFloat((sendQty || '').replace(/,/g, ''))
    return Number.isFinite(n) ? n : 0
  }, [sendQty])

  const sendReady = !!sendCoin && !!sendNetwork && !!sendRecipient && parsedQty > 0
  const fee = sendReady ? parsedQty * 0.002 : 0
  const gst = sendReady ? fee * 0.18 : 0
  const deb = sendReady ? parsedQty + fee + gst : 0

  const fmt = (n: number) => {
    const s = Math.round(n * 1e8) / 1e8
    return s.toString()
  }
  const nowStr = () => {
    const d = new Date()
    const pad = (x: number) => String(x).padStart(2, '0')
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const genId = () => `TX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  const genRecvAddress = (coin: string, net: string) => {
    const prefix = coin === 'BTC' ? 'bc1' : coin === 'ETH' || coin === 'USDT' || coin === 'SEPOLIA_ETH' ? '0x' : 'addr_'
    return `${prefix}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`.slice(0, 46)
  }

  // FX: flying triangle (from Wallets.tsx)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const fxLayerRef = useRef<HTMLDivElement | null>(null)
  const wallet1IconRef = useRef<HTMLDivElement | null>(null)
  const investIconRef = useRef<HTMLDivElement | null>(null)

  // Keep Wallet 1 balance synced from global store
  useEffect(() => {
    const unsub = cryptoStore.subscribeToBalances((bals) => {
      setWallet1Balance(bals[selectedWallet] ?? 0)
    })
    setWallet1Balance(cryptoStore.get(selectedWallet))
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

  function triggerFly(
    fromEl: HTMLElement,
    toEl: HTMLElement | null,
    direction: 'right' | 'left',
    onArrive?: () => void,
  ) {
    if (!fxLayerRef.current || !toEl) {
      // If layer/target missing, run the callback immediately
      onArrive?.()
      return
    }
    const layer = fxLayerRef.current
    const layerRect = layer.getBoundingClientRect()
    const fromRect = fromEl.getBoundingClientRect()
    const toRect = toEl.getBoundingClientRect()
    const startX = fromRect.left + (direction === 'right' ? fromRect.width : 0) - layerRect.left
    const startY = fromRect.top + fromRect.height / 2 - layerRect.top
    const endX = toRect.left + toRect.width / 2 - layerRect.left
    const endY = toRect.top + toRect.height / 2 - layerRect.top
    const dx = endX - startX
    const dy = endY - startY

    const tri = document.createElement('div')
    tri.className = `fly-triangle ${direction === 'right' ? 'dir-right' : 'dir-left'}`
    tri.style.left = `${startX}px`
    tri.style.top = `${startY}px`
    tri.style.setProperty('--fx-x', `${dx}px`)
    tri.style.setProperty('--fx-y', `${dy}px`)
    layer.appendChild(tri)

    // Particle trail along the path
    const durationMs = 1200
    const startTime = performance.now()
    const trailTimer = setInterval(() => {
      const now = performance.now()
      const t = Math.min(1, (now - startTime) / durationMs)
      // Swirl offsets diminish over time
      const ampX = 22 * (1 - t)
      const ampY = 16 * (1 - t)
      const swirl = Math.sin(t * Math.PI * 3)
      const swirlY = Math.cos(t * Math.PI * 3)
      const x = startX + dx * t + (direction === 'right' ? ampX * swirl : -ampX * swirl)
      const y = startY + dy * t + ampY * swirlY

      const dot = document.createElement('div')
      dot.className = 'fly-trail'
      dot.style.left = `${x}px`
      dot.style.top = `${y}px`
      layer.appendChild(dot)
      setTimeout(() => dot.remove(), 1000)

      if (t >= 1) clearInterval(trailTimer)
    }, 50)

    tri.addEventListener('animationend', () => {
      // Apply balance changes right when the triangle arrives
      onArrive?.()
      const spark = document.createElement('div')
      spark.className = 'fly-spark'
      spark.style.left = `${startX + dx}px`
      spark.style.top = `${startY + dy}px`
      layer.appendChild(spark)
      setTimeout(() => { spark.remove() }, 2500)
      tri.remove()
    }, { once: true })
  }

  // Convert transactions to the format expected by the table
  const tableTransactions = transactions.map(tx => ({
    ...tx,
    status: tx.status as 'Completed' | 'Failed'
  }))

  const handleTransfer = () => {
    // Switch to send tab to enable transfer functionality
    setActiveTab('send')
  }

  const handleInvest = () => {
    // Show invest form
    setShowInvest(true)
  }

  const handleViewPortfolio = () => {
    // Navigate to portfolio page
    window.location.href = '/app/portfolio'
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  }

  return (
    <motion.div 
      className="wallet"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="wallet-container" ref={containerRef}>
        <div className="wallet-fx-layer" ref={fxLayerRef} />
        
        {/* Topbar with gradient background (from Wallets.tsx) */}
        <motion.div 
          className="wallet-topbar"
          variants={cardVariants}
        >
          <div className="wallet-title">Wallet</div>
          <div className="wallet-status-bar">
            <div className="wallet-row">
              <motion.button 
                className="wallet-icon-btn" 
                title="Profile"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" stroke="#b8bffa" strokeWidth="1.8" />
                  <path d="M4 20c2.5-4 13.5-4 16 0" stroke="#b8bffa" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </motion.button>
              <motion.button 
                className="wallet-icon-btn" 
                title="Security"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" stroke="#b8bffa" strokeWidth="1.8" />
                </svg>
              </motion.button>
              <motion.button 
                className="wallet-icon-btn" 
                title="Notifications"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 18h12l-1.6-2.7a7 7 0 0 1-1-3.6V9a4.4 4.4 0 0 0-8.8 0v2.7c0 1.3-.34 2.5-1 3.6L6 18z" stroke="#b8bffa" strokeWidth="1.8" />
                  <circle cx="12" cy="20.2" r="1.6" fill="#b8bffa" />
                </svg>
              </motion.button>
              <motion.button 
                className="wallet-icon-btn" 
                title="Hide/Show balances" 
                onClick={() => setHideAmounts((v) => !v)} 
                aria-pressed={hideAmounts}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {hideAmounts ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2 12s3.5-6 10-6c2.1 0 3.9.5 5.4 1.2" stroke="#b8bffa" strokeWidth="1.8" />
                    <path d="M22 12s-3.5 6-10 6c-2.1 0-3.9-.5-5.4-1.2" stroke="#b8bffa" strokeWidth="1.8" />
                    <path d="M3 21L21 3" stroke="#b8bffa" strokeWidth="1.8" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" stroke="#b8bffa" strokeWidth="1.8" />
                    <circle cx="12" cy="12" r="3" stroke="#b8bffa" strokeWidth="1.8" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          className="wallet-tabs"
          variants={cardVariants}
        >
          <motion.button 
            className={`wallet-tab ${activeTab === 'balance' ? 'active' : ''}`} 
            onClick={() => setActiveTab('balance')}
            variants={tabVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            BALANCE
          </motion.button>
          <motion.button 
            className={`wallet-tab ${activeTab === 'send' ? 'active' : ''}`} 
            onClick={() => setActiveTab('send')}
            variants={tabVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            SEND CRYPTO
          </motion.button>
          <motion.button 
            className={`wallet-tab ${activeTab === 'receive' ? 'active' : ''}`} 
            onClick={() => setActiveTab('receive')}
            variants={tabVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            RECEIVE CRYPTO
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'balance' && (
            <motion.div
              key="balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Wallet Selector */}
              <motion.div 
                className="mb-6"
                variants={cardVariants}
              >
                <div className="wallet-card">
                  <div className="wallet-card-header">
                    <span>Select Wallet</span>
                  </div>
                  <div className="wallet-action-body">
                    <select 
                      className="wallet-action-input" 
                      value={selectedWallet} 
                      onChange={(e) => setSelectedWallet(e.target.value as CryptoSymbol)}
                    >
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="USDT">Tether (USDT)</option>
                      <option value="SOL">Solana (SOL)</option>
                      <option value="BAT">Basic Attention Token (BAT)</option>
                      <option value="SEPOLIA_ETH">Sepolia ETH</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Modern Cards Grid (from Wallet.tsx) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <motion.div variants={cardVariants}>
                  <BalanceCard
                    coin={cryptoMeta[selectedWallet]?.name || selectedWallet}
                    balance={wallet1Balance}
                    onTransfer={handleTransfer}
                  />
                </motion.div>
                
                <motion.div variants={cardVariants}>
                  <InvestmentCard
                    totalUSD={investmentBalance}
                    onInvest={handleInvest}
                    onViewPortfolio={handleViewPortfolio}
                    sparklineData={mockSparklineData}
                  />
                </motion.div>
              </div>

              {/* Transfer and Invest Forms */}
              {(showTransferWallet1 || showInvest) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
                >
                  {showTransferWallet1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="wallet-card"
                    >
                      <div className="wallet-card-header">
                        <span>Transfer to Investment Wallet</span>
                      </div>
                      <div className="wallet-action-body">
                        <input 
                          className="wallet-action-input" 
                          placeholder={`Amount (${selectedWallet})`} 
                          inputMode="decimal" 
                          value={transferAmount} 
                          onChange={(e) => setTransferAmount(e.target.value)} 
                        />
                        <button 
                          className="wallet-action-send" 
                          onClick={() => {
                            const amt = parseFloat(transferAmount)
                            if (!Number.isFinite(amt) || amt <= 0 || amt > wallet1Balance) { 
                              alert('Enter a valid amount'); 
                              return 
                            }
                            
                            // Convert crypto to USD using price dictionary
                            const cryptoPrice = prices.get(selectedWallet)
                            const usdValue = amt * cryptoPrice
                            
                            // Update balances
                            investmentWallet.add(usdValue)
                            cryptoStore.delta(selectedWallet, -amt)
                            
                            // Add transaction record
                            const transaction: Transaction = {
                              id: genId(),
                              date: nowStr(),
                              coin: selectedWallet,
                              network: 'Internal',
                              qty: amt,
                              fee: 0,
                              gst: 0,
                              deb: amt,
                              recipient: 'Investment Wallet',
                              recipientFull: `Sold ${amt} ${selectedWallet} for $${usdValue.toFixed(2)}`,
                              self: true,
                              status: 'Completed',
                              type: 'transfer'
                            }
                            transactionsStore.add(transaction)
                            setTransferAmount('')
                            setShowTransferWallet1(false)
                            alert('Transfer completed!')
                          }}
                        >
                          SEND
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {showInvest && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="wallet-card"
                    >
                      <div className="wallet-card-header">
                        <span>Invest Amount</span>
                      </div>
                      <div className="wallet-action-body">
                        <input 
                          className="wallet-action-input" 
                          placeholder="Amount (USD)" 
                          inputMode="decimal" 
                          value={investAmount} 
                          onChange={(e) => setInvestAmount(e.target.value)} 
                        />
                        <button 
                          className="wallet-action-send" 
                          onClick={() => {
                            const amt = parseFloat(investAmount)
                            if (!Number.isFinite(amt) || amt <= 0) { 
                              alert('Enter a valid USD amount'); 
                              return 
                            }
                            if (amt > investmentBalance) { 
                              alert('Insufficient investment balance'); 
                              return 
                            }
                            
                            // Deduct amount from investment wallet
                            investmentWallet.subtract(amt)
                            
                            // Add transaction record
                            const transaction: Transaction = {
                              id: genId(),
                              date: nowStr(),
                              coin: 'USD',
                              network: 'Investment',
                              qty: amt,
                              fee: 0,
                              gst: 0,
                              deb: amt,
                              recipient: 'Investment Platform',
                              recipientFull: `Invested $${amt.toFixed(2)} USD`,
                              self: true,
                              status: 'Completed',
                              type: 'investment'
                            }
                            transactionsStore.add(transaction)
                            
                            setInvestAmount('')
                            setShowInvest(false)
                            alert('Investment completed!')
                          }}
                        >
                          INVEST
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              
            </motion.div>
          )}

          {activeTab === 'send' && (
            <motion.div
              key="send"
              className="wallet-send"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="wallet-send-grid">
                <motion.section 
                  className="wallet-card" 
                  aria-labelledby="send-add-details"
                  variants={cardVariants}
                >
                  <div id="send-add-details" className="wallet-card-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M3 20l18-8L3 6l4 6-4 8z" stroke="#cfd6ff" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                    <span>Add details to send crypto</span>
                  </div>

                  <div className="send-field">
                    <div className="send-label">Coin</div>
                    <div className="send-select-wrap">
                      <select className="send-select" aria-label="Select Coin" value={sendCoin} onChange={(e) => setSendCoin(e.target.value)}>
                        <option value="">Select Coin</option>
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="USDT">Tether (USDT)</option>
                        <option value="BAT">Basic Attention Token (BAT)</option>
                        <option value="AUR">Aurora (AUR)</option>
                      </select>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#b8bffa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>

                  <div className="send-field">
                    <div className="send-label">Network</div>
                    <div className="send-select-wrap">
                      <select className="send-select" aria-label="Select Network" value={sendNetwork} onChange={(e) => setSendNetwork(e.target.value)}>
                        <option value="">Select Network</option>
                        <option value="Bitcoin">Bitcoin</option>
                        <option value="Ethereum">Ethereum</option>
                        <option value="Polygon">Polygon</option>
                        <option value="BSC (BEP-20)">BSC (BEP-20)</option>
                      </select>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#b8bffa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>

                  <div className="send-field">
                    <div className="send-label"><span>Recipient Address</span><span className="send-spacer" /><a className="send-link" href="#" onClick={(e) => { e.preventDefault(); alert('Add/View recipients (placeholder).') }}>ADD/VIEW</a></div>
                    <div className="send-select-wrap">
                      <select className="send-select" aria-label="Select Recipient" value={sendRecipient} onChange={(e) => setSendRecipient(e.target.value)}>
                        <option value="">Select Recipient Address</option>
                        <option value="0xA1...89fE">My Main Wallet (0xA1...89fE)</option>
                        <option value="0xB3...72c1">Cold Storage (0xB3...72c1)</option>
                        <option value="3J98t1Wp...">BTC P2SH (3J98t1Wp...)</option>
                      </select>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#b8bffa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>

                  <div className="send-field">
                    <div className="send-label">Quantity</div>
                    <div className="send-grid-qty">
                      <input className="send-input" placeholder="Enter Quantity" inputMode="decimal" value={sendQty} onChange={(e) => setSendQty(e.target.value)} />
                      <div className="send-quick-row">
                        {['25','50','75','100'].map(pct => (
                          <motion.button 
                            key={pct} 
                            className="send-chip-btn" 
                            onClick={(e) => {
                              e.preventDefault()
                              const coin = sendCoin || 'BAT'
                              const max = quickMaxByCoin[coin] ?? 0
                              let q = 0
                              const p = parseInt(pct, 10)
                              q = max * (p/100)
                              setSendQty(fmt(q))
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {pct === '100' ? 'MAX' : `${pct}%`}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.section>

                <motion.aside 
                  className="wallet-card"
                  variants={cardVariants}
                >
                  <div className="send-summary-list">
                    <div className="send-sum-row"><div className="send-sum-label">You are Sending</div><div className="send-sum-val">{sendReady ? `${fmt(parsedQty)} ${sendCoin}` : '—'}</div></div>
                    <div className="send-sum-row"><div className="send-sum-label">Fees</div><div className="send-sum-val">{sendReady ? `${fmt(fee)} ${sendCoin}` : '—'}</div></div>
                    <div className="send-sum-row"><div className="send-sum-label">GST</div><div className="send-sum-val">{sendReady ? `${fmt(gst)} ${sendCoin}` : '—'}</div></div>
                    <div className="send-sum-row"><div className="send-sum-label">Qty to be debited</div><div className="send-sum-val">{sendReady ? `${fmt(deb)} ${sendCoin}` : '—'}</div></div>
                  </div>
                  <motion.button 
                    className="send-cta" 
                    disabled={!sendReady} 
                    onClick={() => {
                      if (!sendReady) return
                      const self = /my|cold|self/i.test(sendRecipient)
                      const recLabel = sendRecipient
                      const recFull = sendRecipient
                      
                      // Update crypto store - deduct the sent amount
                      cryptoStore.delta(sendCoin as CryptoSymbol, -deb)
                      
                      const transaction: Transaction = {
                        id: genId(),
                        date: nowStr(),
                        coin: sendCoin,
                        network: sendNetwork,
                        qty: parsedQty,
                        fee, gst, deb,
                        recipient: recLabel,
                        recipientFull: recFull,
                        self,
                        status: 'Completed',
                        type: 'send'
                      }
                      transactionsStore.add(transaction)
                      setSendQty('')
                      alert('Transaction recorded (mock).')
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    PROCEED TO SEND CRYPTO
                  </motion.button>
                </motion.aside>
              </div>
            </motion.div>
          )}

          {activeTab === 'receive' && (
            <motion.div
              key="receive"
              className="wallet-send"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="wallet-send-grid">
                <motion.section 
                  className="wallet-card" 
                  aria-labelledby="recv-add-details"
                  variants={cardVariants}
                >
                  <div id="recv-add-details" className="wallet-card-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M3 20l18-8L3 6l4 6-4 8z" stroke="#cfd6ff" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                    <span>Enter details to view address</span>
                  </div>

                  <div className="send-field">
                    <div className="send-label">Coin</div>
                    <div className="send-select-wrap">
                      <select className="send-select" aria-label="Select Coin" value={recvCoin} onChange={(e) => setRecvCoin(e.target.value)}>
                        <option value="">Select Coin</option>
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="USDT">Tether (USDT)</option>
                        <option value="BCH">Bitcoin Cash (BCH)</option>
                        <option value="AUR">Aurora (AUR)</option>
                      </select>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#b8bffa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>

                  <div className="send-field">
                    <div className="send-label">Network</div>
                    <div className="send-select-wrap">
                      <select className="send-select" aria-label="Select Network" value={recvNetwork} onChange={(e) => setRecvNetwork(e.target.value)}>
                        <option value="">Select Network</option>
                        <option value="Bitcoin">Bitcoin</option>
                        <option value="Ethereum">Ethereum</option>
                        <option value="Polygon">Polygon</option>
                        <option value="Bitcoin Cash">Bitcoin Cash</option>
                      </select>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#b8bffa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>

                  <div className="send-field">
                    <div className="send-label"><span>Address Label</span><span className="send-spacer" /><a className="send-link" href="#" onClick={(e) => { e.preventDefault(); const name = prompt('New label name'); if (name) setRecvLabel(name) }}>ADD</a></div>
                    <div className="send-select-wrap">
                      <select className="send-select" aria-label="Address Label" value={recvLabel} onChange={(e) => setRecvLabel(e.target.value)}>
                        <option value="">Select label</option>
                        <option value="My address">My address</option>
                        <option value="Trading wallet">Trading wallet</option>
                      </select>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="#b8bffa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>

                  {(recvCoin && recvNetwork) && (
                    <motion.div 
                      className="recv-note"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <strong>Note</strong>
                      <div>Please only receive the selected coin on the selected network. We will not be able to recover tokens sent on a different network.</div>
                    </motion.div>
                  )}
                </motion.section>

                <motion.aside 
                  className="wallet-card"
                  variants={cardVariants}
                >
                  {!(recvCoin && recvNetwork) ? (
                    <div>
                      <div className="send-label" style={{ marginBottom: 6, fontSize: 18 }}>Add Details</div>
                      <div className="send-label" style={{ color: '#9aa0c7', fontWeight: 500 }}>Please select the coin and network details to view the crypto address.</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#b7e48d', color: '#1a2b0d', display: 'grid', placeItems: 'center', fontWeight: 900 }}>₿</div>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 18 }}>Important Notice!</div>
                          <div className="send-label" style={{ color: '#9aa0c7' }}>Receive only the selected coin on the selected network.</div>
                        </div>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                        <input type="checkbox" checked={recvAck} onChange={(e) => setRecvAck(e.target.checked)} />
                        <span className="send-label" style={{ color: '#9aa0c7' }}>I am receiving <strong>{recvCoin || '—'}</strong> over <strong>{recvNetwork || '—'}</strong> Network</span>
                      </label>

                      <motion.button 
                        className="send-cta" 
                        disabled={!recvAck} 
                        onClick={() => {
                          const addr = genRecvAddress(recvCoin, recvNetwork)
                          setRecvAddress(addr)
                          // record a view entry into common txs
                          const transaction: Transaction = {
                            id: genId(),
                            date: nowStr(),
                            coin: recvCoin,
                            network: recvNetwork,
                            qty: 0,
                            fee: 0,
                            gst: 0,
                            deb: 0,
                            recipient: '—',
                            recipientFull: 'Receive address viewed',
                            self: false,
                            status: 'Completed',
                            type: 'receive'
                          }
                          transactionsStore.add(transaction)
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ACKNOWLEDGE & VIEW ADDRESS
                      </motion.button>

                      <AnimatePresence>
                        {recvAddress && (
                          <motion.div 
                            style={{ marginTop: 10 }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="send-label" style={{ marginTop: 6 }}>Your deposit address</div>
                            <div className="recv-addr">{recvAddress}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.aside>
              </div>
            </motion.div>
          )}
                 </AnimatePresence>

         {/* Common Transaction History */}
         <motion.div 
           className="wallet-section-title"
           variants={cardVariants}
         >
           Transaction History
         </motion.div>
         <motion.div 
           className="send-table"
           variants={cardVariants}
         >
           <div className="send-thead">
             <div>Date &amp; Time</div>
             <div>Total Qty</div>
             <div>Recipient Address</div>
             <div>Network</div>
             <div>Self Transfer</div>
             <div>Status</div>
             <div>Transaction ID</div>
             <div></div>
           </div>
           <div className="send-tbody">
             {transactions.length === 0 ? (
               <div className="send-trow"><div>—</div><div>—</div><div>—</div><div>—</div><div><span className="send-tag">—</span></div><div>—</div><div>—</div><div></div></div>
             ) : (
               transactions.map((t: Transaction, index: number) => (
                 <motion.div 
                   className="send-trow" 
                   key={t.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: index * 0.05 }}
                 >
                   <div>{t.date}</div>
                   <div>{fmt(t.qty)} {t.coin}</div>
                   <div title={t.recipientFull}>{t.recipient}</div>
                   <div>{t.network}</div>
                   <div><span className="send-tag">{t.self ? 'Yes' : 'No'}</span></div>
                   <div className={t.status === 'Completed' ? 'send-status ok' : 'send-status fail'}>{t.status}</div>
                   <div>{t.id}</div>
                   <div></div>
                 </motion.div>
               ))
             )}
           </div>
         </motion.div>
         
       </div>
     </motion.div>
   )
 }

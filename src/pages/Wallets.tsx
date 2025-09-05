  import { useEffect, useMemo, useRef, useState } from 'react'
import { cryptoStore, type CryptoSymbol } from '../state/cryptoStore'
import { prices } from '../state/prices'
import { cryptoMeta } from '../state/cryptoMeta'
import { investmentWallet } from '../state/investmentWallet'
import { useCryptoStore } from '../state/useCryptoStore'
import { transactionsStore, type Transaction } from '../state/transactions'
import { TransactionsTable } from '../components/wallet/TransactionsTable'
import { InvestmentNotification } from '../components/common/InvestmentNotification'



  export default function Wallets() {
    const [hideAmounts, setHideAmounts] = useState(false)
    
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
      return (saved as CryptoSymbol) || 'SEPOLIA_ETH'
    })
    const [wallet1Balance, setWallet1Balance] = useState<number>(cryptoStore.get(selectedWallet))
    const [investmentBalance, setInvestmentBalance] = useState<number>(investmentWallet.getBalance())
    const [showTransferWallet1, setShowTransferWallet1] = useState<boolean>(false)
    const [transferAmount, setTransferAmount] = useState<string>('')
    const [showInvest, setShowInvest] = useState<boolean>(false)
    const [investAmount, setInvestAmount] = useState<string>('') // USD amount for investment

    // Investment notification state
    const [showInvestmentNotification, setShowInvestmentNotification] = useState<boolean>(false)
    const [notificationAmount, setNotificationAmount] = useState<number>(0)
    const [notificationSourceWallet, setNotificationSourceWallet] = useState<string>('')

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

    // Investment notification handlers
    const handleShowInvestmentNotification = (amount: number, sourceWallet: string) => {
      setNotificationAmount(amount)
      setNotificationSourceWallet(sourceWallet)
      setShowInvestmentNotification(true)
    }

    const handleInvestNow = () => {
      setShowInvestmentNotification(false)
      window.location.href = `/app/investment?amount=${notificationAmount}&source=${notificationSourceWallet}%20Wallet`
    }

    const handleDismissNotification = () => {
      setShowInvestmentNotification(false)
    }

    const genRecvAddress = (coin: string, net: string) => {
      const prefix = coin === 'BTC' ? 'bc1' : coin === 'ETH' || coin === 'USDT' || coin === 'SEPOLIA_ETH' ? '0x' : 'addr_'
      return `${prefix}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`.slice(0, 46)
    }

    const handleInternalTransfer = (): boolean => {
      const amt = parseFloat(transferAmount)
      if (!Number.isFinite(amt) || amt <= 0) { alert('Enter a valid amount'); return false }
      if (amt > wallet1Balance) { alert('Insufficient Wallet 1 balance'); return false }
      
      // Convert crypto to USD using price dictionary
      const cryptoPrice = prices.get(selectedWallet)
      const usdValue = amt * cryptoPrice
      console.log(`HandleInternalTransfer: ${amt} ${selectedWallet} at $${cryptoPrice} = $${usdValue}`)
      console.log(`Crypto balance before: ${cryptoStore.get(selectedWallet)}`)
      
      investmentWallet.add(usdValue)
      cryptoStore.delta(selectedWallet, -amt)
      
      console.log(`Crypto balance after: ${cryptoStore.get(selectedWallet)}`)
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
      return true
    }



    // FX: flying triangle
    const containerRef = useRef<HTMLDivElement | null>(null)
    const fxLayerRef = useRef<HTMLDivElement | null>(null)
    const wallet1IconRef = useRef<HTMLDivElement | null>(null)
    const investIconRef = useRef<HTMLDivElement | null>(null)
    const sweepingRef = useRef<boolean>(false)

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

    return (
      <>
      <div className="wallet">
        <div className="wallet-container" ref={containerRef}>
          <div className="wallet-fx-layer" ref={fxLayerRef} />
          {/* Topbar */}
          <div className="wallet-topbar">
            <div className="wallet-title">Wallet</div>
            <div className="wallet-status-bar">
              

              <div className="wallet-row">
                <button className="wallet-icon-btn" title="Profile">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" stroke="#b8bffa" strokeWidth="1.8" />
                    <path d="M4 20c2.5-4 13.5-4 16 0" stroke="#b8bffa" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
                <button className="wallet-icon-btn" title="Security">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" stroke="#b8bffa" strokeWidth="1.8" />
                  </svg>
                </button>
                <button className="wallet-icon-btn" title="Notifications">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 18h12l-1.6-2.7a7 7 0 0 1-1-3.6V9a4.4 4.4 0 0 0-8.8 0v2.7c0 1.3-.34 2.5-1 3.6L6 18z" stroke="#b8bffa" strokeWidth="1.8" />
                    <circle cx="12" cy="20.2" r="1.6" fill="#b8bffa" />
                  </svg>
                </button>
                <button className="wallet-icon-btn" title="Hide/Show balances" onClick={() => setHideAmounts((v) => !v)} aria-pressed={hideAmounts}>
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
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="wallet-tabs">
            <button className={`wallet-tab ${activeTab === 'balance' ? 'active' : ''}`} onClick={() => setActiveTab('balance')}>BALANCE</button>
            <button className={`wallet-tab ${activeTab === 'send' ? 'active' : ''}`} onClick={() => setActiveTab('send')}>SEND CRYPTO</button>
            <button className={`wallet-tab ${activeTab === 'receive' ? 'active' : ''}`} onClick={() => setActiveTab('receive')}>RECEIVE CRYPTO</button>
          </div>

          {activeTab === 'balance' && (
          <>
          <div className="wallet-grid">
            {/* Left card */}
            <section className="wallet-card">
              <div className="wallet-card-header">
                <div className="wallet-token-badge" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M4 7a3 3 0 0 1 3-3h10a2 2 0 0 1 2 2v2h1a1 1 0 1 1 0 2H4V7Z" fill="#9ad0ff"/>
                    <rect x="4" y="8" width="16" height="10" rx="3" fill="#5b7cfa"/>
                  </svg>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  flex: 1,
                  justifyContent: 'space-between',
                  position: 'relative'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: 'linear-gradient(135deg, rgba(114,87,255,0.1) 0%, rgba(93,199,255,0.1) 100%)',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    minWidth: '180px',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      background: cryptoMeta[selectedWallet]?.color || '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {selectedWallet.charAt(0)}
                    </div>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: '#ffffff',
                      flex: 1
                    }}>
                      {cryptoMeta[selectedWallet]?.name || selectedWallet}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7 }}>
                      <path d="M6 9l6 6 6-6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <select 
                      value={selectedWallet} 
                      onChange={(e) => setSelectedWallet(e.target.value as CryptoSymbol)}
                      style={{
                        position: 'absolute',
                        opacity: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                        top: 0,
                        left: 0
                      }}
                    >
                      <option value="SEPOLIA_ETH">Sepolia-ETH Wallet</option>
                      <option value="BTC">BTC Wallet</option>
                      <option value="ETH">ETH Wallet</option>
                      <option value="USDT">USDT Wallet</option>
                      <option value="SOL">SOL Wallet</option>
                      <option value="BAT">BAT Wallet</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={`wallet-balance ${hideAmounts ? 'hidden-amt' : ''}`} data-amount={fmt(wallet1Balance)}>
                <div className="wallet-token-badge" aria-hidden="true" ref={wallet1IconRef}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <polygon points="12,31 21,19 3,19" fill="#ff6b6b" />
                    <polygon points="32,0 18,18 6,18" fill="#0fd0d0" />
                  </svg>
                </div>
                <div className="wallet-value">
                  <span className="num">{fmt(wallet1Balance)}</span>
                  <span className="unit">{selectedWallet}</span>
                </div>
              </div>

              <div
                className={`wallet-action wallet-action--to-invest ${showTransferWallet1 ? 'expanded' : ''}`}
                onClick={!showTransferWallet1 ? () => setShowTransferWallet1(true) : undefined}
                style={{ marginTop: '16px' }}
              >
                <div className="wallet-action-label center">TRANSFER TO INVESTMENT WALLET</div>
                <div className="wallet-action-body" onClick={(e) => e.stopPropagation()}>
                  <input className="wallet-action-input" placeholder={`Amount (${selectedWallet})`} inputMode="decimal" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
                  <button className="wallet-action-send tip-right" onClick={(e) => {
                    const btn = e.currentTarget as HTMLElement
                    const amt = parseFloat(transferAmount)
                    if (!Number.isFinite(amt) || amt <= 0 || amt > wallet1Balance) { alert('Enter a valid amount'); return }
                    
                    // Convert crypto to USD using price dictionary
                    const cryptoPrice = prices.get(selectedWallet)
                    const usdValue = amt * cryptoPrice
                    console.log(`Transfer: ${amt} ${selectedWallet} at $${cryptoPrice} = $${usdValue}`)
                    console.log(`Crypto balance before transfer: ${cryptoStore.get(selectedWallet)}`)
                    
                    triggerFly(btn, investIconRef.current, 'right', () => {
                      investmentWallet.add(usdValue)
                      cryptoStore.delta(selectedWallet, -amt)
                      
                      console.log(`Crypto balance after transfer: ${cryptoStore.get(selectedWallet)}`)
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
                      
                      // Show investment notification
                      handleShowInvestmentNotification(usdValue, selectedWallet)
                    })
                  }}>SEND</button>
                </div>
              </div>
            </section>



            {/* Right card */}
            <section className="wallet-card">
              <div className="wallet-card-header">
                <div className="wallet-token-badge" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="5" width="16" height="14" rx="3" stroke="#9ad0ff" strokeWidth="1.6" />
                    <path d="M7 9h10" stroke="#9ad0ff" strokeWidth="1.6" />
                  </svg>
                </div>
                <span>Investment Wallet</span>
                <svg className="wallet-info" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="#a9b2ff" strokeWidth="1.6" fill="none" />
                  <circle cx="12" cy="8" r="1.2" fill="#a9b2ff" />
                  <path d="M12 11v6" stroke="#a9b2ff" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>

              <div className={`wallet-balance ${hideAmounts ? 'hidden-amt' : ''}`} data-amount={fmt(investmentBalance)}>
                <div className="wallet-token-badge" aria-hidden="true" ref={investIconRef}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#F5BD02" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div className="wallet-value">
                  <span className="num">${fmt(investmentBalance)}</span>
                  <span className="unit">USD</span>
                </div>
              </div>



              <div
                className={`wallet-action wallet-action--to-invest ${showInvest ? 'expanded' : ''}`}
                onClick={!showInvest ? () => setShowInvest(true) : undefined}
                style={{ marginTop: '16px' }}
              >
                <div className="wallet-action-label center">INVEST AMOUNT</div>
                <div className="wallet-action-body" onClick={(e) => e.stopPropagation()}>
                  <input className="wallet-action-input" placeholder="Amount (USD)" inputMode="decimal" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} />
                  <button className="wallet-action-send tip-right" onClick={(e) => {
                    const amt = parseFloat(investAmount)
                    if (!Number.isFinite(amt) || amt <= 0) { alert('Enter a valid USD amount'); return }
                    if (amt > investmentBalance) { alert('Insufficient investment balance'); return }
                    
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
                    
                    // Clear form
                    setInvestAmount('')
                    setShowInvest(false)
                    
                    // Navigate to investment page with selected amount
                    window.location.href = `/app/investment?amount=${amt}&source=Investment%20Wallet`
                  }}>INVEST</button>
                </div>
              </div>
            </section>
          </div>

          </>
          )}

          {activeTab === 'send' && (
          <div className="wallet-send">
            <div className="wallet-send-grid">
              <section className="wallet-card" aria-labelledby="send-add-details">
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
                        <button key={pct} className="send-chip-btn" onClick={(e) => {
                          e.preventDefault()
                          const coin = sendCoin || 'BAT'
                          const max = quickMaxByCoin[coin] ?? 0
                          let q = 0
                          const p = parseInt(pct, 10)
                          q = max * (p/100)
                          setSendQty(fmt(q))
                        }}>{pct === '100' ? 'MAX' : `${pct}%`}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <aside className="wallet-card">
                <div className="send-summary-list">
                  <div className="send-sum-row"><div className="send-sum-label">You are Sending</div><div className="send-sum-val">{sendReady ? `${fmt(parsedQty)} ${sendCoin}` : '—'}</div></div>
                  <div className="send-sum-row"><div className="send-sum-label">Fees</div><div className="send-sum-val">{sendReady ? `${fmt(fee)} ${sendCoin}` : '—'}</div></div>
                  <div className="send-sum-row"><div className="send-sum-label">GST</div><div className="send-sum-val">{sendReady ? `${fmt(gst)} ${sendCoin}` : '—'}</div></div>
                  <div className="send-sum-row"><div className="send-sum-label">Qty to be debited</div><div className="send-sum-val">{sendReady ? `${fmt(deb)} ${sendCoin}` : '—'}</div></div>
                </div>
                <button className="send-cta" disabled={!sendReady} onClick={() => {
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
                }}>PROCEED TO SEND CRYPTO</button>
              </aside>
            </div>

          </div>
          )}

          {activeTab === 'receive' && (
          <div className="wallet-send">
            <div className="wallet-send-grid">
              <section className="wallet-card" aria-labelledby="recv-add-details">
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
                  <div className="recv-note">
                    <strong>Note</strong>
                    <div>Please only receive the selected coin on the selected network. We will not be able to recover tokens sent on a different network.</div>
                  </div>
                )}
              </section>

              <aside className="wallet-card">
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

                    <button className="send-cta" disabled={!recvAck} onClick={() => {
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
                    }}>ACKNOWLEDGE & VIEW ADDRESS</button>

                    {recvAddress && (
                      <div style={{ marginTop: 10 }}>
                        <div className="send-label" style={{ marginTop: 6 }}>Your deposit address</div>
                        <div className="recv-addr">{recvAddress}</div>
                      </div>
                    )}
                  </div>
                )}
              </aside>
            </div>
          </div>
          )}

          {/* Portfolio Link Section */}
          {/* <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <div className="wallet-card">
              <div className="wallet-callout">
                <div className="wallet-row" style={{ gap: 12 }}>
                  <div className="wallet-token-badge" style={{ width: 40, height: 40, borderRadius: '50%' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 4v8l5 3" stroke="#bfe6ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="9" stroke="#bfe6ff" strokeWidth="1.6" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800 }}>View Coins Added in your Portfolio</div>
                    <a className="wallet-link" href="/app/portfolio">VIEW PORTFOLIO</a>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Modern Transaction History */}
          <div style={{ marginTop: '2rem' }}>
            <TransactionsTable transactions={transactions} />
          </div>
          
        </div>
      </div>

      {/* Investment Notification */}
      <InvestmentNotification
        isVisible={showInvestmentNotification}
        amount={notificationAmount}
        sourceWallet={notificationSourceWallet}
        onInvest={handleInvestNow}
        onDismiss={handleDismissNotification}
      />
      
      </>
    )
  }



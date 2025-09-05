import React, { useEffect, useState } from 'react'

interface InvestmentNotificationProps {
  isVisible: boolean
  amount: number
  sourceWallet: string
  onInvest: () => void
  onDismiss: () => void
}

export const InvestmentNotification: React.FC<InvestmentNotificationProps> = ({
  isVisible,
  amount,
  sourceWallet,
  onInvest,
  onDismiss
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        onDismiss()
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onDismiss])

  if (!isVisible) return null

  return (
    <div className={`investment-notification ${isAnimating ? 'slide-in' : ''}`}>
      <div className="notification-content">
        <div className="notification-header">
          <div className="notification-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#F5BD02" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <div className="notification-title">Investment Opportunity</div>
          <button className="notification-close" onClick={onDismiss}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="notification-body">
          <p>You just transferred <strong>${amount.toFixed(2)}</strong> from your <strong>{sourceWallet}</strong>.</p>
          <p>Would you like to invest this amount now?</p>
        </div>
        
        <div className="notification-actions">
          <button className="notification-btn notification-btn--invest" onClick={onInvest}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Invest Now
          </button>
          <button className="notification-btn notification-btn--dismiss" onClick={onDismiss}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}

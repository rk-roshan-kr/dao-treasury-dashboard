import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, TrendingUp, Shield, BarChart3, Network, CheckCircle, AlertTriangle } from 'lucide-react'
import { investmentWallet } from '../state/investmentWallet'
import { formatUSD } from '../utils/format'
import InvestmentAmountInput from '../components/Investment/InvestmentAmountInput'
import InvestmentOptions, { InvestmentOption } from '../components/Investment/InvestmentOptions'


interface InvestmentData {
  selectedAmount: number
  sourceWallet?: string
}



export type InvestmentInput = {
  amount: number
  selectedOption?: InvestmentOption
}

const investmentOptions: InvestmentOption[] = [
  {
    id: 'defi',
    name: 'DeFi Protocols',
    apy: 8.5,
    risk: 'Medium',
    description: 'Earn yield through decentralized finance protocols like lending, borrowing, and yield farming. Medium volatility with moderate risk exposure.',
    icon: <Network size={24} />
  },
  {
    id: 'staking',
    name: 'Crypto Staking',
    apy: 5.2,
    risk: 'Low',
    description: 'Stake your cryptocurrency assets to earn passive income through validator rewards. Lower volatility with reduced risk exposure.',
    icon: <Shield size={24} />
  },
  {
    id: 'liquidity',
    name: 'Liquidity Mining',
    apy: 12.3,
    risk: 'High',
    description: 'Provide liquidity to decentralized exchanges and earn trading fees. High volatility with significant risk exposure.',
    icon: <BarChart3 size={24} />
  }
]

export default function Investment() {
  const location = useLocation()
  const navigate = useNavigate()
  const [investmentBalance, setInvestmentBalance] = useState<number>(0)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [investmentInput, setInvestmentInput] = useState<InvestmentInput>({
    amount: 0
  })
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  // Get investment data from location state, URL params, or localStorage
  useEffect(() => {
    const state = location.state as InvestmentData & { success?: boolean; message?: string }
    const urlParams = new URLSearchParams(location.search)
    
    // Handle success message from detail page
    if (state?.success && state?.message) {
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        // Clear stored amount after successful investment
        localStorage.removeItem('investment_selected_amount')
        localStorage.removeItem('investment_source_wallet')
        setInvestmentInput({ amount: 0 })
        setCurrentStep(1)
      }, 3000)
    }
    
    if (state?.selectedAmount) {
      setInvestmentInput(prev => ({ ...prev, amount: state.selectedAmount }))
      localStorage.setItem('investment_selected_amount', state.selectedAmount.toString())
      localStorage.setItem('investment_source_wallet', state.sourceWallet || 'Investment Wallet')
      // If coming from wallet page with amount, go directly to step 2
      setCurrentStep(2)
    } else if (urlParams.get('amount')) {
      const amount = parseFloat(urlParams.get('amount') || '0')
      setInvestmentInput(prev => ({ ...prev, amount }))
      localStorage.setItem('investment_selected_amount', amount.toString())
      localStorage.setItem('investment_source_wallet', urlParams.get('source') || 'Investment Wallet')
      // If coming from wallet page with amount, go directly to step 2
      setCurrentStep(2)
    } else {
      // Try to get from localStorage
      const savedAmount = localStorage.getItem('investment_selected_amount')
      if (savedAmount) {
        setInvestmentInput(prev => ({ ...prev, amount: parseFloat(savedAmount) }))
      }
    }
  }, [location])

  // Subscribe to investment balance updates
  useEffect(() => {
    const unsubscribe = investmentWallet.subscribe((balance) => {
      setInvestmentBalance(balance)
    })
    setInvestmentBalance(investmentWallet.getBalance())
    return unsubscribe
  }, [])

  const handleBackToWallet = () => {
    navigate('/app/wallets')
  }

  const handleAmountChange = (amount: number) => {
    setInvestmentInput(prev => ({ ...prev, amount }))
  }

  const handleProceed = () => {
    setCurrentStep(2)
  }

  const handleEditAmount = () => {
    setCurrentStep(1)
  }



  const handleClearAmount = () => {
    setInvestmentInput({ amount: 0 })
    setCurrentStep(1)
    localStorage.removeItem('investment_selected_amount')
    localStorage.removeItem('investment_source_wallet')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1230] to-[#1b1f4a] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#e9ecff] mb-2">
              Investment Dashboard
            </h1>
            <p className="text-[#8b90b2] text-lg">
              Grow your cryptocurrency with DeFi, staking, and liquidity options
            </p>
          </div>
        </motion.div>

        {/* Success Animation */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="bg-[#1b1f4a] border border-[#2a2c54] rounded-2xl p-8 text-center max-w-md mx-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-16 h-16 bg-[#36c390] rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle size={32} className="text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-[#e9ecff] mb-2">
                  Investment Successful!
                </h3>
                <p className="text-[#8b90b2]">
                  You successfully invested {formatUSD(investmentInput.amount)} in {investmentInput.selectedOption?.name}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Progress */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${currentStep >= step 
                    ? 'bg-gradient-to-r from-[#6a7bff] to-[#67c8ff] text-[#0f1230]' 
                    : 'bg-white/10 text-[#8b90b2]'
                  }
                `}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`
                    w-12 h-0.5 mx-2 transition-all duration-300
                    ${currentStep > step ? 'bg-gradient-to-r from-[#6a7bff] to-[#67c8ff]' : 'bg-white/10'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-[#8b90b2] mt-2">
            Step {currentStep} of 3
          </p>
        </motion.div>

        {/* Step 1: Investment Amount Input */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
                             <InvestmentAmountInput
                 amount={investmentInput.amount}
                 availableBalance={investmentBalance}
                 onAmountChange={handleAmountChange}
                 onClearAmount={handleClearAmount}
                 onProceed={handleProceed}
               />
            </motion.div>
          )}

          {/* Step 2: Investment Options */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
                             <InvestmentOptions
                 options={investmentOptions}
                 selectedAmount={investmentInput.amount}
                 onOptionSelect={() => {}}
                 onEditAmount={handleEditAmount}
               />
            </motion.div>
          )}

        </AnimatePresence>

         {/* General Disclaimer */}
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1 }}
           className="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl"
         >
           <div className="flex items-start gap-3">
             <AlertTriangle size={20} className="text-[#f5bd02] mt-0.5 flex-shrink-0" />
             <div>
               <h4 className="text-[#f5bd02] font-semibold mb-2">Important Disclaimer</h4>
               <p className="text-[#8b90b2] text-sm leading-relaxed">
                 Cryptocurrency investments are subject to market risk. APY rates may fluctuate and are not guaranteed. 
                 Past performance is not indicative of future results. Returns are variable and depend on market conditions. 
                 Please ensure you understand the risks before investing. This platform is for educational purposes only.
               </p>
             </div>
           </div>
         </motion.div>
       </div>
     </div>
   )
 }

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { DollarSign, Edit3 } from 'lucide-react'
import { formatUSD } from '../../utils/format'

interface InvestmentAmountInputProps {
  amount: number
  availableBalance: number
  onAmountChange: (amount: number) => void
  onClearAmount: () => void
  onProceed: () => void
}

export default function InvestmentAmountInput({
  amount,
  availableBalance,
  onAmountChange,
  onClearAmount,
  onProceed
}: InvestmentAmountInputProps) {
  const [inputValue, setInputValue] = useState<string>(amount > 0 ? amount.toString() : '')
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  // Animate balance count-up on mount
  useEffect(() => {
    const controls = animate(count, availableBalance, { duration: 2, ease: "easeOut" })
    return controls.stop
  }, [availableBalance, count])

  // Update input value when amount prop changes
  useEffect(() => {
    setInputValue(amount > 0 ? amount.toString() : '')
  }, [amount])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '')
    setInputValue(value)
    
    const numValue = parseFloat(value) || 0
    onAmountChange(numValue)
  }

  const handleMaxClick = () => {
    setInputValue(availableBalance.toString())
    onAmountChange(availableBalance)
  }

  const handleClear = () => {
    setInputValue('')
    onClearAmount()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#e9ecff] mb-2">
            Amount to Invest
          </h2>
          <p className="text-[#8b90b2]">
            Enter the amount you'd like to invest from your available crypto balance
          </p>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-[#e9ecff] font-medium mb-3">
            Investment Amount
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <DollarSign size={20} className="text-[#8b90b2]" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/20 rounded-xl pl-12 pr-24 py-4 text-[#e9ecff] text-lg font-mono placeholder-[#8b90b2] focus:outline-none focus:border-[#6a7bff] transition-colors"
            />
            <button
              onClick={handleMaxClick}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[#6a7bff] to-[#67c8ff] text-[#0f1230] px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              Max
            </button>
          </div>
        </div>

        {/* Available Balance */}
        <div className="mb-8">
          <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
            <span className="text-[#8b90b2] font-medium">Available Crypto Balance:</span>
            <motion.span className="text-[#e9ecff] font-mono text-lg font-bold">
              {formatUSD(availableBalance)}
            </motion.span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleClear}
            className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-[#e9ecff] rounded-xl hover:bg-white/15 transition-all duration-200 font-medium"
          >
            Clear Amount
          </button>
          <button
            onClick={onProceed}
            disabled={!inputValue || parseFloat(inputValue) <= 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#6a7bff] to-[#67c8ff] text-[#0f1230] rounded-xl hover:shadow-lg hover:shadow-[#6a7bff]/25 transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            Proceed
          </button>
        </div>

        {/* Validation Messages */}
        {inputValue && parseFloat(inputValue) > availableBalance && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-[#ff6b6b]/10 border border-[#ff6b6b]/20 rounded-lg"
          >
            <p className="text-[#ff6b6b] text-sm">
              Amount exceeds available balance
            </p>
          </motion.div>
        )}

        {inputValue && parseFloat(inputValue) <= 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-[#f5bd02]/10 border border-[#f5bd02]/20 rounded-lg"
          >
            <p className="text-[#f5bd02] text-sm">
              Please enter a valid amount greater than 0
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

import { motion } from 'framer-motion'
import { TrendingUp, ExternalLink, DollarSign } from 'lucide-react'
import { formatUSD } from '../../utils/format'
import { Sparkline } from './Sparkline'

interface InvestmentCardProps {
  totalUSD: number
  onInvest: () => void
  onViewPortfolio: () => void
  sparklineData?: Array<{ value: number; date: string }>
  className?: string
}

export const InvestmentCard = ({ 
  totalUSD, 
  onInvest, 
  onViewPortfolio, 
  sparklineData = [],
  className = '' 
}: InvestmentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`bg-[#1b1f4a] border border-[#2a2c54] rounded-2xl p-4 sm:p-6 shadow-lg w-full ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#6a7bff] to-[#67c8ff] rounded-full flex items-center justify-center">
            <DollarSign size={16} className="sm:w-5 sm:h-5 text-[#0f1230]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#e9ecff] tracking-wide">Investment Wallet</h3>
            <p className="text-xs sm:text-sm text-[#8b90b2]">Total Portfolio Value</p>
          </div>
        </div>
        <Sparkline data={sparklineData} />
      </div>

      {/* Total Value */}
      <div className="mb-4 sm:mb-6">
        <div className="text-2xl sm:text-4xl font-bold text-[#e9ecff] font-mono mb-1">
          {formatUSD(totalUSD)}
        </div>
        <div className="flex items-center gap-2 text-[#36c390]">
          <TrendingUp size={14} className="sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium">+$12,453.21 (3.2%)</span>
        </div>
      </div>

      {/* Portfolio Link */}
      {/* <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onViewPortfolio}
        className="w-full mb-4 flex items-center justify-center gap-2 text-[#a6c8ff] font-semibold py-3 px-4 rounded-xl border border-[#2a2c54] hover:bg-[#242655] transition-colors"
      >
        <span>View Coins Added in your Portfolio</span>
        <ExternalLink size={16} />
      </motion.button> */}

      {/* Invest Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onInvest}
        className="w-full bg-gradient-to-r from-[#6a7bff] to-[#67c8ff] text-[#0f1230] font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
      >
        Invest Amount
      </motion.button>
    </motion.div>
  )
}

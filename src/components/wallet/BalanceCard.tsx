import { motion } from 'framer-motion'
import { ArrowUpRight, Bitcoin } from 'lucide-react'
import { formatBTC } from '../../utils/format'

interface BalanceCardProps {
  coin: string
  balance: number
  onTransfer: () => void
  className?: string
}

export const BalanceCard = ({ coin, balance, onTransfer, className = '' }: BalanceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-[#1b1f4a] border border-[#2a2c54] rounded-2xl p-4 sm:p-6 shadow-lg w-full ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F5BD02] rounded-full flex items-center justify-center">
            <Bitcoin size={16} className="sm:w-5 sm:h-5 text-[#0a0a0a]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#e9ecff] tracking-wide">{coin}</h3>
            <p className="text-xs sm:text-sm text-[#8b90b2]">Crypto Wallet</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[#36c390]">
          <ArrowUpRight size={14} className="sm:w-4 sm:h-4" />
          <span className="text-xs font-medium">+2.5%</span>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4 sm:mb-6">
        <div className="text-2xl sm:text-4xl font-bold text-[#e9ecff] font-mono mb-1">
          {formatBTC(balance)}
        </div>
        <p className="text-xs sm:text-sm text-[#8b90b2]">Available Balance</p>
      </div>

      {/* Transfer Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onTransfer}
        className="w-full bg-gradient-to-r from-[#6a7bff] to-[#67c8ff] text-[#0f1230] font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
      >
        Transfer to Investment Wallet
      </motion.button>
    </motion.div>
  )
}

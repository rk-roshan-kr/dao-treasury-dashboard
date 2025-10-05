import { motion } from 'framer-motion'
import { formatUSD } from '../../utils/format'
import { InvestmentOption } from './InvestmentOptions'
import RiskBadge from './RiskBadge'

interface InvestmentCardProps {
  option: InvestmentOption
  selectedAmount: number
  onSelect: (option: InvestmentOption) => void
}

export default function InvestmentCard({
  option,
  selectedAmount,
  onSelect
}: InvestmentCardProps) {
  const monthlyReturn = (selectedAmount * option.apy / 100) / 12
  const yearlyReturn = selectedAmount * option.apy / 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-[#6a7bff] to-[#67c8ff] rounded-xl flex items-center justify-center text-[#0f1230]">
          {option.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-[#e9ecff] font-semibold text-xl mb-1">{option.name}</h3>
          <RiskBadge risk={option.risk} />
        </div>
      </div>

      {/* Description */}
      <p className="text-[#8b90b2] leading-relaxed mb-6">
        {option.description}
      </p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-[#8b90b2] text-sm mb-1">APY</div>
          <div className="text-[#36c390] font-bold text-2xl">{option.apy}%</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-[#8b90b2] text-sm mb-1">Monthly Return</div>
          <div className="text-[#e9ecff] font-mono font-bold">
            {formatUSD(monthlyReturn)}
          </div>
        </div>
      </div>

      {/* Expected Returns */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
        <h4 className="text-[#e9ecff] font-semibold mb-3">Expected Returns</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-[#8b90b2]">Yearly Return:</span>
            <span className="text-[#36c390] font-mono font-bold">
              {formatUSD(yearlyReturn)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8b90b2]">Total After 1 Year:</span>
            <span className="text-[#e9ecff] font-mono font-bold">
              {formatUSD(selectedAmount + yearlyReturn)}
            </span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onSelect(option)}
        className="w-full bg-gradient-to-r from-[#6a7bff] to-[#67c8ff] text-[#0f1230] py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-[#6a7bff]/25 transition-all duration-200"
      >
        Invest in {option.name}
      </button>
    </motion.div>
  )
}

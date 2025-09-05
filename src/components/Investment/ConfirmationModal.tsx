import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import { formatUSD } from '../../utils/format'
import { InvestmentInput } from '../../pages/Investment'
import RiskBadge from './RiskBadge'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  investmentInput: InvestmentInput
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  investmentInput
}: ConfirmationModalProps) {
  if (!investmentInput.selectedOption) return null

  const { amount, selectedOption } = investmentInput
  const monthlyReturn = (amount * selectedOption.apy / 100) / 12
  const yearlyReturn = amount * selectedOption.apy / 100

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1b1f4a] border border-[#2a2c54] rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#e9ecff]">
                Confirm Investment
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-[#8b90b2]" />
              </button>
            </div>

                         {/* Warning */}
             <div className="bg-[#f5bd02]/10 border border-[#f5bd02]/20 rounded-xl p-4 mb-6">
               <div className="flex items-start gap-3">
                 <AlertTriangle size={20} className="text-[#f5bd02] mt-0.5 flex-shrink-0" />
                 <div>
                   <h4 className="text-[#f5bd02] font-semibold mb-1">Investment Risk Warning</h4>
                   <p className="text-[#8b90b2] text-sm leading-relaxed">
                     Cryptocurrency investments carry inherent risks. APY rates may fluctuate. Returns are not guaranteed. 
                     Past performance is not indicative of future results. Please ensure you understand the risks before proceeding.
                   </p>
                 </div>
               </div>
             </div>

            {/* Investment Summary */}
            <div className="space-y-6">
              {/* Strategy Details */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-[#e9ecff] font-semibold text-lg mb-4">Investment Strategy</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#6a7bff] to-[#67c8ff] rounded-xl flex items-center justify-center text-[#0f1230]">
                    {selectedOption.icon}
                  </div>
                  <div>
                    <h4 className="text-[#e9ecff] font-semibold text-lg">{selectedOption.name}</h4>
                    <RiskBadge risk={selectedOption.risk} />
                  </div>
                </div>
                <p className="text-[#8b90b2] leading-relaxed">
                  {selectedOption.description}
                </p>
              </div>

              {/* Investment Details */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-[#e9ecff] font-semibold text-lg mb-4">Investment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#8b90b2]">Investment Amount:</span>
                    <span className="text-[#e9ecff] font-mono font-bold">{formatUSD(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b90b2]">APY:</span>
                    <span className="text-[#36c390] font-bold">{selectedOption.apy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8b90b2]">Risk Level:</span>
                    <RiskBadge risk={selectedOption.risk} />
                  </div>
                </div>
              </div>

                             {/* Hypothetical Projection */}
               <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                 <h3 className="text-[#e9ecff] font-semibold text-lg mb-4">Hypothetical Projection</h3>
                 <div className="space-y-3">
                   <div className="flex justify-between">
                     <span className="text-[#8b90b2]">If APY remains {selectedOption.apy}%:</span>
                     <span className="text-[#e9ecff] font-mono font-bold">
                       ~{formatUSD(yearlyReturn)} per year
                     </span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-[#8b90b2]">Total after 1 year:</span>
                     <span className="text-[#36c390] font-mono font-bold">
                       ~{formatUSD(amount + yearlyReturn)}
                     </span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-[#8b90b2]">Fees:</span>
                     <span className="text-[#e9ecff] font-mono">$0.00</span>
                   </div>
                 </div>
                 <div className="mt-4 p-3 bg-[#f5bd02]/10 border border-[#f5bd02]/20 rounded-lg">
                   <p className="text-[#f5bd02] text-xs">
                     This is a hypothetical projection. APY rates may fluctuate. Returns are not guaranteed.
                   </p>
                 </div>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-[#e9ecff] rounded-xl hover:bg-white/15 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#6a7bff] to-[#67c8ff] text-[#0f1230] rounded-xl hover:shadow-lg hover:shadow-[#6a7bff]/25 transition-all duration-200 font-bold"
              >
                Confirm Investment
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

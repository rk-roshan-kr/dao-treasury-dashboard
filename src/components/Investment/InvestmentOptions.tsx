import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit3, TrendingUp, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { formatUSD } from '../../utils/format'
import RiskBadge from './RiskBadge'

export type InvestmentOption = {
  id: 'defi' | 'staking' | 'liquidity'
  name: string
  apy: number
  risk: 'Low' | 'Medium' | 'High'
  description: string
  icon: React.ReactNode
}

interface InvestmentOptionsProps {
  options: InvestmentOption[]
  selectedAmount: number
  onOptionSelect: (option: InvestmentOption) => void
  onEditAmount: () => void
}

export default function InvestmentOptions({
  options,
  selectedAmount,
  onOptionSelect,
  onEditAmount
}: InvestmentOptionsProps) {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState<string | null>(null)

  // Historical performance data for charts with extreme volatility
  const generateHistoricalData = (apy: number) => {
    const data = []
    const baseValue = 100
    let currentValue = baseValue
    const baseVolatility = apy / 100 * 2.5 // Much higher base volatility
    const cryptoVolatility = 0.15 // Additional crypto-specific volatility
    
    // Generate 90 days of historical data
    for (let i = 0; i <= 90; i += 10) {
      // Extreme volatility with multiple factors
      const randomFactor = Math.random() - 0.5
      const volatility = baseVolatility + cryptoVolatility
      const dailyChange = randomFactor * volatility * 8 // 8x multiplier for extreme swings
      
      // Add occasional extreme spikes (crypto-style)
      const spikeChance = Math.random()
      let spikeMultiplier = 1
      if (spikeChance > 0.95) {
        spikeMultiplier = 3 // 300% spike
      } else if (spikeChance < 0.05) {
        spikeMultiplier = 0.3 // 70% crash
      }
      
      const dailyReturn = (apy / 100 / 365) + (dailyChange * spikeMultiplier) / 100
      currentValue = currentValue * (1 + dailyReturn)
      
      data.push({
        date: `Day ${i}`,
        value: Math.max(currentValue, baseValue * 0.1) // Much lower minimum for extreme drops
      })
    }
    
    return data
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#e9ecff] mb-1">
            Choose Investment Strategy
          </h2>
          <p className="text-[#8b90b2]">
            Select from our curated investment options
          </p>
        </div>
      </div>

      {/* Investment Amount Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#6a7bff] to-[#67c8ff] rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-[#0f1230] font-medium mb-2">Amount to Invest</p>
            <p className="text-[#0f1230] text-3xl font-bold font-mono">
              {formatUSD(selectedAmount)}
            </p>
          </div>
          <button
            onClick={onEditAmount}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Edit Amount"
          >
            <Edit3 size={20} className="text-[#0f1230]" />
          </button>
        </div>
      </motion.div>

      {/* Investment Options Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedTab(selectedTab === option.id ? null : option.id)}
            className={`
              p-6 rounded-2xl border transition-all duration-300 text-left
              ${selectedTab === option.id
                ? 'bg-white/10 border-[#6a7bff] shadow-lg shadow-[#6a7bff]/25'
                : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
              }
            `}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#6a7bff] to-[#67c8ff] rounded-xl flex items-center justify-center text-[#0f1230]">
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-[#e9ecff] font-semibold text-lg">{option.name}</h3>
                <RiskBadge risk={option.risk} />
              </div>
            </div>
            
                         <div className="space-y-2">
               <div className="flex justify-between items-center">
                 <span className="text-[#8b90b2]">APY (Variable)</span>
                 <span className="text-[#36c390] font-bold text-lg">{option.apy}%</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[#8b90b2]">Risk Level</span>
                 <RiskBadge risk={option.risk} />
               </div>
             </div>
          </motion.button>
        ))}
      </div>

      {/* Expanded Option Details */}
      <AnimatePresence mode="wait">
        {selectedTab && (
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
                         {(() => {
               const option = options.find(opt => opt.id === selectedTab)
               if (!option) return null

               const historicalData = generateHistoricalData(option.apy)
               const yearlyReturn = selectedAmount * option.apy / 100

               return (
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                   <div className="grid lg:grid-cols-2 gap-8">
                     {/* Left Column - Details */}
                     <div className="space-y-6">
                       <div>
                         <h3 className="text-2xl font-bold text-[#e9ecff] mb-2">
                           {option.name}
                         </h3>
                         <p className="text-[#8b90b2] leading-relaxed">
                           {option.description}
                         </p>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                           <div className="text-[#8b90b2] text-sm mb-1">APY (Variable)</div>
                           <div className="text-[#36c390] font-bold text-2xl">{option.apy}%</div>
                         </div>
                         <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                           <div className="text-[#8b90b2] text-sm mb-1">Risk Level</div>
                           <RiskBadge risk={option.risk} />
                         </div>
                       </div>

                       <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                         <h4 className="text-[#e9ecff] font-semibold mb-4">Hypothetical Projection</h4>
                         <div className="space-y-3">
                           <div className="flex justify-between">
                             <span className="text-[#8b90b2]">If APY remains {option.apy}%:</span>
                             <span className="text-[#e9ecff] font-mono font-bold">
                               ~{formatUSD(yearlyReturn)} per year
                             </span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-[#8b90b2]">Total after 1 year:</span>
                             <span className="text-[#36c390] font-mono font-bold">
                               ~{formatUSD(selectedAmount + yearlyReturn)}
                             </span>
                           </div>
                         </div>
                         <div className="mt-4 p-3 bg-[#f5bd02]/10 border border-[#f5bd02]/20 rounded-lg">
                           <div className="flex items-start gap-2">
                             <AlertTriangle size={16} className="text-[#f5bd02] mt-0.5 flex-shrink-0" />
                             <p className="text-[#f5bd02] text-xs">
                               This is a hypothetical projection. APY rates may fluctuate. Returns are not guaranteed.
                             </p>
                           </div>
                         </div>
                       </div>

                       <button
                         onClick={() => navigate(`/app/investment-detail?option=${option.id}&amount=${selectedAmount}`)}
                         className="w-full bg-gradient-to-r from-[#6a7bff] to-[#67c8ff] text-[#0f1230] py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-[#6a7bff]/25 transition-all duration-200"
                       >
                         Invest in {option.name}
                       </button>
                     </div>

                     {/* Right Column - Historical Performance Chart */}
                     <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                       <div className="flex items-center justify-between mb-4">
                         <h4 className="text-[#e9ecff] font-semibold">Past Performance (90 Days)</h4>
                         <p className="text-[#36c390] text-sm font-medium">+{option.apy}% APY</p>
                       </div>
                       <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={historicalData}>
                             <XAxis dataKey="date" hide />
                             <YAxis hide />
                             <Tooltip
                               contentStyle={{
                                 backgroundColor: '#1b1f4a',
                                 border: '1px solid rgba(255,255,255,0.2)',
                                 borderRadius: '8px',
                                 color: '#e9ecff'
                               }}
                               formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                               labelFormatter={(label) => label}
                             />
                             <Line
                               type="monotone"
                               dataKey="value"
                               stroke="#36c390"
                               strokeWidth={2}
                               dot={false}
                             />
                           </LineChart>
                         </ResponsiveContainer>
                       </div>
                       <div className="mt-4 text-center">
                         <p className="text-[#8b90b2] text-xs">
                           Past performance is not indicative of future results. Crypto investments are subject to market risk.
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>
               )
             })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

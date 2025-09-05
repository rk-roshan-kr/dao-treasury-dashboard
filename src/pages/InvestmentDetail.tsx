import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  TrendingUp, Shield, BarChart3, Network, AlertTriangle, Info,
  Calendar, DollarSign, Activity, Users, Lock, ArrowLeft, Edit3,
  Star, ChevronDown, ChevronUp, ExternalLink, Download, Share2,
  Facebook, Twitter, Linkedin, MessageCircle, Globe, Award,
  Target, PieChart, LineChart as LineChartIcon, BarChart, 
  TrendingDown, Zap, Coins, Wallet, Clock, CheckCircle
} from 'lucide-react'
import { investmentWallet } from '../state/investmentWallet'
import { formatUSD } from '../utils/format'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar } from 'recharts'
import { InvestmentOption } from '../components/Investment/InvestmentOptions'
import RiskBadge from '../components/Investment/RiskBadge'

// Investment options data
const investmentOptions: InvestmentOption[] = [
  {
    id: 'defi',
    name: 'DeFi Protocols',
    apy: 8.5,
    risk: 'Medium',
    description: 'Earn yield through decentralized finance protocols',
    icon: <Network className="w-6 h-6" />
  },
  {
    id: 'staking',
    name: 'Staking',
    apy: 5.2,
    risk: 'Low',
    description: 'Stake your crypto to earn passive income',
    icon: <Shield className="w-6 h-6" />
  },
  {
    id: 'liquidity',
    name: 'Liquidity Mining',
    apy: 12.3,
    risk: 'High',
    description: 'Provide liquidity to earn trading fees and rewards',
    icon: <BarChart3 className="w-6 h-6" />
  }
]

// Generate historical data with extreme volatility
const generateHistoricalData = (apy: number, timeRange: string) => {
  const data = []
  let value = 100
  const baseVolatility = apy / 100 * 2.5 // Much higher base volatility
  const cryptoVolatility = 0.15 // Additional crypto-specific volatility
  
  // Determine number of data points based on time range
  let days = 365
  switch (timeRange) {
    case '1M': days = 30; break
    case '6M': days = 180; break
    case '1Y': days = 365; break
    case '3Y': days = 1095; break
    case '5Y': days = 1825; break
    case 'ALL': days = 2555; break // ~7 years
  }
  
  for (let i = 0; i < days; i++) {
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
    
    value = value * (1 + (dailyChange * spikeMultiplier) / 100)
    const date = new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000)
    
    data.push({
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit' 
      }),
      value: Math.max(value, 10), // Much lower minimum for extreme drops
      fullDate: date.toISOString()
    })
  }
  return data
}

// Portfolio allocation data
const portfolioData = [
  { name: 'DeFi Protocols', value: 45, color: '#3B82F6' },
  { name: 'Staking', value: 30, color: '#10B981' },
  { name: 'Liquidity Mining', value: 15, color: '#F59E0B' },
  { name: 'Cash', value: 10, color: '#6B7280' }
]

// Performance comparison data
const performanceData = [
  { name: 'This Fund', value: 8.5, color: '#3B82F6' },
  { name: 'Bitcoin', value: 2.1, color: '#F7931A' },
  { name: 'Ethereum', value: 4.2, color: '#627EEA' },
  { name: 'Market Average', value: 3.8, color: '#6B7280' }
]

// Fund manager data
const fundManager = {
  name: 'Alex Chen',
  experience: '8 years',
  education: 'Stanford University, Computer Science',
  specialization: 'DeFi & Blockchain Technology',
  managedFunds: 12,
  totalAUM: '$2.4B',
  performance: '+156%',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
}

// Fund details
const fundDetails = {
  inception: 'March 2021',
  minInvestment: 100,
  fundSize: 1250000000, // $1.25B
  expenseRatio: 0.85,
  benchmark: 'Crypto Market Index',
  category: 'DeFi & Yield Farming',
  strategy: 'Multi-strategy yield optimization'
}

export default function InvestmentDetail() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState<InvestmentOption | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState<number>(0)
  const [timeRange, setTimeRange] = useState('1Y')
  const [investmentType, setInvestmentType] = useState<'one-time' | 'monthly'>('one-time')
  const [sipAmount, setSipAmount] = useState<number>(0)
  const [sipDate, setSipDate] = useState<number>(1)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'performance', 'portfolio', 'manager', 'holdings', 'fundhouse', 'objective', 'risk']))

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const amount = params.get('amount')
    const optionId = params.get('option')
    const fromWallet = params.get('fromWallet')
    
    if (amount) {
      const numAmount = parseFloat(amount)
      setInvestmentAmount(numAmount)
      setSipAmount(numAmount)
    } else {
      const storedAmount = localStorage.getItem('investment_selected_amount')
      if (storedAmount) {
        const numAmount = parseFloat(storedAmount)
        setInvestmentAmount(numAmount)
        setSipAmount(numAmount)
      }
    }

    if (optionId) {
      const option = investmentOptions.find(opt => opt.id === optionId)
      if (option) {
        setSelectedOption(option)
      }
    }

    // If coming from wallet, scroll to performance section after a short delay
    if (fromWallet === 'true') {
      setTimeout(() => {
        const performanceSection = document.getElementById('performance-section')
        if (performanceSection) {
          performanceSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
      }, 500) // Small delay to ensure component is rendered
    }
  }, [location])

  const handleBack = () => {
    navigate('/app/investment')
  }

  const handleEdit = () => {
    navigate('/app/investment')
  }

  const handleInvest = () => {
    console.log('Investing:', {
      option: selectedOption?.name,
      amount: investmentType === 'one-time' ? investmentAmount : sipAmount,
      type: investmentType
    })
    
    setTimeout(() => {
      navigate('/app/investment', { 
        state: { 
          success: true, 
          message: `Successfully invested ${formatUSD(investmentType === 'one-time' ? investmentAmount : sipAmount)} in ${selectedOption?.name}` 
        } 
      })
    }, 1000)
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  // Generate historical data only when timeRange changes, not when investment amount changes
  const historicalData = useMemo(() => {
    return generateHistoricalData(selectedOption?.apy || 0, timeRange)
  }, [selectedOption?.apy, timeRange])

  if (!selectedOption) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1230] to-[#1b1f4a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Investment Option Not Found</div>
          <button 
            onClick={handleBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1230] to-[#1b1f4a]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f1230]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-white text-xl font-semibold">{selectedOption.name}</h1>
                <p className="text-slate-400 text-sm">Crypto Investment Fund</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Share2 className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Download className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Main Content - Left Side */}
           <div className="lg:col-span-2 space-y-8">
             {/* Performance Chart - Moved to top */}
             <motion.div 
               id="performance-section"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
             >
               <div className="p-6">
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-white text-xl font-semibold">Performance</h2>
                   <button 
                     onClick={() => toggleSection('performance')}
                     className="p-1 hover:bg-white/10 rounded transition-colors"
                   >
                     {expandedSections.has('performance') ? 
                       <ChevronUp className="w-5 h-5 text-white" /> : 
                       <ChevronDown className="w-5 h-5 text-white" />
                     }
                   </button>
                 </div>
                 
                 <AnimatePresence>
                   {expandedSections.has('performance') && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: 'auto', opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       transition={{ duration: 0.3 }}
                       className="space-y-6"
                     >
                       {/* Chart */}
                       <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                           <LineChart data={historicalData}>
                             <XAxis 
                               dataKey="date" 
                               hide 
                               tick={{ fill: '#94A3B8' }}
                             />
                             <YAxis 
                               hide 
                               tick={{ fill: '#94A3B8' }}
                             />
                             <Tooltip 
                               contentStyle={{ 
                                 backgroundColor: '#1E293B', 
                                 border: '1px solid #334155',
                                 borderRadius: '8px',
                                 color: '#F1F5F9'
                               }}
                               formatter={(value: any) => [`$${value.toFixed(2)}`, 'NAV']}
                               labelFormatter={(label) => `Date: ${label}`}
                             />
                             <Line 
                               type="monotone" 
                               dataKey="value" 
                               stroke="#10B981" 
                               strokeWidth={3} 
                               dot={false}
                               activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                             />
                           </LineChart>
                         </ResponsiveContainer>
                       </div>

                       {/* Time Range Selector - Moved below chart */}
                       <div className="flex justify-center gap-2">
                         {['1M', '6M', '1Y', '3Y', '5Y', 'ALL'].map((range) => (
                           <button
                             key={range}
                             onClick={() => setTimeRange(range)}
                             className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                               timeRange === range 
                                 ? 'bg-green-500 text-black font-semibold' 
                                 : 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/20'
                             }`}
                           >
                             {range}
                           </button>
                         ))}
                       </div>

                       {/* Performance Stats */}
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div className="bg-white/5 rounded-lg p-4 text-center">
                           <div className="text-slate-400 text-sm">1 Month</div>
                           <div className="text-green-400 text-lg font-bold">+2.3%</div>
                         </div>
                         <div className="bg-white/5 rounded-lg p-4 text-center">
                           <div className="text-slate-400 text-sm">3 Months</div>
                           <div className="text-green-400 text-lg font-bold">+6.8%</div>
                         </div>
                         <div className="bg-white/5 rounded-lg p-4 text-center">
                           <div className="text-slate-400 text-sm">6 Months</div>
                           <div className="text-green-400 text-lg font-bold">+12.4%</div>
                         </div>
                         <div className="bg-white/5 rounded-lg p-4 text-center">
                           <div className="text-slate-400 text-sm">1 Year</div>
                           <div className="text-green-400 text-lg font-bold">+{selectedOption.apy}%</div>
                         </div>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             </motion.div>

             {/* Fund Overview */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
             >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-xl font-semibold">Fund Overview</h2>
                  <button 
                    onClick={() => toggleSection('overview')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {expandedSections.has('overview') ? 
                      <ChevronUp className="w-5 h-5 text-white" /> : 
                      <ChevronDown className="w-5 h-5 text-white" />
                    }
                  </button>
                </div>
                
                <AnimatePresence>
                  {expandedSections.has('overview') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Fund Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="text-slate-400 text-sm">Current APY</div>
                          <div className="text-white text-xl font-bold">{selectedOption.apy}%</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="text-slate-400 text-sm">Fund Size</div>
                          <div className="text-white text-xl font-bold">{formatUSD(fundDetails.fundSize)}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="text-slate-400 text-sm">Min Investment</div>
                          <div className="text-white text-xl font-bold">${fundDetails.minInvestment}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="text-slate-400 text-sm">Expense Ratio</div>
                          <div className="text-white text-xl font-bold">{fundDetails.expenseRatio}%</div>
                        </div>
                      </div>

                      {/* Fund Description */}
                      <div className="bg-white/5 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-2">Investment Strategy</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {selectedOption.description}. This fund employs advanced yield optimization strategies 
                          across multiple DeFi protocols, staking mechanisms, and liquidity pools to maximize 
                          returns while maintaining a balanced risk profile.
                        </p>
                      </div>

                      {/* Fund Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-3">Fund Information</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Inception Date</span>
                              <span className="text-white">{fundDetails.inception}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Category</span>
                              <span className="text-white">{fundDetails.category}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Benchmark</span>
                              <span className="text-white">{fundDetails.benchmark}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-3">Risk Profile</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">Risk Level</span>
                              <RiskBadge risk={selectedOption.risk} />
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Volatility</span>
                              <span className="text-white">{selectedOption.risk === 'High' ? 'High' : selectedOption.risk === 'Medium' ? 'Moderate' : 'Low'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Liquidity</span>
                              <span className="text-white">Daily</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

                         

            {/* Portfolio Allocation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-xl font-semibold">Portfolio Allocation</h2>
                  <button 
                    onClick={() => toggleSection('portfolio')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {expandedSections.has('portfolio') ? 
                      <ChevronUp className="w-5 h-5 text-white" /> : 
                      <ChevronDown className="w-5 h-5 text-white" />
                    }
                  </button>
                </div>
                
                <AnimatePresence>
                  {expandedSections.has('portfolio') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={portfolioData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {portfolioData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1E293B', 
                                  border: '1px solid #334155',
                                  borderRadius: '8px',
                                  color: '#F1F5F9'
                                }}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Allocation Details */}
                        <div className="space-y-3">
                          {portfolioData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-white text-sm">{item.name}</span>
                              </div>
                              <span className="text-white font-semibold">{item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Fund Manager */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-xl font-semibold">Fund Manager</h2>
                  <button 
                    onClick={() => toggleSection('manager')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {expandedSections.has('manager') ? 
                      <ChevronUp className="w-5 h-5 text-white" /> : 
                      <ChevronDown className="w-5 h-5 text-white" />
                    }
                  </button>
                </div>
                
                <AnimatePresence>
                  {expandedSections.has('manager') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="flex items-start gap-6">
                        <img 
                          src={fundManager.avatar} 
                          alt={fundManager.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-white text-lg font-semibold mb-2">{fundManager.name}</h3>
                          <p className="text-slate-400 text-sm mb-4">{fundManager.education}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-slate-400 text-sm">Experience</div>
                              <div className="text-white font-semibold">{fundManager.experience}</div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm">Funds Managed</div>
                              <div className="text-white font-semibold">{fundManager.managedFunds}</div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm">Total AUM</div>
                              <div className="text-white font-semibold">{fundManager.totalAUM}</div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-sm">Performance</div>
                              <div className="text-green-400 font-semibold">{fundManager.performance}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Holdings & Top Investments */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-xl font-semibold">Top Holdings</h2>
                  <button 
                    onClick={() => toggleSection('holdings')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {expandedSections.has('holdings') ? 
                      <ChevronUp className="w-5 h-5 text-white" /> : 
                      <ChevronDown className="w-5 h-5 text-white" />
                    }
                  </button>
                </div>
                
                <AnimatePresence>
                  {expandedSections.has('holdings') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Position</th>
                              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Protocol</th>
                              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Type</th>
                              <th className="text-right py-3 px-4 text-slate-400 text-sm font-medium">Allocation</th>
                            </tr>
                          </thead>
                          <tbody className="space-y-2">
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4 text-white text-sm">Uniswap V3 USDC/ETH</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                                  Uniswap
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300 text-sm">Liquidity Pool</td>
                              <td className="py-3 px-4 text-right text-white font-semibold">18.5%</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4 text-white text-sm">Aave USDT Lending</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                                  Aave
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300 text-sm">Lending</td>
                              <td className="py-3 px-4 text-right text-white font-semibold">15.2%</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4 text-white text-sm">Compound ETH Staking</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                                  Compound
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300 text-sm">Staking</td>
                              <td className="py-3 px-4 text-right text-white font-semibold">12.8%</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4 text-white text-sm">Curve 3Pool LP</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300">
                                  Curve
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300 text-sm">Liquidity Pool</td>
                              <td className="py-3 px-4 text-right text-white font-semibold">11.4%</td>
                            </tr>
                            <tr className="hover:bg-white/5 transition-colors">
                              <td className="py-3 px-4 text-white text-sm">Yearn USDC Vault</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                                  Yearn
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300 text-sm">Yield Farming</td>
                              <td className="py-3 px-4 text-right text-white font-semibold">9.7%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Fund House & Protocol Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-xl font-semibold">Fund House & Protocol Details</h2>
                  <button 
                    onClick={() => toggleSection('fundhouse')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {expandedSections.has('fundhouse') ? 
                      <ChevronUp className="w-5 h-5 text-white" /> : 
                      <ChevronDown className="w-5 h-5 text-white" />
                    }
                  </button>
                </div>
                
                <AnimatePresence>
                  {expandedSections.has('fundhouse') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Fund House Info */}
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                              <Globe className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">DeFi Capital Management</h3>
                              <p className="text-slate-400 text-sm">Decentralized Asset Management</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Rank (DeFi TVL)</span>
                              <span className="text-white">#3 in DeFi</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Total AUM</span>
                              <span className="text-white">$125.8M</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Protocol Launch</span>
                              <span className="text-white">15 Jan 2023</span>
                            </div>
                          </div>
                        </div>

                        {/* Protocol Details */}
                        <div className="bg-white/5 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-4">Protocol Details</h3>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-slate-400">Smart Contract</span>
                              <div className="text-white font-mono text-xs mt-1 bg-white/10 p-2 rounded">
                                0x1234...5678abcd
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Blockchain</span>
                              <span className="text-blue-400">Ethereum Mainnet</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Security Audit</span>
                              <span className="text-white">CertiK & ConsenSys</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Investment Objective */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-xl font-semibold">Investment Objective</h2>
                  <button 
                    onClick={() => toggleSection('objective')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {expandedSections.has('objective') ? 
                      <ChevronUp className="w-5 h-5 text-white" /> : 
                      <ChevronDown className="w-5 h-5 text-white" />
                    }
                  </button>
                </div>
                
                <AnimatePresence>
                  {expandedSections.has('objective') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-slate-300 text-sm leading-relaxed mb-4">
                          The fund seeks to generate optimized yield by strategically allocating capital across 
                          high-performing DeFi protocols, including liquidity provision, lending, and yield farming 
                          strategies while maintaining risk-adjusted returns.
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Benchmark</span>
                          <span className="text-white font-semibold">DeFi Pulse Total Value Locked Index</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-3">Key Details</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Min Recurring Investment</span>
                              <span className="text-white">$100</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Min Lumpsum Investment</span>
                              <span className="text-white">$500</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Protocol Fee</span>
                              <span className="text-white">2% management fee</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-3">Risk Profile</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400">Risk Level</span>
                              <RiskBadge risk={selectedOption.risk} />
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Volatility</span>
                              <span className="text-white">High</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Liquidity</span>
                              <span className="text-white">Daily</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Risk & Disclaimers */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white text-xl font-semibold">Risk & Disclaimers</h2>
                  <button 
                    onClick={() => toggleSection('risk')}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {expandedSections.has('risk') ? 
                      <ChevronUp className="w-5 h-5 text-white" /> : 
                      <ChevronDown className="w-5 h-5 text-white" />
                    }
                  </button>
                </div>
                
                <AnimatePresence>
                  {expandedSections.has('risk') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="text-yellow-400 font-semibold mb-2">Investment Risks</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                              Crypto investments are subject to market risk. Returns are variable and not guaranteed. 
                              Past performance does not indicate future results. The value of investments can go up 
                              or down and you may lose some or all of your investment.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="text-blue-400 font-semibold mb-2">Important Information</h3>
                            <ul className="text-slate-300 text-sm space-y-1">
                              <li>• APY rates are variable and subject to change</li>
                              <li>• Withdrawals may be subject to fees and lock-up periods</li>
                              <li>• Regulatory changes may affect fund performance</li>
                              <li>• This is not financial advice - consult a professional</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Investment Summary - Right Side */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden sticky top-24"
            >
              {/* Tabs for MONTHLY SIP / ONE-TIME */}
              <div className="border-b border-white/10">
                <div className="flex">
                  <button
                    onClick={() => setInvestmentType('monthly')}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      investmentType === 'monthly' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    MONTHLY SIP
                  </button>
                  <button
                    onClick={() => setInvestmentType('one-time')}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      investmentType === 'one-time' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ONE-TIME
                  </button>
                </div>
              </div>

              {/* Investment Form */}
              <div className="p-6 space-y-6">
                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">
                    {investmentType === 'monthly' ? 'SIP Amount' : 'Investment Amount'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      value={investmentType === 'monthly' ? sipAmount : investmentAmount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        if (investmentType === 'monthly') {
                          setSipAmount(value)
                        } else {
                          setInvestmentAmount(value)
                        }
                      }}
                      className="w-full pl-8 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* SIP Date (only for monthly) */}
                {investmentType === 'monthly' && (
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium">Monthly SIP Date</label>
                    <div className="flex items-center gap-3 p-3 bg-white/10 border border-white/20 rounded-lg">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <select
                        value={sipDate}
                        onChange={(e) => setSipDate(parseInt(e.target.value))}
                        className="bg-transparent text-white focus:outline-none flex-1"
                      >
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                          <option key={day} value={day} className="bg-gray-800">
                            {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Next SIP Info */}
                {investmentType === 'monthly' && (
                  <div className="text-center text-slate-400 text-sm">
                    Next SIP instalment on {sipDate}{sipDate === 1 ? 'st' : sipDate === 2 ? 'nd' : sipDate === 3 ? 'rd' : 'th'} of next month
                  </div>
                )}

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Payment Method</label>
                  <div className="flex items-center justify-between p-3 bg-white/10 border border-white/20 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white text-sm">Investment Wallet</div>
                        <div className="text-slate-400 text-xs">Available: {formatUSD(investmentWallet.getBalance())}</div>
                      </div>
                    </div>
                    <div className="text-slate-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.95 12q0 .2-.062.375a.9.9 0 0 1-.213.325l-4.6 4.6a.95.95 0 0 1-.7.275.95.95 0 0 1-.7-.275.95.95 0 0 1-.275-.7q0-.425.275-.7l3.9-3.9-3.9-3.9a.95.95 0 0 1-.275-.7q0-.425.275-.7a.95.95 0 0 1 .7-.275q.425 0 .7.275l4.6 4.6q.15.15.212.325.063.175.063.375"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-3">
                  <button 
                    onClick={handleInvest}
                    className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {investmentType === 'monthly' ? 'START SIP' : 'INVEST NOW'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

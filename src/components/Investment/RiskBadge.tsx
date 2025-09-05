import { motion } from 'framer-motion'

interface RiskBadgeProps {
  risk: 'Low' | 'Medium' | 'High'
}

export default function RiskBadge({ risk }: RiskBadgeProps) {
  const getRiskConfig = (risk: string) => {
    switch (risk) {
      case 'Low':
        return {
          color: 'text-[#36c390]',
          bgColor: 'bg-[#36c390]/10',
          borderColor: 'border-[#36c390]/20'
        }
      case 'Medium':
        return {
          color: 'text-[#f5bd02]',
          bgColor: 'bg-[#f5bd02]/10',
          borderColor: 'border-[#f5bd02]/20'
        }
      case 'High':
        return {
          color: 'text-[#ff6b6b]',
          bgColor: 'bg-[#ff6b6b]/10',
          borderColor: 'border-[#ff6b6b]/20'
        }
      default:
        return {
          color: 'text-[#8b90b2]',
          bgColor: 'bg-white/10',
          borderColor: 'border-white/20'
        }
    }
  }

  const config = getRiskConfig(risk)

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
        ${config.color} ${config.bgColor} ${config.borderColor}
      `}
    >
      {risk} Risk
    </motion.span>
  )
}

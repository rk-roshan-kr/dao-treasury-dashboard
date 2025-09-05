import { motion } from 'framer-motion'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

export type TxStatus = 'Completed' | 'Failed'

interface StatusBadgeProps {
  status: TxStatus
  className?: string
}

const statusConfig = {
  Completed: {
    icon: CheckCircle,
    className: 'text-[#36c390]',
    bgClass: 'bg-[#36c390]/10',
    borderClass: 'border-[#36c390]/20'
  },
  Failed: {
    icon: XCircle,
    className: 'text-[#ff6b6b]',
    bgClass: 'bg-[#ff6b6b]/10',
    borderClass: 'border-[#ff6b6b]/20'
  }
}

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${config.bgClass} ${config.borderClass} ${config.className} ${className}`}
    >
      <Icon size={14} />
      <span>{status}</span>
    </motion.div>
  )
}

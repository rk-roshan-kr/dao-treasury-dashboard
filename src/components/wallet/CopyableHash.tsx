import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { useCopy } from '../../hooks/useCopy'
import { truncateTxId } from '../../utils/format'

interface CopyableHashProps {
  hash: string
  className?: string
}

export const CopyableHash = ({ hash, className = '' }: CopyableHashProps) => {
  const { copied, copyToClipboard } = useCopy()

  const handleCopy = () => {
    copyToClipboard(hash)
  }

  return (
    <div className={`relative group ${className}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1e2044] border border-[#2a2c54] text-[#e5e8ff] font-mono text-sm hover:bg-[#242655] transition-colors"
        title="Copy to clipboard"
      >
        <span>{truncateTxId(hash)}</span>
        <motion.div
          initial={false}
          animate={{ rotate: copied ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {copied ? (
            <Check size={14} className="text-[#36c390]" />
          ) : (
            <Copy size={14} className="text-[#8b90b2]" />
          )}
        </motion.div>
      </motion.button>
      
      {/* Tooltip */}
      {copied && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-[#0a0a0a] text-white text-xs rounded-md whitespace-nowrap z-10"
        >
          Copied!
        </motion.div>
      )}
    </div>
  )
}

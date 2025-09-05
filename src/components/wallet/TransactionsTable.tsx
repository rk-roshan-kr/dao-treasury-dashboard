import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { CopyableHash } from './CopyableHash'
import { formatDateTime, formatCrypto } from '../../utils/format'

interface Transaction {
  id: string
  date: string
  coin: string
  network: string
  qty: number
  fee: number
  gst: number
  deb: number
  recipient: string
  recipientFull: string
  self: boolean
  status: 'Completed' | 'Failed'
  type: 'transfer' | 'auto-sweep' | 'send' | 'receive' | 'investment'
}

interface TransactionsTableProps {
  transactions: Transaction[]
  className?: string
}

const statusFilters = ['All', 'Completed', 'Failed'] as const

export const TransactionsTable = ({ transactions, className = '' }: TransactionsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<typeof statusFilters[number]>('All')

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = searchTerm === '' || 
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.recipient.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'All' || tx.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [transactions, searchTerm, statusFilter])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`bg-[#1b1f4a] border border-[#2a2c54] rounded-2xl shadow-lg overflow-hidden w-full ${className}`}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-[#2a2c54]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-[#e9ecff] tracking-wide">Transaction History</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#8b90b2]">{filteredTransactions.length} transactions</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b90b2]" />
            <input
              type="text"
              placeholder="Search by TX ID or recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#242655] border border-[#2a2c54] rounded-lg text-[#e9ecff] placeholder-[#8b90b2] focus:outline-none focus:border-[#6a7bff] text-sm sm:text-base"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 sm:flex-none ${
                  statusFilter === status
                    ? 'bg-[#6a7bff] text-[#0f1230]'
                    : 'bg-[#242655] text-[#8b90b2] hover:bg-[#2a2c54]'
                }`}
              >
                {status}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead className="bg-[#242655]">
            <tr>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[#8b90b2] whitespace-nowrap">Date & Time</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[#8b90b2] whitespace-nowrap">Total Qty</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[#8b90b2] whitespace-nowrap">Recipient</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[#8b90b2] whitespace-nowrap">Network</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[#8b90b2] whitespace-nowrap">Self</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[#8b90b2] whitespace-nowrap">Status</th>
              <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[#8b90b2] whitespace-nowrap">TX ID</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredTransactions.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-[#2a2c54]"
                >
                  <td colSpan={7} className="px-3 sm:px-6 py-8 text-center text-[#8b90b2] text-sm">
                    No transactions found
                  </td>
                </motion.tr>
              ) : (
                filteredTransactions.map((tx, index) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-t border-[#2a2c54] hover:bg-[#242655] transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#e9ecff] whitespace-nowrap">
                      {formatDateTime(tx.date)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#e9ecff] font-mono whitespace-nowrap">
                      {formatCrypto(tx.qty, tx.coin)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#e9ecff] max-w-[120px] sm:max-w-none" title={tx.recipientFull}>
                      <div className="truncate">{tx.recipient}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-[#8b90b2] whitespace-nowrap">
                      {tx.network}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        tx.self 
                          ? 'bg-[#36c390]/10 text-[#36c390] border border-[#36c390]/20'
                          : 'bg-[#8b90b2]/10 text-[#8b90b2] border border-[#8b90b2]/20'
                      }`}>
                        {tx.self ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <CopyableHash hash={tx.id} />
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

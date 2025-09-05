/**
 * Utility functions for formatting wallet data
 */

export const truncateTxId = (id: string): string => {
  if (id.length <= 12) return id
  return `${id.slice(0, 8)}...${id.slice(-4)}`
}

export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(amount)
}

export const formatBTC = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  }).format(amount)
}

export const formatCrypto = (amount: number, symbol: string): string => {
  const decimals = symbol === 'BTC' ? 8 : symbol === 'ETH' ? 6 : 2
  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)} ${symbol}`
}

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

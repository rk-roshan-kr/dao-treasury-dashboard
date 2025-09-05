import type { CryptoSymbol } from './cryptoStore'
import btcIcon from '../assets/crypto/btc.svg'
import ethIcon from '../assets/crypto/eth.svg'
import usdtIcon from '../assets/crypto/usdt.svg'
import solIcon from '../assets/crypto/sol.svg'
import batIcon from '../assets/crypto/bat.svg'
import sepoliaIcon from '../assets/crypto/sepolia_eth.svg'

export type CryptoMeta = {
  name: string
  color: string
  icon: string // URL to SVG
}

export const cryptoMeta: Record<CryptoSymbol, CryptoMeta> = {
  BTC: { name: 'Bitcoin', color: '#F7931A', icon: btcIcon },
  ETH: { name: 'Ethereum', color: '#627EEA', icon: ethIcon },
  USDT: { name: 'Tether', color: '#26A17B', icon: usdtIcon },
  SOL: { name: 'Solana', color: '#14F195', icon: solIcon },
  BAT: { name: 'Basic Attention Token', color: '#FF5000', icon: batIcon },
  SEPOLIA_ETH: { name: 'Sepolia ETH (Testnet)', color: '#9CA3AF', icon: sepoliaIcon },
}



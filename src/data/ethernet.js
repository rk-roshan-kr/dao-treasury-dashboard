// Mock data source representing `ethernet.js`
export const mockEthernet = {
  totalTreasuryValue: 0.067196836775,
  activeWallets: 1,
  tokenAllocations: [
    { symbol: 'Sepolia', percent: 100, color: '#a855f7' },
    { symbol: 'USDC', percent: 0, color: '#0ea5e9' },
    { symbol: 'AAVE', percent: 0, color: '#22c55e' },
    { symbol: 'DAI', percent: 0, color: '#f59e0b' },
    { symbol: 'WBTC', percent: 0, color: '#ef4444' },
  ],
  assets: [
    {
      symbol: 'ETH',
      name: 'Ethereum',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      valueUsd: 0.067196836775,
      percentOfTreasury: 100,
      change24hPercent: 2.35,
      change24hUsd: 0.0015791256642125,
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      valueUsd: 0.0,
      percentOfTreasury: 0,
      change24hPercent: 0.02,
      change24hUsd: 0.0,
    },
    {
      symbol: 'AAVE',
      name: 'Aave',
      logo: 'https://cryptologos.cc/logos/aave-aave-logo.png',
      valueUsd: 0,
      percentOfTreasury: 0,
      change24hPercent: -1.12,
      change24hUsd: 0.0,
    },
    {
      symbol: 'DAI',
      name: 'Dai',
      logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
      valueUsd: 0,
      percentOfTreasury: 0,
      change24hPercent: 0.01,
      change24hUsd: 0,
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      valueUsd: 0,
      percentOfTreasury: 0,
      change24hPercent: -0.72,
      change24hUsd: 0,
    },
  ],
  recentTransactions: [
    // { id: 'tx1', wallet: '0x8aE2Ff1bD4C9aA31F2b1e4F3E0A9c7D4bC91A123', type: 'Deposit', amount: 150, symbol: 'ETH', usdValue: 540_000, avatar: 'https://i.pravatar.cc/150?img=1' },
    // { id: 'tx2', wallet: '0x2bC4dE5fA6B7c8D9E0F1a2B3C4d5E6F7A8B9C234', type: 'Swap', amount: 50_000, symbol: 'USDC', usdValue: 50_000, avatar: 'https://i.pravatar.cc/150?img=2' },
    // { id: 'tx3', wallet: '0x3C4d5E6f7A8B9C2D3e4F5a6B7c8D9E0F1A2B3C45', type: 'Stake', amount: 2_000, symbol: 'AAVE', usdValue: 220_000, avatar: 'https://i.pravatar.cc/150?img=3' },
    // { id: 'tx4', wallet: '0x4D5e6F7a8B9C2D3E4f5A6B7c8D9E0F1A2B3C4D56', type: 'Withdraw', amount: 40, symbol: 'WBTC', usdValue: 2_400_000, avatar: 'https://i.pravatar.cc/150?img=4' },
    { id: 'tx1', wallet: '0x5e6F7a8B9C2D3E4F5a6B7c8D9E0F1A2B3C4D5E67', type: 'Deposit', amount: 0.1024, symbol: 'SepoliaETH', usdValue: 0.067196836775, avatar: 'https://i.pravatar.cc/150?img=5' },
    // { id: 'tx6', wallet: '0x6F7a8B9C2D3E4F5a6B7c8D9E0F1A2B3C4D5E6F78', type: 'Swap', amount: 80, symbol: 'ETH', usdValue: 288_000, avatar: 'https://i.pravatar.cc/150?img=6' },
  ]
}



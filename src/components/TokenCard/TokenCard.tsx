import { Card, CardContent, Typography, Chip, Avatar } from '@mui/material'

export type Asset = {
  symbol: string
  name: string
  logo: string
  qty: number
  valueUsd: number
  percentOfTreasury: number
  change24hPercent: number
}

export default function TokenCard({ asset }: { asset: Asset }) {
  const chipColor = asset.change24hPercent >= 0 ? 'success' : 'error'
  const aria = `${asset.name} current value $${asset.valueUsd.toLocaleString()}, ${asset.percentOfTreasury}% of treasury, 24h ${asset.change24hPercent}%`
  return (
    <Card className="card-base" aria-label={aria}>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar src={asset.logo} alt={asset.symbol} />
            <div>
              <Typography className="text-sm text-slate-300">{asset.name}</Typography>
              <Typography variant="h6" className="text-white font-bold">{asset.symbol}</Typography>
            </div>
          </div>
          <Chip label={`${asset.change24hPercent >= 0 ? '+' : ''}${asset.change24hPercent.toFixed(2)}%`} color={chipColor} className="rounded-xl" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div>
            <div className="text-xs text-slate-400">Balance</div>
            <div className="text-white font-semibold">{asset.qty.toFixed(4)}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Current Value</div>
            <div className="text-white font-semibold">${asset.valueUsd.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">% of Treasury</div>
            <div className="text-white font-semibold">{asset.percentOfTreasury}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



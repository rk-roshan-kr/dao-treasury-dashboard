import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

export type Allocation = {
  symbol: string
  percent: number
  color: string
}

export default function InvestmentChart({ data }: { data: Allocation[] }) {
  return (
    <div style={{ width: '100%', height: 260, overflow: 'visible' }}>
      <ResponsiveContainer>
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            dataKey="percent"
            nameKey="symbol"
            data={data}
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.symbol} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            wrapperStyle={{ zIndex: 1000 }}
            contentStyle={{ background: 'rgba(10,10,10,0.96)', border: '1px solid #1f1f22', borderRadius: 12, color: '#ffffff' }}
            itemStyle={{ color: '#ffffff' }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value: number, name: string) => [`${value}%`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}



import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface SparklineProps {
  data: Array<{ value: number; date: string }>
  className?: string
}

export const Sparkline = ({ data, className = '' }: SparklineProps) => {
  if (!data || data.length === 0) {
    return (
      <div className={`w-16 h-10 sm:w-20 sm:h-12 bg-[#1e2044] rounded-lg border border-[#2a2c54] flex items-center justify-center ${className}`}>
        <span className="text-[#8b90b2] text-xs">No data</span>
      </div>
    )
  }

  return (
    <div className={`w-16 h-10 sm:w-20 sm:h-12 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#6a7bff"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: '#6a7bff' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1b1f4a',
              border: '1px solid #2a2c54',
              borderRadius: '8px',
              color: '#e9ecff'
            }}
            labelStyle={{ color: '#8b90b2' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface PieChartProps {
  data: Array<{ name: string; value: number; color: string }>
}

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={14}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function PieChart({ data }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          innerRadius={60}
          paddingAngle={4}
          dataKey="value"
          stroke="#FFFFFF"
          strokeWidth={3}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#FFFFFF',
            border: '1px solid var(--color-surface-border)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(107, 127, 58, 0.08)',
            fontSize: 12,
            fontWeight: 600,
            padding: '12px 16px'
          }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}


import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface BarChartProps {
  data: Array<{ month: string; active: number; completed: number; pending: number }>
}

export function BarChart({ data }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RechartsBarChart 
        data={data} 
        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        barGap={8}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="var(--color-surface-border)" 
          vertical={false} 
          strokeOpacity={0.6}
        />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12, fontWeight: 600, fill: '#6B7280' }} 
          axisLine={{ stroke: 'var(--color-surface-border)' }}
          tickLine={false}
          dy={10}
        />
        <YAxis 
          tick={{ fontSize: 12, fontWeight: 600, fill: '#6B7280' }} 
          axisLine={false}
          tickLine={false}
          dx={-10}
        />
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
          cursor={{ fill: 'var(--color-surface-hover)', opacity: 0.5 }}
        />
        <Legend 
          wrapperStyle={{ 
            fontSize: '12px', 
            fontWeight: 700,
            paddingTop: '20px'
          }}
          iconType="circle"
          iconSize={8}
        />
        <Bar 
          dataKey="active" 
          fill="#40521B" 
          radius={[8, 8, 0, 0]} 
          name="Active Projects"
          maxBarSize={50}
        />
        <Bar 
          dataKey="completed" 
          fill="#0F766E" 
          radius={[8, 8, 0, 0]} 
          name="Completed"
          maxBarSize={50}
        />
        <Bar 
          dataKey="pending" 
          fill="#8FA96E" 
          radius={[8, 8, 0, 0]} 
          name="Pending"
          maxBarSize={50}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}


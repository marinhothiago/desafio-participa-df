import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DistributionChartProps {
  publicCount: number;
  restrictedCount: number;
}

export function DistributionChart({ publicCount, restrictedCount }: DistributionChartProps) {
  const data = [
    { name: 'Público', value: publicCount, color: 'hsl(120, 100%, 25%)' },
    { name: 'Restrito', value: restrictedCount, color: 'hsl(0, 100%, 45%)' },
  ];

  const total = publicCount + restrictedCount;

  return (
    <div className="gov-card animate-slide-up h-full flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição de Classificações</h3>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="35%"
              outerRadius="55%"
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent, cx, cy, midAngle, outerRadius }) => {
                const RADIAN = Math.PI / 180;
                const radius = outerRadius * 1.4;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                return (
                  <text
                    x={x}
                    y={y}
                    fill="hsl(var(--foreground))"
                    textAnchor={x > cx ? 'start' : 'end'}
                    dominantBaseline="central"
                    fontSize={12}
                    fontWeight={500}
                  >
                    {`${name}: ${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
              labelLine={{
                stroke: 'hsl(var(--muted-foreground))',
                strokeWidth: 1,
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} documentos`, '']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={32}
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => (
                <span className="text-xs text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 pt-2 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          Total: <span className="font-semibold text-foreground">{total.toLocaleString()}</span> documentos
        </p>
      </div>
    </div>
  );
}

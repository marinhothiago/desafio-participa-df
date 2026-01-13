import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface EntityType {
  name: string;
  count: number;
}

interface EntityTypesChartProps {
  data: EntityType[];
}

export function EntityTypesChart({ data }: EntityTypesChartProps) {
  const colors = [
    'hsl(218, 87%, 39%)',
    'hsl(218, 70%, 50%)',
    'hsl(218, 60%, 60%)',
    'hsl(218, 50%, 70%)',
    'hsl(218, 40%, 75%)',
  ];

  return (
    <div className="gov-card animate-slide-up h-full">
      <h3 className="text-lg font-semibold text-foreground mb-4">Tipos de Dados Mais Comuns</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={80}
            />
            <Tooltip
              formatter={(value: number) => [`${value} ocorrências`, '']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={30}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

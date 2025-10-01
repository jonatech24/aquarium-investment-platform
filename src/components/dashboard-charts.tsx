'use client';

import { Bar, BarChart, Line, LineChart, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';

const portfolioChartData = [
  { date: '2024-01', value: 32000 },
  { date: '2024-02', value: 35000 },
  { date: '2024-03', value: 38000 },
  { date: '2024-04', value: 37000 },
  { date: '2024-05', value: 41000 },
  { date: '2024-06', value: 45231 },
];

const portfolioChartConfig = {
  value: {
    label: 'Portfolio Value',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function PortfolioChart() {
  return (
    <ChartContainer config={portfolioChartConfig} className="h-[250px] w-full">
      <LineChart data={portfolioChartData}>
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={v => `$${v / 1000}k`} />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
          formatter={(value) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value as number)
          }
        />
        <Line
          dataKey="value"
          type="monotone"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

const strategyPerformanceData = [
  { strategy: 'GridBot', pnl: 2750 },
  { strategy: 'Momentum', pnl: 4200 },
  { strategy: 'MeanRev', pnl: -1500 },
  { strategy: 'Arbitrage', pnl: 800 },
  { strategy: 'TrendFollow', pnl: 3100 },
];

const strategyChartConfig = {
  pnl: {
    label: 'P&L',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function StrategyPerformanceChart() {
  return (
    <ChartContainer config={strategyChartConfig} className="h-[250px] w-full">
      <BarChart data={strategyPerformanceData} layout="vertical">
        <XAxis type="number" dataKey="pnl" hide />
        <YAxis type="category" dataKey="strategy" tickLine={false} axisLine={false} width={80} />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
          formatter={(value) =>
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value as number)
          }
        />
        <Bar dataKey="pnl" radius={4} fill="hsl(var(--chart-2))" />
      </BarChart>
    </ChartContainer>
  );
}

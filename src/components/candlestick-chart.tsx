'use client';

import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  Line,
  Cell,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { format } from 'date-fns';

const ohlcData = [
  { date: '2024-07-01T09:30:00', open: 150.75, high: 152.3, low: 150.1, close: 151.9 },
  { date: '2024-07-01T09:35:00', open: 151.9, high: 152.1, low: 150.5, close: 150.8 },
  { date: '2024-07-01T09:40:00', open: 150.8, high: 151.5, low: 150.2, close: 151.4 },
  { date: '2024-07-01T09:45:00', open: 151.4, high: 153.0, low: 151.2, close: 152.8 },
  { date: '2024-07-01T09:50:00', open: 152.8, high: 153.2, low: 152.5, close: 152.9 },
  { date: '2024-07-01T09:55:00', open: 152.9, high: 153.0, low: 151.8, close: 152.0 },
  { date: '2024-07-01T10:00:00', open: 152.0, high: 152.5, low: 151.7, close: 152.3 },
  { date: '2024-07-01T10:05:00', open: 152.3, high: 152.4, low: 150.9, close: 151.1 },
  { date: '2024-07-01T10:10:00', open: 151.1, high: 151.8, low: 150.5, close: 151.6 },
  { date: '2024-07-01T10:15:00', open: 151.6, high: 152.2, low: 151.5, close: 152.0 },
  { date: '2024-07-01T10:20:00', open: 152.0, high: 152.5, low: 151.9, close: 152.1 },
  { date: '2024-07-01T10:25:00', open: 152.1, high: 152.3, low: 151.5, close: 151.7 },
  { date: '2024-07-01T10:30:00', open: 151.7, high: 152.0, low: 150.8, close: 151.0 },
];

const chartConfig = {
  price: {
    label: 'Price',
  },
} satisfies ChartConfig;

// Custom shape for the wick
const Wick = (props: any) => {
  const { x, y, width, height } = props;
  return <rect x={x + width / 2 - 0.5} y={y} width={1} height={height} fill="currentColor" />;
};

export function CandlestickChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <ComposedChart
        data={ohlcData}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(tick) => format(new Date(tick), 'HH:mm')}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          orientation="right"
          domain={['dataMin - 5', 'dataMax + 5']}
          tickFormatter={(tick) => `$${tick}`}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <Tooltip
          content={
            <ChartTooltipContent
              labelFormatter={(label) => format(new Date(label), 'PPpp')}
              formatter={(value, name, props) => {
                const { payload } = props;
                if (payload) {
                   return (
                    <div className="flex flex-col text-xs">
                        <span>Open: ${payload.open.toFixed(2)}</span>
                        <span>High: ${payload.high.toFixed(2)}</span>
                        <span>Low: ${payload.low.toFixed(2)}</span>
                        <span>Close: ${payload.close.toFixed(2)}</span>
                    </div>
                  );
                }
                return null;
              }}
            />
          }
        />
        
        {/* Wicks (high-low line) */}
        <Bar dataKey="high" shape={<Wick />} isAnimationActive={false}>
          {ohlcData.map((entry, index) => (
            <Cell
              key={`cell-wick-${index}`}
              fill={entry.close >= entry.open ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
              stroke={entry.close >= entry.open ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
            />
          ))}
        </Bar>

        {/* Body (open-close box) */}
        <Bar
          dataKey={(d) => [d.open, d.close]}
          isAnimationActive={false}
        >
          {ohlcData.map((entry, index) => (
            <Cell
              key={`cell-body-${index}`}
              fill={entry.close >= entry.open ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
              stroke={entry.close >= entry.open ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
            />
          ))}
        </Bar>
      </ComposedChart>
    </ChartContainer>
  );
}

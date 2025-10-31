'use client';

import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Cell, // Added the missing import
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { format, parseISO } from 'date-fns';

// 1. Define the data types
export interface OHLCData {
  Date: string; // ISO 8601 string
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume?: number;
}

export interface TradeData {
  date: string; // ISO 8601 string
  direction: 'BUY' | 'SELL';
  price: number;
  shares: number;
}

// 2. Define the component's props
interface CandlestickChartProps {
  ohlcData: OHLCData[];
  tradeData: TradeData[];
  height?: number;
}

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

export function CandlestickChart({ ohlcData, tradeData, height = 400 }: CandlestickChartProps) {

  // 3. Merge trades with OHLC data for easier rendering
  const combinedData = ohlcData.map(d => {
    const tradeOnThisDate = tradeData.find(t => format(parseISO(t.date), 'yyyy-MM-dd') === format(parseISO(d.Date), 'yyyy-MM-dd'));
    return {
      ...d,
      trade: tradeOnThisDate,
    };
  });

  const yDomain = [
    'auto',
    'auto'
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={combinedData}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="Date"
          tickFormatter={(tick) => format(parseISO(tick), 'MM/dd/yy')}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          orientation="right"
          domain={yDomain}
          tickFormatter={(tick) => typeof tick === 'number' ? `$${tick.toFixed(2)}`: ''}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <Tooltip
          content={
            <ChartTooltipContent
              labelFormatter={(label) => format(parseISO(label), 'PPpp')}
              formatter={(value, name, props) => {
                const { payload } = props;
                if (payload) {
                  return (
                    <div className="flex flex-col text-xs space-y-1 p-1">
                      <span className="font-bold">{format(parseISO(payload.Date), 'MMM d, yyyy')}</span>
                      <span>Open: ${payload.Open.toFixed(2)}</span>
                      <span>High: ${payload.High.toFixed(2)}</span>
                      <span>Low: ${payload.Low.toFixed(2)}</span>
                      <span>Close: ${payload.Close.toFixed(2)}</span>
                      {payload.trade && (
                         <div className={`mt-2 pt-1 border-t border-gray-300 font-bold ${payload.trade.direction === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                            {payload.trade.direction} @ ${payload.trade.price.toFixed(2)}
                         </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
          }
        />

        {/* Wicks (high-low line) */}
        <Bar dataKey="High" stackId="ohlc" shape={<Wick />} isAnimationActive={false} barSize={1} />
        
        {/* Body (open-close box) */}
        <Bar dataKey={(d: OHLCData) => [d.Open, d.Close]} stackId="ohlc" isAnimationActive={false}>
          {combinedData.map((entry, index) => (
            <Cell
              key={`cell-body-${index}`}
              fill={entry.Close >= entry.Open ? '#22c55e' : '#ef4444'}
              stroke={entry.Close >= entry.Open ? '#22c55e' : '#ef4444'}
            />
          ))}
        </Bar>
        
        {/* Render trade markers */}
        {combinedData.map((entry, index) => {
            if (entry.trade) {
                return (
                    <ReferenceDot
                        key={`trade-${index}`}
                        x={entry.Date}
                        y={entry.trade.price * 1.02} // Position slightly above the price
                        r={8}
                        fill={entry.trade.direction === 'BUY' ? '#84cc16' : '#ef4444'}
                        stroke="#fff"
                        strokeWidth={2}
                    >
                        <svg x="-5" y="-5" width="10" height="10" viewBox="0 0 10 10">
                            {entry.trade.direction === 'BUY' ? (
                                <polygon points="5,0 10,10 0,10" fill="#22c55e" /> // Up arrow
                            ) : (
                                <polygon points="0,0 10,0 5,10" fill="#ef4444" /> // Down arrow
                            )}
                        </svg>
                    </ReferenceDot>
                )
            }
            return null;
        })}

      </ComposedChart>
    </ResponsiveContainer>
  );
}

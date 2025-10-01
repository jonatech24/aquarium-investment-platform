
'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Rows, Columns, Globe, Briefcase } from 'lucide-react';

const heatmapData = [
  { ticker: 'NVDA', change: 0.10, sector: 'Tecnología electrónica', size: 2 },
  { ticker: 'MSFT', change: -0.37, sector: 'Servicios tecnológicos', size: 2 },
  { ticker: 'GOOGL', change: 0.13, sector: 'Servicios tecnológicos', size: 2 },
  { ticker: 'AAPL', change: 0.69, sector: 'Tecnología electrónica', size: 2 },
  { ticker: 'AVGO', change: 2.12, sector: 'Tecnología electrónica', size: 2 },
  { ticker: 'META', change: -2.13, sector: 'Servicios tecnológicos', size: 2 },
  { ticker: 'NFLX', change: -2.31, sector: 'Servicios tecnológicos', size: 1 },
  { ticker: 'PLTR', change: 1.20, sector: 'Servicios tecnológicos', size: 1 },
  { ticker: 'ORCL', change: 2.62, sector: 'Servicios tecnológicos', size: 2 },
  { ticker: 'IBM', change: 0.04, sector: 'Servicios tecnológicos', size: 1 },
  { ticker: 'APP', change: -2.45, sector: 'Servicios tecnológicos', size: 1 },
  { ticker: 'CRM', change: -1.20, sector: 'Servicios tecnológicos', size: 1 },
  { ticker: 'INTU', change: -1.16, sector: 'Servicios tecnológicos', size: 1 },
  { ticker: 'NOW', change: -2.18, sector: 'Servicios tecnológicos', size: 1 },
  { ticker: 'GE', change: 0.01, sector: 'Tecnología electrónica', size: 1 },
  { ticker: 'RTX', change: -0.59, sector: 'Tecnología electrónica', size: 1 },
  { ticker: 'CSCO', change: -0.49, sector: 'Tecnología electrónica', size: 1 },
  { ticker: 'AMD', change: 0.07, sector: 'Tecnología electrónica', size: 1 },
  { ticker: 'MU', change: 7.84, sector: 'Tecnología electrónica', size: 1 },
  { ticker: 'ANET', change: 2.15, sector: 'Tecnología electrónica', size: 1 },
];

const HeatmapCell = ({ ticker, change }: { ticker: string; change: number }) => {
  const colorClass =
    change >= 0
      ? `bg-green-500/${Math.min(Math.floor(Math.abs(change) * 20), 90) + 10}`
      : `bg-red-500/${Math.min(Math.floor(Math.abs(change) * 20), 90) + 10}`;
  const textColor = `text-white`;

  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded-md ${colorClass} ${textColor}`}>
      <div className="text-lg md:text-xl font-bold">{ticker}</div>
      <div className="text-sm md:text-base font-medium">{(change > 0 ? '+' : '') + change.toFixed(2)}%</div>
    </div>
  );
};

export default function HeatmapPage() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mapa de calor de acciones</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Button variant="outline"><Globe className="mr-2" />Índice S&P 500</Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Briefcase className="mr-2" />Capitalización de mercado <ChevronDown className="ml-2"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>Market Cap</DropdownMenuItem>
                <DropdownMenuItem>Volume</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Rows className="mr-2" />Cambiar a D, % <ChevronDown className="ml-2"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>Change %</DropdownMenuItem>
                <DropdownMenuItem>Change $</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Columns className="mr-2" />Sector <ChevronDown className="ml-2"/>
                Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>Technology</DropdownMenuItem>
                <DropdownMenuItem>Healthcare</DropdownMenuItem>
                <DropdownMenuItem>Financials</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 bg-card p-4 rounded-lg">
        <div className="grid grid-cols-6 grid-rows-4 gap-1 h-full">
          <div className="col-span-2 row-span-2"> <HeatmapCell ticker="NVDA" change={0.10} /> </div>
          <div className="col-span-2 row-span-2"> <HeatmapCell ticker="MSFT" change={-0.37} /> </div>
          <div className="col-span-2 row-span-2"> <HeatmapCell ticker="GOOGL" change={0.13} /> </div>
          <div className="col-span-2 row-span-2"> <HeatmapCell ticker="AAPL" change={0.69} /> </div>
          <div className="col-span-1 row-span-2"> <HeatmapCell ticker="AVGO" change={2.12} /> </div>
          <div className="col-span-3 row-span-2"> <HeatmapCell ticker="META" change={-2.13} /> </div>
          <div className="col-span-1 row-span-1"> <HeatmapCell ticker="NFLX" change={-2.31} /> </div>
          <div className="col-span-1 row-span-1"> <HeatmapCell ticker="PLTR" change={1.20} /> </div>
          <div className="col-span-2 row-span-2"> <HeatmapCell ticker="ORCL" change={2.62} /> </div>
          <div className="col-span-1 row-span-1"> <HeatmapCell ticker="IBM" change={0.04} /> </div>
          <div className="col-span-1 row-span-1"> <HeatmapCell ticker="APP" change={-2.45} /></div>
          <div className="col-span-1 row-span-1"> <HeatmapCell ticker="CRM" change={-1.20} /> </div>
          <div className="col-span-1 row-span-1"> <HeatmapCell ticker="INTU" change={-1.16} /> </div>
          <div className="col-span-1 row-span-1"> <HeatmapCell ticker="NOW" change={-2.18} /> </div>
          <div className="col-span-1 row-span-1"> <HeatmapCell ticker="GE" change={0.01} /> </div>
          <div className="col-span-1 row-span-1"> <HeatmapCell ticker="RTX" change={-0.59} /> </div>
          <div className="col-span-1 row-span-1"> <HeatmapCell ticker="CSCO" change={-0.49} /></div>
          <div className="col-span-1 row-span-1"> <HeatmapCell ticker="AMD" change={0.07} /></div>
          <div className="col-span-1 row-span-1"> <HeatmapCell ticker="MU" change={7.84} /> </div>
          <div className="col-span-1 row-span-1"> <HeatmapCell ticker="ANET" change={2.15} /></div>
        </div>
      </div>
    </div>
  );
}

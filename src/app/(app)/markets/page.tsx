
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';

const sectors = [
  {
    name: 'Technology',
    change: 1.25,
    marketCap: 25.3,
    companies: [
      { name: 'Apple Inc.', ticker: 'AAPL', change: 2.1, marketCap: 3.2 },
      { name: 'Microsoft Corp.', ticker: 'MSFT', change: 1.5, marketCap: 3.1 },
      { name: 'NVIDIA Corp.', ticker: 'NVDA', change: -0.5, marketCap: 2.9 },
    ],
  },
  {
    name: 'Healthcare',
    change: -0.5,
    marketCap: 15.2,
    companies: [
      { name: 'Eli Lilly and Co', ticker: 'LLY', change: -1.1, marketCap: 0.8 },
      { name: 'Johnson & Johnson', ticker: 'JNJ', change: 0.2, marketCap: 0.5 },
      { name: 'Merck & Co. Inc.', ticker: 'MRK', change: -0.8, marketCap: 0.4 },
    ],
  },
    {
    name: 'Financials',
    change: 0.8,
    marketCap: 18.9,
    companies: [
        { name: 'Berkshire Hathaway', ticker: 'BRK.B', change: 0.5, marketCap: 0.9 },
        { name: 'JPMorgan Chase', ticker: 'JPM', change: 1.2, marketCap: 0.6 },
        { name: 'Visa Inc.', ticker: 'V', change: 0.9, marketCap: 0.5 },
    ],
  },
];


const ChangeIndicator = ({ value }: { value: number }) => (
    <div className={`flex items-center gap-1 ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {value >= 0 ? <ArrowUp size={14}/> : <ArrowDown size={14} />}
        <span>{value.toFixed(2)}%</span>
    </div>
)

export default function MarketsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold">Markets Overview</h1>
        <p className="text-muted-foreground">
          Explore market performance by sectors and industries.
        </p>
      </div>

      <Tabs defaultValue="sectors">
        <TabsList>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="industries">Industries</TabsTrigger>
        </TabsList>
        <TabsContent value="sectors">
          <Card>
            <CardHeader>
                <CardTitle>S&P 500 Sectors</CardTitle>
                <CardDescription>Performance of the main market sectors.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {sectors.map((sector) => (
                        <AccordionItem value={sector.name} key={sector.name}>
                            <AccordionTrigger>
                                <div className="flex justify-between w-full pr-4">
                                    <div className="font-semibold text-lg">{sector.name}</div>
                                    <div className="flex items-center gap-8">
                                        <ChangeIndicator value={sector.change}/>
                                        <Badge variant="secondary">{sector.marketCap}T</Badge>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="flex flex-col gap-2 p-2 bg-muted/50 rounded-md">
                                    {sector.companies.map(company => (
                                        <div key={company.ticker} className="grid grid-cols-3 items-center p-2 rounded-md hover:bg-muted">
                                            <div>
                                                <div className="font-medium">{company.name}</div>
                                                <div className="text-sm text-muted-foreground">{company.ticker}</div>
                                            </div>
                                            <ChangeIndicator value={company.change}/>
                                            <div className="text-right font-mono">{company.marketCap}T</div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="industries">
            <Card>
                 <CardHeader>
                    <CardTitle>Industries</CardTitle>
                    <CardDescription>Coming soon...</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Industry breakdown will be available in a future update.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

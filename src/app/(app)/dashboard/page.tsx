import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUp,
  ArrowDown,
  Activity,
  DollarSign,
  Users,
  CreditCard,
} from 'lucide-react';
import {
  PortfolioChart,
  StrategyPerformanceChart,
} from '@/components/dashboard-charts';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Portfolio Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Strategies
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Backtests Ran
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Strategy Performance</CardTitle>
            <CardDescription>
              Performance of your top 5 strategies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StrategyPerformanceChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>
                Recent trades from your active strategies.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead className="text-center">Side</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">AAPL</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-green-800/80 text-green-300">
                      BUY
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">$2,500.00</TableCell>
                  <TableCell className="text-right">$205.50</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">TSLA</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-red-800/80 text-red-300">
                      SELL
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">$5,100.00</TableCell>
                  <TableCell className="text-right">$180.12</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>News Sentiment</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center gap-4">
              <div className="font-semibold text-lg">NVDA</div>
              <div className="flex items-center gap-2 text-green-400 ml-auto">
                <ArrowUp className="h-5 w-5" />
                <span>Strong Positive</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-semibold text-lg">AMD</div>
              <div className="flex items-center gap-2 text-green-400 ml-auto">
                <ArrowUp className="h-5 w-5" />
                <span>Positive</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-semibold text-lg">INTC</div>
              <div className="flex items-center gap-2 text-red-400 ml-auto">
                <ArrowDown className="h-5 w-5" />
                <span>Slightly Negative</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

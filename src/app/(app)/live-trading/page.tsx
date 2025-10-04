'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const liveTrades = [
  {
    ticker: "AAPL",
    side: "BUY",
    price: 175.2,
    size: 100,
    value: 17520,
    pnl: 250.75,
  },
  {
    ticker: "GOOGL",
    side: "SELL",
    price: 2850.5,
    size: 10,
    value: 28505,
    pnl: -120.25,
  },
  {
    ticker: "TSLA",
    side: "BUY",
    price: 950.0,
    size: 50,
    value: 47500,
    pnl: 1500.0,
  },
];

export default function LiveAccountPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Live Account</h1>
      <Card>
        <CardHeader>
          <CardTitle>Live Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liveTrades.map((trade, index) => (
                <TableRow key={index}>
                  <TableCell>{trade.ticker}</TableCell>
                  <TableCell>
                    <Badge
                      className={trade.side === "BUY" ? "text-green-300 bg-green-800/60" : "text-red-300 bg-red-800/60"}
                      variant="outline"
                    >
                      {trade.side}
                    </Badge>
                  </TableCell>
                  <TableCell>${trade.price.toFixed(2)}</TableCell>
                  <TableCell>{trade.size}</TableCell>
                  <TableCell>${trade.value.toFixed(2)}</TableCell>
                  <TableCell className={trade.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                    {trade.pnl >= 0 ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

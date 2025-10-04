
import { Suspense } from 'react';
import BacktestingClientPage from './backtesting-client';

// This is the Server Component
export default function BacktestingPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading Page...</div>}>
      <BacktestingClientPage />
    </Suspense>
  );
}

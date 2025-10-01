'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateStrategyFromPrompt } from '@/ai/flows/generate-strategy-from-prompt';
import { Loader2, Copy } from 'lucide-react';

const placeholderStrategy = `
class MyStrategy(bt.Strategy):
    def __init__(self):
        self.dataclose = self.datas[0].close
        self.order = None

    def next(self):
        if self.order:
            return
        if not self.position:
            if self.dataclose[0] < self.dataclose[-1]:
                self.order = self.buy()
        else:
            if len(self) >= (self.bar_executed + 5):
                self.order = self.sell()
`;

export default function StrategiesPage() {
  const [prompt, setPrompt] = useState(
    'Create a simple moving average crossover strategy. Buy when the fast MA (10 periods) crosses above the slow MA (30 periods). Sell when the fast MA crosses below the slow MA.'
  );
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: 'Error',
        description: 'Prompt cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedCode('');
    try {
      const result = await generateStrategyFromPrompt({ prompt });
      setGeneratedCode(result.strategyCode);
      toast({
        title: 'Strategy Generated',
        description: 'Python code for your strategy is ready.',
      });
    } catch (error) {
      console.error('Failed to generate strategy:', error);
      setGeneratedCode(placeholderStrategy); // Show placeholder on error
      toast({
        title: 'Generation Failed',
        description: 'Could not generate strategy. Showing a placeholder.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    const codeToCopy = generatedCode || placeholderStrategy;
    navigator.clipboard.writeText(codeToCopy);
    toast({
        title: 'Copied to Clipboard',
        description: 'Strategy code has been copied.',
      });
  }

  return (
    <div className="grid flex-1 gap-4 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>AI Strategy Generator</CardTitle>
          <CardDescription>
            Describe your trading strategy in plain English, and our AI will
            generate the Python code for you using Backtrader.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Buy when RSI is below 30 and sell when it's above 70."
            className="min-h-[100px]"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Strategy
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Generated Python Code</CardTitle>
                <CardDescription>
                Copy and use this code in your backtesting environment.
                </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
            </Button>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code className="text-sm font-code">
              {isLoading
                ? 'Generating your strategy...'
                : generatedCode || placeholderStrategy}
            </code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

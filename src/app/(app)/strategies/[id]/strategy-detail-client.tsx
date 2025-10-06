'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

// This is the client component, responsible for interactivity
export default function StrategyDetailClient({ strategyId, initialCode }: { strategyId: string, initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [backendMessage, setBackendMessage] = useState('Loading message from backend...');
  const { toast } = useToast();

  useEffect(() => {
    const functionUrl = 'https://us-central1-studio-2799607830-e7b65.cloudfunctions.net/runbacktest';

    fetch(functionUrl)
      .then(response => response.text())
      .then(text => {
        setBackendMessage(text);
        toast({
            title: 'Backend Connected',
            description: 'Successfully received message from the backend.',
        });
      })
      .catch(error => {
        console.error("Error fetching from backend:", error);
        setBackendMessage('Failed to connect to backend. Check console for details.');
        toast({
            title: 'Backend Connection Failed',
            description: 'Please check the function URL and logs.',
            variant: 'destructive',
        });
      });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({
        title: 'Copied to Clipboard',
        description: 'Strategy code has been copied.',
      });
  }

  const handleSave = () => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        toast({
            title: 'Strategy Saved',
            description: 'Your changes have been saved.',
        });
      }, 1000);
  }

  return (
    <div className="grid flex-1 gap-4 md:gap-8">
       <div className="flex items-center gap-4">
        <Link href="/strategies">
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 capitalize">
          {strategyId.replace(/([A-Z])/g, ' $1')} Strategy
        </h1>
         <div className="ml-auto flex items-center gap-2">
            <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backend Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{backendMessage}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Strategy Code</CardTitle>
                <CardDescription>
                    Edit the Python code for your strategy below.
                </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy</span>
            </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg overflow-x-auto h-[500px]">
            <textarea
              className="w-full h-full bg-transparent text-sm font-code resize-none border-none focus:outline-none"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

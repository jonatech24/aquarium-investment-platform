'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { summarizeNewsSentiment } from '@/ai/flows/summarize-news-sentiment';
import { useToast } from '@/hooks/use-toast';

const sampleArticles = {
    AAPL: [
        "Apple's new Vision Pro is seeing 'strong' demand, but it may not last.",
        "Analysts are bullish on Apple's stock ahead of its quarterly earnings report.",
        "iPhone sales in China have reportedly dropped by 24% year-over-year.",
    ],
    TSLA: [
        "Tesla recalls over 2 million vehicles due to autopilot safety concerns.",
        "Elon Musk announces plans for a new, affordable Tesla model to be released in 2025.",
        "Tesla's Q4 earnings beat expectations, with record vehicle deliveries.",
    ]
};

const sampleSummaries = {
    AAPL: "The sentiment for Apple is mixed. While there is positive analyst outlook and initial demand for the Vision Pro, concerns about its sustainability and a significant drop in iPhone sales in the key Chinese market create a negative pressure.",
    TSLA: "Sentiment for Tesla is highly volatile. A massive recall raises significant safety and quality concerns, which is a strong negative. However, this is counterbalanced by a positive earnings report and the announcement of a new affordable model, which could drive future growth.",
}

type Ticker = keyof typeof sampleArticles;

export default function NewsPage() {
  const [ticker, setTicker] = useState('AAPL');
  const [isLoading, setIsLoading] = useState(false);
  const [sentimentSummary, setSentimentSummary] = useState('');
  const [currentArticles, setCurrentArticles] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!ticker) return;

    const upperTicker = ticker.toUpperCase() as Ticker;
    if (!(upperTicker in sampleArticles)) {
        toast({ title: 'Invalid Ticker', description: 'Please use AAPL or TSLA for this demo.', variant: 'destructive' });
        return;
    }

    setIsLoading(true);
    setSentimentSummary('');
    setCurrentArticles(sampleArticles[upperTicker]);

    try {
      const result = await summarizeNewsSentiment({
        ticker: upperTicker,
        articles: sampleArticles[upperTicker],
      });
      setSentimentSummary(result.sentimentSummary);
    } catch (error) {
      console.error('Failed to summarize sentiment:', error);
      setSentimentSummary(sampleSummaries[upperTicker]); // Fallback to sample summary
      toast({
        title: 'Analysis Failed',
        description: 'Could not get AI summary. Showing a placeholder.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>News Sentiment Analysis</CardTitle>
          <CardDescription>
            Enter a stock ticker to get the latest news and AI-powered sentiment
            analysis. (Demo: try AAPL or TSLA)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="e.g., AAPL"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button type="button" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {currentArticles.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Sentiment Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <p>Analyzing...</p> : <p className="text-muted-foreground">{sentimentSummary}</p>}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent News for {ticker.toUpperCase()}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {currentArticles.map((article, index) => (
                            <Card key={index} className="bg-muted/50">
                                <CardContent className="p-4">
                                    <p className="text-sm">{article}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}

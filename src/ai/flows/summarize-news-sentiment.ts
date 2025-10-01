'use server';

/**
 * @fileOverview Summarizes the sentiment of news articles related to a specific ticker.
 *
 * - summarizeNewsSentiment - A function that takes a ticker symbol and a list of news articles
 *   and returns a summarized sentiment analysis.
 * - SummarizeNewsSentimentInput - The input type for the summarizeNewsSentiment function.
 * - SummarizeNewsSentimentOutput - The return type for the summarizeNewsSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNewsSentimentInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock.'),
  articles: z.array(z.string()).describe('A list of news articles related to the ticker.'),
});
export type SummarizeNewsSentimentInput = z.infer<typeof SummarizeNewsSentimentInputSchema>;

const SummarizeNewsSentimentOutputSchema = z.object({
  sentimentSummary: z.string().describe('A summarized sentiment analysis of the news articles.'),
});
export type SummarizeNewsSentimentOutput = z.infer<typeof SummarizeNewsSentimentOutputSchema>;

export async function summarizeNewsSentiment(input: SummarizeNewsSentimentInput): Promise<SummarizeNewsSentimentOutput> {
  return summarizeNewsSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNewsSentimentPrompt',
  input: {schema: SummarizeNewsSentimentInputSchema},
  output: {schema: SummarizeNewsSentimentOutputSchema},
  prompt: `You are an expert financial analyst. Your task is to summarize the sentiment of the following news articles related to the ticker {{{ticker}}}.\n\nNews Articles:\n{{#each articles}}\n- {{{this}}}\n{{/each}}\n\nProvide a concise summary of the overall sentiment (positive, negative, or neutral) and explain the main reasons behind it.`,
});

const summarizeNewsSentimentFlow = ai.defineFlow(
  {
    name: 'summarizeNewsSentimentFlow',
    inputSchema: SummarizeNewsSentimentInputSchema,
    outputSchema: SummarizeNewsSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

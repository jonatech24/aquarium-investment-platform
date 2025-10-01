'use server';

/**
 * @fileOverview A flow to generate a trading strategy from a natural language prompt.
 *
 * - generateStrategyFromPrompt - A function that generates a trading strategy from a natural language prompt.
 * - GenerateStrategyFromPromptInput - The input type for the generateStrategyFromPrompt function.
 * - GenerateStrategyFromPromptOutput - The return type for the generateStrategyFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStrategyFromPromptInputSchema = z.object({
  prompt: z.string().describe('A natural language prompt describing the desired trading strategy.'),
});
export type GenerateStrategyFromPromptInput = z.infer<typeof GenerateStrategyFromPromptInputSchema>;

const GenerateStrategyFromPromptOutputSchema = z.object({
  strategyCode: z.string().describe('The generated trading strategy code in Python.'),
});
export type GenerateStrategyFromPromptOutput = z.infer<typeof GenerateStrategyFromPromptOutputSchema>;

export async function generateStrategyFromPrompt(input: GenerateStrategyFromPromptInput): Promise<GenerateStrategyFromPromptOutput> {
  return generateStrategyFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStrategyFromPromptPrompt',
  input: {schema: GenerateStrategyFromPromptInputSchema},
  output: {schema: GenerateStrategyFromPromptOutputSchema},
  prompt: `You are an expert trading strategy developer. Generate a trading strategy in Python based on the following natural language prompt:\n\n{{{prompt}}}\n\nThe strategy should be compatible with the Backtrader library. Ensure that the generated code includes all necessary imports and adheres to best practices for trading strategy development.  Make sure to return only valid Python code.  The code should define a class that inherits from backtrader.Strategy, and should implement the next() method.
`,
});

const generateStrategyFromPromptFlow = ai.defineFlow(
  {
    name: 'generateStrategyFromPromptFlow',
    inputSchema: GenerateStrategyFromPromptInputSchema,
    outputSchema: GenerateStrategyFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

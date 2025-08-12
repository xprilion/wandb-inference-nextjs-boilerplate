import { createWandbClient, getSettingsFromHeaders } from '@/lib/wandb-client';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { 
      prompt, 
      model = 'moonshotai/Kimi-K2-Instruct',
      temperature = 0.7,
      maxTokens = 500,
      systemPrompt = 'You are a helpful assistant.'
    } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user settings from headers
    const { apiKey, team, project } = getSettingsFromHeaders(req);
    
    // Create WandB client with user settings
    const wandbClient = createWandbClient(apiKey || undefined, team || undefined, project || undefined);

    const response = await wandbClient.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: maxTokens,
    });

    return new Response(
      JSON.stringify({ 
        text: response.choices[0]?.message?.content || 'No response generated'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Generate API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate text',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

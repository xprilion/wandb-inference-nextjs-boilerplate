import { createWandbClient, getSettingsFromHeaders } from '@/lib/wandb-client';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, model = 'moonshotai/Kimi-K2-Instruct' } = await req.json();

    // Get user settings from headers
    const { apiKey } = getSettingsFromHeaders(req);
    
    // Create WandB client with user settings
    const wandbClient = createWandbClient(apiKey || undefined);

    // Use the WandB client directly for streaming
    const response = await wandbClient.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    // Convert OpenAI stream to ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            const data = JSON.stringify({ content });
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }
        }
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

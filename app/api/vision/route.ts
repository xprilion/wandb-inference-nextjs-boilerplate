import { createWandbClient } from '@/lib/wandb-client';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, imageUrl, prompt = 'Describe this image in detail.', model = 'meta-llama/Llama-4-Scout-17B-16E-Instruct' } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create WandB client
    const wandbClient = createWandbClient();

    // Prepare messages for vision model
    const visionMessages = messages || [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ];

    const response = await wandbClient.chat.completions.create({
      model,
      messages: visionMessages,
      temperature: 0.7,
      max_tokens: 1000,
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
    console.error('Vision API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process vision request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

import { createWandbClient, getSettingsFromHeaders } from '@/lib/wandb-client';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // Get user settings from headers
    const { apiKey, project } = getSettingsFromHeaders(request);
    
    // Create WandB client with user settings
    const wandbClient = createWandbClient(apiKey || undefined, project);

    // Fetch available models from WandB API
    const response = await wandbClient.models.list();

    return new Response(
      JSON.stringify({ 
        models: response.data || []
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    console.error('Models API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch models',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

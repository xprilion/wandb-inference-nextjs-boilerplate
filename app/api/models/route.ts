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

    const noCache = request.headers.get('X-No-Cache') === '1';

    return new Response(
      JSON.stringify({ 
        models: response.data || []
      }),
      {
        status: 200,
        headers: noCache ? {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } : {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
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

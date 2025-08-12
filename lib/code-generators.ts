import { WandbSettings } from './settings';

export interface RequestData {
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  settings: WandbSettings;
}

function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return apiKey;
  return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
}

export function generateCurlCommand(request: RequestData): string {
  const { endpoint, method, body, settings } = request;
  
  let curlCommand = `curl -X ${method} https://api.inference.wandb.ai/v1${endpoint} \\\n`;
  
  // Add headers
  curlCommand += `  -H "Content-Type: application/json" \\\n`;
  curlCommand += `  -H "Authorization: Bearer ${maskApiKey(settings.apiKey)}" \\\n`;
  curlCommand += `  -H "OpenAI-Project: ${settings.team}/${settings.project}" \\\n`;
  
  // Add body if present
  if (body && Object.keys(body).length > 0) {
    const bodyJson = JSON.stringify(body, null, 2);
    curlCommand += `  -d '${bodyJson}'`;
  }
  
  return curlCommand;
}

export function generatePythonCode(request: RequestData): string {
  const { endpoint, body, settings } = request;
  
  let pythonCode = `import openai\n\n`;
  pythonCode += `# Initialize the WandB Inference client\n`;
  pythonCode += `client = openai.OpenAI(\n`;
  pythonCode += `    base_url='https://api.inference.wandb.ai/v1',\n`;
  pythonCode += `    api_key='${maskApiKey(settings.apiKey)}',\n`;
  pythonCode += `    default_headers={\n`;
  pythonCode += `        'Content-Type': 'application/json',\n`;
  pythonCode += `        'Authorization': 'Bearer ${maskApiKey(settings.apiKey)}',\n`;
  pythonCode += `        'OpenAI-Project': '${settings.team}/${settings.project}',\n`;
  pythonCode += `    },\n`;
  pythonCode += `)\n\n`;
  
  if (endpoint === '/chat/completions') {
    pythonCode += `# Create a chat completion\n`;
    pythonCode += `response = client.chat.completions.create(\n`;
    pythonCode += `    model='${body.model}',\n`;
    pythonCode += `    messages=${JSON.stringify(body.messages, null, 4).replace(/^/gm, '    ')},\n`;
    if (body.temperature !== undefined) {
      pythonCode += `    temperature=${body.temperature},\n`;
    }
    if (body.max_tokens !== undefined) {
      pythonCode += `    max_tokens=${body.max_tokens},\n`;
    }
    pythonCode += `)\n\n`;
    pythonCode += `print(response.choices[0].message.content)`;
  } else if (endpoint === '/models') {
    pythonCode += `# List available models\n`;
    pythonCode += `models = client.models.list()\n\n`;
    pythonCode += `for model in models.data:\n`;
    pythonCode += `    print(f"Model: {model.id}")`;
  }
  
  return pythonCode;
}

export function generateTypeScriptCode(request: RequestData): string {
  const { endpoint, body, settings } = request;
  
  let tsCode = `import OpenAI from 'openai';\n\n`;
  tsCode += `// Initialize the WandB Inference client\n`;
  tsCode += `const client = new OpenAI({\n`;
  tsCode += `  baseURL: 'https://api.inference.wandb.ai/v1',\n`;
  tsCode += `  apiKey: '${maskApiKey(settings.apiKey)}',\n`;
  tsCode += `  defaultHeaders: {\n`;
  tsCode += `    'Content-Type': 'application/json',\n`;
  tsCode += `    'Authorization': 'Bearer ${maskApiKey(settings.apiKey)}',\n`;
  tsCode += `    'OpenAI-Project': '${settings.team}/${settings.project}',\n`;
  tsCode += `  },\n`;
  tsCode += `});\n\n`;
  
  if (endpoint === '/chat/completions') {
    tsCode += `// Create a chat completion\n`;
    tsCode += `async function createChatCompletion() {\n`;
    tsCode += `  try {\n`;
    tsCode += `    const response = await client.chat.completions.create({\n`;
    tsCode += `      model: '${body.model}',\n`;
    tsCode += `      messages: ${JSON.stringify(body.messages, null, 6).replace(/^/gm, '      ')},\n`;
    if (body.temperature !== undefined) {
      tsCode += `      temperature: ${body.temperature},\n`;
    }
    if (body.max_tokens !== undefined) {
      tsCode += `      max_tokens: ${body.max_tokens},\n`;
    }
    tsCode += `    });\n\n`;
    tsCode += `    console.log(response.choices[0]?.message?.content);\n`;
    tsCode += `    return response;\n`;
    tsCode += `  } catch (error) {\n`;
    tsCode += `    console.error('Error:', error);\n`;
    tsCode += `    throw error;\n`;
    tsCode += `  }\n`;
    tsCode += `}\n\n`;
    tsCode += `// Call the function\n`;
    tsCode += `createChatCompletion();`;
  } else if (endpoint === '/models') {
    tsCode += `// List available models\n`;
    tsCode += `async function listModels() {\n`;
    tsCode += `  try {\n`;
    tsCode += `    const models = await client.models.list();\n`;
    tsCode += `    \n`;
    tsCode += `    models.data.forEach((model) => {\n`;
    tsCode += `      console.log(\`Model: \${model.id}\`);\n`;
    tsCode += `    });\n`;
    tsCode += `    \n`;
    tsCode += `    return models;\n`;
    tsCode += `  } catch (error) {\n`;
    tsCode += `    console.error('Error:', error);\n`;
    tsCode += `    throw error;\n`;
    tsCode += `  }\n`;
    tsCode += `}\n\n`;
    tsCode += `// Call the function\n`;
    tsCode += `listModels();`;
  }
  
  return tsCode;
}

export function getRequestDataFromPlayground(
  mode: string,
  selectedTask: { category?: string; systemPrompt?: string } | null,
  prompt: string,
  selectedModel: string,
  imageUrl: string,
  settings: WandbSettings
): RequestData {
  let endpoint = '/chat/completions';
  let body: Record<string, unknown> = {};

  if (mode === 'templates' && selectedTask?.category === 'vision' && imageUrl) {
    endpoint = '/chat/completions';
    body = {
      model: selectedModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    };
  } else {
    body = {
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: mode === 'templates' ? selectedTask?.systemPrompt || 'You are a helpful assistant.' : 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: mode === 'templates' ? 500 : 1000,
    };
  }

  return {
    endpoint,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`,
      'OpenAI-Project': `${settings.team}/${settings.project}`,
    },
    body,
    settings,
  };
}

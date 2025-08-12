# WandB Inference Next.js Boilerplate

A comprehensive AI playground built with [Next.js](https://nextjs.org) and [WandB Inference](https://wandb.ai) that showcases various AI capabilities including advanced reasoning, text generation, vision models, code generation, and more.

## 🌟 Features

- **15+ AI Task Examples**: Text generation, advanced reasoning, code generation, vision analysis, and more
- **Cutting-edge Models**: Access to DeepSeek R1, Qwen3, GPT OSS, Llama 4 Scout, and more through WandB Inference
- **Advanced Reasoning**: Support for complex problem solving and mathematical reasoning
- **Vision Models**: Support for image analysis using Llama-4-Scout-17B-16E-Instruct
- **Model-wise Showcase**: Browse tasks organized by AI model capabilities
- **Modern UI**: Clean, HuggingFace-inspired design with light/dark mode support
- **Type-safe**: Built with TypeScript for better development experience
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- WandB account with API access
- WandB team and project set up

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd wandb-inference-nextjs-boilerplate
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the project root:

```env
# WandB Inference API Configuration
WANDB_API_KEY=your-wandb-api-key-here
WANDB_TEAM=your-team-name
WANDB_PROJECT=your-project-name

# Optional: Alternative environment variable names that OpenAI SDK can pick up
OPENAI_API_KEY=your-wandb-api-key-here
```

To get your WandB API key:
1. Visit [https://wandb.ai/authorize](https://wandb.ai/authorize)
2. Copy your API key
3. Set up your team and project in WandB

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the playground in action!

## 🎯 Available AI Tasks

The playground includes 15+ different AI task examples:

### Text Generation
- **Chat Completion**: Interactive conversations with AI assistants
- **Text Summarization**: Condense long texts into concise summaries
- **Language Translation**: Translate between different languages
- **Question Answering**: Get answers based on context or knowledge
- **Email Composition**: Generate professional emails and messages
- **Blog Post Writing**: Create engaging blog posts and articles

### Advanced Reasoning
- **Complex Reasoning**: Solve multi-step problems with detailed explanations
- **Mathematical Reasoning**: Mathematical problem solving with step-by-step solutions
- **Logical Puzzles**: Brain teasers and logical problem solving

### Code & Development
- **Code Generation**: Generate code snippets and functions
- **Code Review**: Analyze and improve existing code

### Creative & Analysis
- **Creative Writing**: Generate stories and creative content
- **Data Analysis**: Analyze and interpret data patterns
- **Sentiment Analysis**: Analyze emotions and sentiment in text

### Vision
- **Image Analysis**: Analyze and describe images using vision models

## 🔧 Technical Architecture

### API Routes

- `/api/chat` - Streaming chat completions
- `/api/generate` - Text generation with various prompts
- `/api/vision` - Image analysis with vision models

### Key Components

- `components/playground.tsx` - Main playground interface with model-wise showcase
- `components/theme-provider.tsx` - Dark/light mode support
- `lib/wandb-client.ts` - WandB Inference client configuration
- `lib/tasks.ts` - AI task definitions including reasoning tasks

### Models Supported

**Text Generation:**
- `openai/gpt-oss-20b` - GPT OSS 20B
- `openai/gpt-oss-120b` - GPT OSS 120B  
- `meta-llama/Llama-3.3-70B-Instruct` - Llama 3.3 70B
- `meta-llama/Llama-3.1-8B-Instruct` - Llama 3.1 8B
- `moonshotai/Kimi-K2-Instruct` - Kimi K2 Instruct
- `microsoft/Phi-4-mini-instruct` - Phi-4 Mini

**Advanced Reasoning:**
- `deepseek-ai/DeepSeek-R1-0528` - DeepSeek R1
- `deepseek-ai/DeepSeek-V3-0324` - DeepSeek V3
- `Qwen/Qwen3-235B-A22B-Thinking-2507` - Qwen3 235B Thinking
- `Qwen/Qwen3-235B-A22B-Instruct-2507` - Qwen3 235B Instruct

**Code Generation:**
- `Qwen/Qwen3-Coder-480B-A35B-Instruct` - Qwen3 Coder 480B
- `deepseek-ai/DeepSeek-V3-0324` - DeepSeek V3

**Vision:**
- `meta-llama/Llama-4-Scout-17B-16E-Instruct` - Llama 4 Scout Vision

## 🛠 Usage Examples

### Basic Text Generation

```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Write a short story about AI',
    model: 'moonshotai/Kimi-K2-Instruct',
    systemPrompt: 'You are a creative writer.'
  })
});
```

### Vision Analysis

```typescript
const response = await fetch('/api/vision', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageUrl: 'https://example.com/image.jpg',
    prompt: 'Describe this image in detail',
    model: 'meta-llama/Llama-4-Scout-17B-16E-Instruct'
  })
});
```

### Streaming Chat

```typescript
// The playground uses direct OpenAI client calls for streaming
const response = await wandbClient.chat.completions.create({
  model: 'openai/gpt-oss-120b',
  messages: messages,
  stream: true,
});
```

## 🌐 WandB Integration

This project uses WandB Inference as an OpenAI-compatible API. The integration includes:

- Automatic request logging with Weave (when configured)
- Usage tracking by team and project
- Access to various open-source and proprietary models
- Cost-effective inference compared to direct API calls

### API Headers Configuration

The WandB Inference API requires specific headers for authentication and project tracking:

```bash
curl https://api.inference.wandb.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-apikey>" \
  -H "OpenAI-Project: <team>/<project>" \
  -d '{
    "model": "moonshotai/Kimi-K2-Instruct",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Tell me a joke." }
    ]
  }'
```

### Python Equivalent

The JavaScript implementation mirrors this Python approach:

```python
import openai
import weave

# Weave autopatches OpenAI to log LLM calls to W&B
weave.init("<team>/<project>")

client = openai.OpenAI(
    base_url='https://api.inference.wandb.ai/v1',
    api_key="<your-apikey>",
    default_headers={
        "OpenAI-Project": "<team>/<project>"
    }
)

response = client.chat.completions.create(
    model="moonshotai/Kimi-K2-Instruct",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a joke."}
    ],
)
```

## 🎨 UI Design

The interface is inspired by HuggingFace's design philosophy:
- Clean, modern layout with ample white space
- Intuitive task selection with categories
- Real-time response display
- Copy and download functionality for outputs
- Responsive design that works on all devices

## 📦 Tech Stack

- **Framework**: Next.js 15 with App Router
- **AI Integration**: Direct OpenAI client with WandB Inference
- **Inference**: WandB Inference API
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Theme**: next-themes for dark/light mode
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## 🚀 Deployment

### Vercel (Recommended)

1. Fork this repository
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/wandb-inference-nextjs-boilerplate)

### Other Platforms

This Next.js app can be deployed on any platform that supports Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [WandB Documentation](https://docs.wandb.ai)
- [WandB Inference API](https://docs.wandb.ai/guides/integrations/openai)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 💡 Need Help?

- Check the [WandB Inference documentation](https://docs.wandb.ai/guides/integrations/openai)
- Join the [WandB Community](https://wandb.ai/community)
- Open an issue in this repository

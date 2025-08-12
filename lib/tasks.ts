export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'text' | 'vision' | 'code' | 'creative' | 'analysis' | 'reasoning';
  model: string;
  systemPrompt?: string;
  defaultPrompt: string;
  icon: string;
  color: string;
}

export const TASKS: Task[] = [
  {
    id: 'chat',
    title: 'Chat Completion',
    description: 'Have a conversation with an AI assistant',
    category: 'text',
    model: 'openai/gpt-oss-120b',
    systemPrompt: 'You are a helpful, friendly, and knowledgeable assistant.',
    defaultPrompt: 'Hello! How can you help me today?',
    icon: '💬',
    color: 'bg-blue-500'
  },
  {
    id: 'summarize',
    title: 'Text Summarization',
    description: 'Summarize long texts into concise summaries',
    category: 'text',
    model: 'meta-llama/Llama-3.1-8B-Instruct',
    systemPrompt: 'You are an expert at creating clear, concise summaries. Focus on the key points and main ideas.',
    defaultPrompt: 'Please summarize this article about artificial intelligence trends in 2024: [paste your text here]',
    icon: '📄',
    color: 'bg-green-500'
  },
  {
    id: 'translate',
    title: 'Language Translation',
    description: 'Translate text between different languages',
    category: 'text',
    model: 'moonshotai/Kimi-K2-Instruct',
    systemPrompt: 'You are a professional translator. Provide accurate translations while preserving context and meaning.',
    defaultPrompt: 'Translate this text to Spanish: "Hello, how are you doing today?"',
    icon: '🌍',
    color: 'bg-purple-500'
  },
  {
    id: 'code-generation',
    title: 'Code Generation',
    description: 'Generate code snippets and functions',
    category: 'code',
    model: 'Qwen/Qwen3-Coder-480B-A35B-Instruct',
    systemPrompt: 'You are a senior software engineer. Write clean, efficient, and well-documented code.',
    defaultPrompt: 'Write a Python function that calculates the fibonacci sequence up to n numbers',
    icon: '💻',
    color: 'bg-orange-500'
  },
  {
    id: 'code-review',
    title: 'Code Review',
    description: 'Review and improve existing code',
    category: 'code',
    model: 'deepseek-ai/DeepSeek-V3-0324',
    systemPrompt: 'You are a senior developer conducting a code review. Provide constructive feedback and suggestions.',
    defaultPrompt: 'Review this JavaScript function and suggest improvements:\\n\\nfunction add(a, b) {\\n  return a + b;\\n}',
    icon: '🔍',
    color: 'bg-red-500'
  },
  {
    id: 'creative-writing',
    title: 'Creative Writing',
    description: 'Generate creative stories and content',
    category: 'creative',
    model: 'moonshotai/Kimi-K2-Instruct',
    systemPrompt: 'You are a creative writer with a vivid imagination. Craft engaging and original stories.',
    defaultPrompt: 'Write a short story about a robot who discovers emotions for the first time',
    icon: '✍️',
    color: 'bg-pink-500'
  },
  {
    id: 'email-writing',
    title: 'Email Composition',
    description: 'Write professional emails and messages',
    category: 'text',
    model: 'meta-llama/Llama-3.1-8B-Instruct',
    systemPrompt: 'You are a professional communication expert. Write clear, concise, and appropriate emails.',
    defaultPrompt: 'Write a professional email to schedule a meeting with a client next week',
    icon: '📧',
    color: 'bg-indigo-500'
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis',
    description: 'Analyze and interpret data patterns',
    category: 'analysis',
    model: 'meta-llama/Llama-3.3-70B-Instruct',
    systemPrompt: 'You are a data analyst. Provide insights and interpretations based on data patterns.',
    defaultPrompt: 'Analyze this sales data and provide insights: Q1: $100k, Q2: $120k, Q3: $110k, Q4: $140k',
    icon: '📊',
    color: 'bg-teal-500'
  },
  {
    id: 'image-analysis',
    title: 'Image Analysis',
    description: 'Analyze and describe images in detail',
    category: 'vision',
    model: 'meta-llama/Llama-4-Scout-17B-16E-Instruct',
    systemPrompt: 'You are an expert at analyzing images. Provide detailed, accurate descriptions.',
    defaultPrompt: 'Describe what you see in this image in detail.',
    icon: '🖼️',
    color: 'bg-cyan-500'
  },
  {
    id: 'question-answering',
    title: 'Question Answering',
    description: 'Answer questions based on context or knowledge',
    category: 'text',
    model: 'moonshotai/Kimi-K2-Instruct',
    systemPrompt: 'You are a knowledgeable assistant. Provide accurate and helpful answers to questions.',
    defaultPrompt: 'What are the benefits of renewable energy sources?',
    icon: '❓',
    color: 'bg-yellow-500'
  },
  {
    id: 'sentiment-analysis',
    title: 'Sentiment Analysis',
    description: 'Analyze the sentiment and emotion in text',
    category: 'analysis',
    model: 'meta-llama/Llama-3.1-8B-Instruct',
    systemPrompt: 'You are an expert at analyzing sentiment and emotions in text. Provide detailed analysis.',
    defaultPrompt: 'Analyze the sentiment of this customer review: "The product arrived quickly and works perfectly. Great customer service!"',
    icon: '😊',
    color: 'bg-emerald-500'
  },
  {
    id: 'blog-writing',
    title: 'Blog Post Writing',
    description: 'Create engaging blog posts and articles',
    category: 'creative',
    model: 'moonshotai/Kimi-K2-Instruct',
    systemPrompt: 'You are a skilled content writer. Create engaging, informative, and well-structured blog posts.',
    defaultPrompt: 'Write a blog post about the benefits of remote work for software developers',
    icon: '📝',
    color: 'bg-violet-500'
  },
  {
    id: 'complex-reasoning',
    title: 'Complex Reasoning',
    description: 'Solve complex problems that require step-by-step thinking',
    category: 'reasoning',
    model: 'deepseek-ai/DeepSeek-R1-0528',
    systemPrompt: 'You are an expert at breaking down complex problems into logical steps. Think through each step carefully.',
    defaultPrompt: 'A farmer has 17 sheep. All but 9 die. How many sheep are left? Show your reasoning step by step.',
    icon: '🧩',
    color: 'bg-indigo-500'
  },
  {
    id: 'mathematical-reasoning',
    title: 'Mathematical Reasoning',
    description: 'Solve mathematical problems with detailed explanations',
    category: 'reasoning',
    model: 'Qwen/Qwen3-235B-A22B-Thinking-2507',
    systemPrompt: 'You are a mathematics expert. Solve problems step by step with clear explanations.',
    defaultPrompt: 'If a triangle has sides of length 3, 4, and 5 units, what type of triangle is it and what is its area?',
    icon: '🔢',
    color: 'bg-blue-600'
  },
  {
    id: 'logical-puzzles',
    title: 'Logical Puzzles',
    description: 'Solve logical puzzles and brain teasers',
    category: 'reasoning',
    model: 'deepseek-ai/DeepSeek-V3-0324',
    systemPrompt: 'You are an expert at solving logical puzzles. Think through each clue systematically.',
    defaultPrompt: 'Three switches control three light bulbs in another room. You can flip the switches as much as you want, but can only go to the other room once. How do you determine which switch controls which bulb?',
    icon: '🎯',
    color: 'bg-purple-600'
  }
];

export function getTasksByCategory(category: Task['category']) {
  return TASKS.filter(task => task.category === category);
}

export function getTaskById(id: string) {
  return TASKS.find(task => task.id === id);
}

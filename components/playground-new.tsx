"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TASKS, Task, getTasksByCategory } from '@/lib/tasks';
import { MODELS, ALL_MODELS } from '@/lib/wandb-client';
import { Loader2, Play, Copy, Download, Sparkles, Code, Brain, Eye, Palette, BarChart, Zap, MessageSquare } from 'lucide-react';

interface ApiModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  root: string;
}

type PlaygroundMode = 'templates' | 'blank';

const categoryIcons = {
  text: MessageSquare,
  reasoning: Brain,
  code: Code,
  vision: Eye,
  creative: Palette,
  analysis: BarChart,
};

export function Playground() {
  // Core state
  const [mode, setMode] = useState<PlaygroundMode>('templates');
  const [selectedTask, setSelectedTask] = useState<Task>(TASKS[0]);
  const [prompt, setPrompt] = useState(selectedTask.defaultPrompt);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedModel, setSelectedModel] = useState(selectedTask.model);
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState('');
  const [isResponseVisible, setIsResponseVisible] = useState(false);
  
  // API models state
  const [apiModels, setApiModels] = useState<ApiModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch models from API
  useEffect(() => {
    const fetchModels = async () => {
      if (mode !== 'blank') return;
      
      setIsLoadingModels(true);
      setModelsError(null);
      
      try {
        const response = await fetch('/api/models');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch models');
        }
        
        setApiModels(data.models || []);
      } catch (error) {
        console.error('Error fetching models:', error);
        setModelsError(error instanceof Error ? error.message : 'Unknown error');
        // Fallback to predefined models
        setApiModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, [mode]);

  // Memoized model options
  const availableModels = useMemo(() => {
    if (mode === 'blank' && apiModels.length > 0) {
      return apiModels.reduce((acc, model) => {
        acc[model.id] = model.id.split('/').pop() || model.id;
        return acc;
      }, {} as Record<string, string>);
    }
    return ALL_MODELS;
  }, [mode, apiModels]);

  // Handle task changes
  const handleTaskChange = (taskId: string) => {
    const task = TASKS.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setPrompt(task.defaultPrompt);
      setSelectedModel(task.model);
      setResponse('');
      setIsResponseVisible(false);
    }
  };

  // Handle mode change
  const handleModeChange = (newMode: PlaygroundMode) => {
    setMode(newMode);
    setResponse('');
    setIsResponseVisible(false);
    
    if (newMode === 'blank') {
      setPrompt('');
      setSelectedModel(Object.keys(availableModels)[0] || 'openai/gpt-oss-120b');
    } else {
      setSelectedTask(TASKS[0]);
      setPrompt(TASKS[0].defaultPrompt);
      setSelectedModel(TASKS[0].model);
    }
  };

  // Generate response
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setResponse('');
    setIsResponseVisible(true);

    try {
      let apiEndpoint = '/api/generate';
      let requestBody: {
        prompt: string;
        model: string;
        systemPrompt?: string;
        imageUrl?: string;
      } = {
        prompt,
        model: selectedModel,
        systemPrompt: mode === 'templates' ? selectedTask.systemPrompt : 'You are a helpful assistant.',
      };

      if (mode === 'templates' && selectedTask.category === 'vision' && imageUrl) {
        apiEndpoint = '/api/vision';
        requestBody = {
          imageUrl,
          prompt,
          model: selectedModel,
        };
      }

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await res.json();
      setResponse(data.text || data.content || '');
    } catch (error) {
      console.error('Generation error:', error);
      setResponse('Error: Failed to generate response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
  };

  const downloadResponse = () => {
    const blob = new Blob([response], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode === 'templates' ? selectedTask.id : 'blank'}-response.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Mode Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Playground</h2>
          <p className="text-muted-foreground mt-1">Choose a template or start from scratch</p>
        </div>
        
        <div className="flex bg-muted rounded-lg p-1">
          <Button
            variant={mode === 'templates' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleModeChange('templates')}
            className="h-8 px-3"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button
            variant={mode === 'blank' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleModeChange('blank')}
            className="h-8 px-3"
          >
            <Zap className="w-4 h-4 mr-2" />
            Blank
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          {mode === 'templates' ? (
            <Card className="h-fit max-h-[70vh] overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Task Templates</CardTitle>
                <CardDescription>Pre-configured AI tasks</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 w-full mx-4 mb-4">
                    <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                    <TabsTrigger value="categories" className="text-xs">Categories</TabsTrigger>
                    <TabsTrigger value="models" className="text-xs">Models</TabsTrigger>
                  </TabsList>
                  
                  <div className="max-h-[50vh] overflow-y-auto px-4 pb-4 space-y-2">
                    <TabsContent value="all" className="mt-0 space-y-2">
                      {TASKS.map((task) => (
                        <Button
                          key={task.id}
                          variant={selectedTask.id === task.id ? "default" : "ghost"}
                          className="w-full justify-start h-auto p-3 text-left"
                          onClick={() => handleTaskChange(task.id)}
                        >
                          <div className="flex items-start space-x-3 w-full">
                            <span className="text-lg flex-shrink-0">{task.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{task.title}</div>
                              <div className="text-xs text-muted-foreground truncate mt-1">
                                {task.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="categories" className="mt-0 space-y-3">
                      {['text', 'reasoning', 'code', 'vision', 'creative', 'analysis'].map((category) => {
                        const Icon = categoryIcons[category as keyof typeof categoryIcons];
                        const tasks = getTasksByCategory(category as Task['category']);
                        
                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center space-x-2 px-2">
                              <Icon className="w-4 h-4" />
                              <h3 className="font-medium text-sm capitalize">{category}</h3>
                            </div>
                            <div className="space-y-1 pl-6">
                              {tasks.map((task) => (
                                <Button
                                  key={task.id}
                                  variant={selectedTask.id === task.id ? "default" : "ghost"}
                                  size="sm"
                                  className="w-full justify-start h-8 text-xs"
                                  onClick={() => handleTaskChange(task.id)}
                                >
                                  <span className="mr-2">{task.icon}</span>
                                  {task.title}
                                </Button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </TabsContent>
                    
                    <TabsContent value="models" className="mt-0 space-y-2">
                      {Object.entries(MODELS).map(([category, models]) => (
                        <div key={category} className="space-y-2">
                          <h3 className="font-medium text-sm capitalize px-2">
                            {category.replace('_', ' ').toLowerCase()}
                          </h3>
                          <div className="space-y-1">
                            {Object.entries(models).map(([modelId, modelName]) => {
                              const tasksForModel = TASKS.filter(task => task.model === modelId);
                              return (
                                <div key={modelId} className="border rounded-lg p-2 space-y-2">
                                  <div>
                                    <div className="font-medium text-xs">{modelName}</div>
                                    <div className="text-xs text-muted-foreground truncate">{modelId}</div>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {tasksForModel.map((task) => (
                                      <Button
                                        key={task.id}
                                        variant={selectedTask.id === task.id ? "default" : "outline"}
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => handleTaskChange(task.id)}
                                      >
                                        <span className="mr-1">{task.icon}</span>
                                        {task.title}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Blank Playground</CardTitle>
                <CardDescription>Start with any model and prompt</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Use the configuration panel to select a model and start chatting.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Task Info (Templates mode only) */}
          {mode === 'templates' && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">{selectedTask.icon}</span>
                  <span>{selectedTask.title}</span>
                </CardTitle>
                <CardDescription>{selectedTask.description}</CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model">Model</Label>
                  {isLoadingModels ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(availableModels).map(([modelId, modelName]) => (
                          <SelectItem key={modelId} value={modelId}>
                            <div className="flex flex-col">
                              <span>{modelName}</span>
                              <span className="text-xs text-muted-foreground">{modelId}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {modelsError && (
                    <p className="text-xs text-destructive mt-1">
                      Failed to load models: {modelsError}
                    </p>
                  )}
                </div>

                {mode === 'templates' && selectedTask.category === 'vision' && (
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      placeholder="Enter image URL..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="prompt">
                  {mode === 'templates' ? 'Prompt' : 'Your message'}
                </Label>
                <Textarea
                  id="prompt"
                  placeholder={mode === 'templates' ? "Enter your prompt..." : "Ask anything..."}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={isMobile ? 3 : 4}
                  className="resize-none"
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt.trim()}
                className="w-full sm:w-auto"
                size={isMobile ? "default" : "lg"}
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </CardContent>
          </Card>

          {/* Response */}
          {isResponseVisible && (
            <Card className="transition-all duration-300 ease-in-out">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Response</CardTitle>
                  {response && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                        {!isMobile && <span className="ml-2">Copy</span>}
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadResponse}>
                        <Download className="h-4 w-4" />
                        {!isMobile && <span className="ml-2">Download</span>}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
                    {response || 'No response yet...'}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

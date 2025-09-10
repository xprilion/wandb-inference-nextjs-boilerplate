"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TASKS, Task } from '@/lib/tasks';
import { ALL_MODELS } from '@/lib/wandb-client';
import { isWandbConfigured, getWandbSettings, WandbSettings } from '@/lib/settings';
import { SettingsDialog } from '@/components/settings-dialog';
import { ExportDialog } from '@/components/export-dialog';
import { getRequestDataFromPlayground } from '@/lib/code-generators';
import { Loader2, Play, Copy, Download, Zap, Settings, ExternalLink, Code2, Search, Filter } from 'lucide-react';

interface ApiModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  root: string;
}

type PlaygroundMode = 'templates' | 'blank';



interface PlaygroundProps {
  userSettings?: WandbSettings | null;
  onSettingsChange?: (settings: WandbSettings | null) => void;
}

export function Playground({ userSettings, onSettingsChange }: PlaygroundProps) {
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
  
  // Settings state
  const [isConfigured, setIsConfigured] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<WandbSettings | null>(null);
  

  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModels, setShowModels] = useState(false);
  
  // Check configuration and load settings
  useEffect(() => {
    const settings = userSettings || getWandbSettings();
    setCurrentSettings(settings);
    setIsConfigured(isWandbConfigured());
  }, [userSettings]);

  // Fetch models from API
  useEffect(() => {
    const fetchModels = async () => {
      if (mode !== 'blank' || !isConfigured || !currentSettings) return;
      
      setIsLoadingModels(true);
      setModelsError(null);
      
      try {
        const response = await fetch('/api/models', {
          headers: {
            'X-WandB-API-Key': currentSettings.apiKey,
            ...(currentSettings.project ? { 'OpenAI-Project': currentSettings.project } : {}),
          },
        });
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
  }, [mode, isConfigured, currentSettings]);

  // Memoized model options
  const availableModels = useMemo(() => {
    if (mode === 'blank' && apiModels.length > 0) {
      return apiModels.reduce((acc, model) => {
        const parts = model.id.split('/');
        acc[model.id] = parts[parts.length - 1] || model.id;
        return acc;
      }, {} as Record<string, string>);
    }
    return ALL_MODELS;
  }, [mode, apiModels]);

  // Helper function to safely get model name
  const getModelName = (modelId: string): string => {
    return availableModels[modelId as keyof typeof availableModels] || modelId;
  };

  // Filtered tasks based on search and category
  const filteredTasks = useMemo(() => {
    return TASKS.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(TASKS.map(task => task.category)));
    return ['all', ...cats];
  }, []);

  // Available models as cards
  const modelCards = useMemo(() => {
    const models = Object.entries(availableModels);
    if (searchQuery) {
      return models.filter(([id, name]) => 
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return models;
  }, [availableModels, searchQuery]);

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
    setShowModels(false);
    
    if (newMode === 'blank') {
      setPrompt('');
      setSelectedModel(Object.keys(availableModels)[0] || 'openai/gpt-oss-120b');
    } else {
      setSelectedTask(TASKS[0]);
      setPrompt(TASKS[0].defaultPrompt);
      setSelectedModel(TASKS[0].model);
    }
  };

  // Handle settings change
  const handleSettingsChange = (settings: WandbSettings | null) => {
    setCurrentSettings(settings);
    setIsConfigured(settings !== null);
    onSettingsChange?.(settings);
  };



  // Generate response
  const handleGenerate = async () => {
    if (!prompt.trim() || !isConfigured || !currentSettings) return;

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
          'X-WandB-API-Key': currentSettings.apiKey,
          ...(currentSettings.project ? { 'OpenAI-Project': currentSettings.project } : {}),
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

  // Setup instructions component
  const SetupInstructions = () => (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-dashed border-2">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl">Setup Required</CardTitle>
          <CardDescription className="text-lg">
            Configure your WandB credentials to start using the AI playground
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-semibold mb-4 flex items-center">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm mr-3">1</span>
              Get your WandB API Key
            </h3>
            <p className="text-muted-foreground mb-3">
              Visit WandB to get your API key for accessing the inference service.
            </p>
            <Button variant="outline" asChild>
              <a
                href="https://wandb.ai/authorize"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Get API Key
              </a>
            </Button>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-semibold mb-4 flex items-center">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm mr-3">2</span>
              Configure Settings
            </h3>
            <p className="text-muted-foreground mb-3">
              Enter your WandB API key in the settings dialog.
            </p>
            <SettingsDialog 
              onSettingsChange={handleSettingsChange}
              trigger={
                <Button>
                  <Settings className="w-4 h-4 mr-2" />
                  Open Settings
                </Button>
              }
            />
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-semibold mb-4 flex items-center">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm mr-3">3</span>
              Start Playing!
            </h3>
            <p className="text-muted-foreground">
              Once configured, you&apos;ll have access to 15+ AI tasks and can experiment with various models including GPT OSS, DeepSeek R1, Qwen3, and Llama 4 Scout.
            </p>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Your credentials are stored locally in your browser and never sent to our servers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // If not configured, show setup instructions
  if (!isConfigured) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
        <SetupInstructions />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-3 lg:p-4 space-y-4">
      {/* Compact Header with Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold">AI Playground</h2>
            <p className="text-sm text-muted-foreground">Choose a task or model to get started</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showModels ? "default" : "outline"}
              size="sm"
              onClick={() => setShowModels(!showModels)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showModels ? 'Show Tasks' : 'Show Models'}
            </Button>
            <Button
              variant={mode === 'blank' ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeChange('blank')}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Custom
            </Button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={showModels ? "Search models..." : "Search tasks..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {!showModels && (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="space-y-4">
        {showModels ? (
          /* Model Cards */
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Available Models ({modelCards.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {modelCards.map(([modelId, modelName]) => (
                <Card 
                  key={modelId}
                  className={`cursor-pointer transition-all hover:shadow-sm hover:border-primary/50 ${
                    selectedModel === modelId ? 'ring-1 ring-primary border-primary' : ''
                  }`}
                  onClick={() => setSelectedModel(modelId)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm leading-tight">{modelName}</h4>
                        {selectedModel === modelId && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight truncate">
                        {modelId}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : mode === 'templates' ? (
          /* Task Cards */
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              Available Tasks ({filteredTasks.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className={`cursor-pointer transition-all hover:shadow-sm hover:border-primary/50 ${
                    selectedTask.id === task.id ? 'ring-1 ring-primary border-primary' : ''
                  }`}
                  onClick={() => handleTaskChange(task.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{task.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-tight line-clamp-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                          <span className="text-xs text-muted-foreground capitalize">{task.category}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Custom Mode */
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Zap className="w-10 h-10 text-muted-foreground mb-3" />
              <h4 className="text-base font-medium">Custom Playground</h4>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Start with any model and create your own prompts.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Configuration - Compact */}
      {(mode === 'blank' || selectedTask) && (
        <Card>
          <CardHeader className="pb-3">
            {mode === 'templates' && selectedTask && (
              <div className="flex items-center gap-3">
                <span className="text-xl">{selectedTask.icon}</span>
                <div>
                  <CardTitle className="text-lg">{selectedTask.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                </div>
              </div>
            )}
            {mode === 'blank' && (
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5" />
                <CardTitle className="text-lg">Custom Playground</CardTitle>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="model" className="text-sm">Model</Label>
                {isLoadingModels ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select a model">
                        {selectedModel ? (
                          <div className="flex flex-col items-start w-full">
                            <span className="font-medium text-sm truncate">{getModelName(selectedModel)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Select a model</span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {Object.entries(availableModels).map(([modelId, modelName]) => (
                        <SelectItem key={modelId} value={modelId} className="py-2">
                          <div className="flex flex-col items-start w-full">
                            <span className="font-medium text-sm">{modelName}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{modelId}</span>
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
                  <Label htmlFor="imageUrl" className="text-sm">Image URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="Enter image URL..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="h-9"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="prompt" className="text-sm">
                {mode === 'templates' ? 'Prompt' : 'Your message'}
              </Label>
              <Textarea
                id="prompt"
                placeholder={mode === 'templates' ? "Enter your prompt..." : "Ask anything..."}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt.trim() || !isConfigured}
                className="flex-1"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
              
              <ExportDialog 
                requestData={currentSettings ? getRequestDataFromPlayground(
                  mode,
                  selectedTask,
                  prompt,
                  selectedModel,
                  imageUrl,
                  currentSettings
                ) : {
                  endpoint: '/chat/completions',
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: { model: selectedModel, messages: [{ role: 'user', content: prompt }] },
                  settings: { apiKey: '' }
                }}
                trigger={
                  <Button 
                    variant="secondary" 
                    className="bg-amber-500 hover:bg-amber-600 text-white border-amber-500 hover:border-amber-600"
                    disabled={!prompt.trim() || !selectedModel || !isConfigured}
                  >
                    <Code2 className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response - Compact */}
      {isResponseVisible && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Response</CardTitle>
              {response && (
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline text-xs">Copy</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadResponse}>
                    <Download className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline text-xs">Download</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ) : (
              <div className="bg-muted p-3 rounded-md whitespace-pre-wrap font-mono text-xs max-h-80 overflow-y-auto border">
                {response || 'No response yet...'}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

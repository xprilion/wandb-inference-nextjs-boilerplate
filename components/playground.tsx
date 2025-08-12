"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TASKS, Task, getTasksByCategory } from '@/lib/tasks';
import { MODELS, ALL_MODELS } from '@/lib/wandb-client';
import { Loader2, Play, Copy, Download } from 'lucide-react';

export function Playground() {
  const [selectedTask, setSelectedTask] = useState<Task>(TASKS[0]);
  const [prompt, setPrompt] = useState(selectedTask.defaultPrompt);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedModel, setSelectedModel] = useState(selectedTask.model);
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState('');

  const handleTaskChange = (taskId: string) => {
    const task = TASKS.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setPrompt(task.defaultPrompt);
      setSelectedModel(task.model);
      setResponse('');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setResponse('');

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
        systemPrompt: selectedTask.systemPrompt,
      };

      if (selectedTask.category === 'vision' && imageUrl) {
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
    a.download = `${selectedTask.id}-response.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Selection Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>AI Tasks</CardTitle>
              <CardDescription>Choose from various AI capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-3 w-full mb-4">
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="models">Models</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <div className="space-y-2">
                    {TASKS.map((task) => (
                      <Button
                        key={task.id}
                        variant={selectedTask.id === task.id ? "default" : "ghost"}
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => handleTaskChange(task.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{task.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{task.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {task.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="categories">
                  <div className="space-y-4">
                    {['text', 'reasoning', 'code', 'vision', 'creative', 'analysis'].map((category) => (
                      <div key={category}>
                        <h3 className="font-medium capitalize mb-2">{category}</h3>
                        <div className="space-y-1">
                          {getTasksByCategory(category as Task['category']).map((task) => (
                            <Button
                              key={task.id}
                              variant={selectedTask.id === task.id ? "default" : "ghost"}
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleTaskChange(task.id)}
                            >
                              <span className="mr-2">{task.icon}</span>
                              {task.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="models">
                  <div className="space-y-4">
                    {Object.entries(MODELS).map(([category, models]) => (
                      <div key={category}>
                        <h3 className="font-medium capitalize mb-2">
                          {category.replace('_', ' ').toLowerCase()}
                        </h3>
                        <div className="space-y-1">
                          {Object.entries(models).map(([modelId, modelName]) => {
                            const tasksForModel = TASKS.filter(task => task.model === modelId);
                            return (
                              <div key={modelId} className="border rounded-lg p-3">
                                <div className="font-medium text-sm mb-1">{modelName}</div>
                                <div className="text-xs text-muted-foreground mb-2">{modelId}</div>
                                <div className="flex flex-wrap gap-1">
                                  {tasksForModel.map((task) => (
                                    <Button
                                      key={task.id}
                                      variant={selectedTask.id === task.id ? "default" : "outline"}
                                      size="sm"
                                      className="h-7 px-2 text-xs"
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
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Main Playground */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">{selectedTask.icon}</span>
                <span>{selectedTask.title}</span>
              </CardTitle>
              <CardDescription>{selectedTask.description}</CardDescription>
            </CardHeader>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="model">Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ALL_MODELS).map(([modelId, modelName]) => (
                      <SelectItem key={modelId} value={modelId}>
                        <div className="flex flex-col">
                          <span>{modelName}</span>
                          <span className="text-xs text-muted-foreground">{modelId}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTask.category === 'vision' && (
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

              <div>
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Enter your prompt..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !prompt.trim()}
                className="w-full"
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
          {response && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Response</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadResponse}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                  {response}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

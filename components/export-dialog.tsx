"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code2, FileCode, Terminal, Download, Package, Play, ExternalLink } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  RequestData, 
  generateCurlCommand, 
  generatePythonCode, 
  generateTypeScriptCode 
} from "@/lib/code-generators";

interface ExportDialogProps {
  requestData: RequestData;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

export function ExportDialog({ requestData, trigger, disabled = false }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [copiedInstall, setCopiedInstall] = useState<string | null>(null);

  const codeExamples = {
    curl: {
      label: "cURL",
      icon: Terminal,
      language: "bash",
      code: generateCurlCommand(requestData),
      installCmd: "# No installation required - cURL is pre-installed on most systems",
      filename: "wandb-inference-request.sh",
      description: "Direct HTTP request using cURL command",
      steps: [
        "Open your terminal or command prompt",
        "Replace the masked API key with your actual WandB API key",
        "Update team and project names if needed",
        "Run the command to make the request"
      ]
    },
    python: {
      label: "Python",
      icon: Code2,
      language: "python", 
      code: generatePythonCode(requestData),
      installCmd: "pip install openai",
      filename: "wandb-inference-example.py",
      description: "Python implementation using OpenAI SDK",
      steps: [
        "Install the OpenAI Python package",
        "Create a new Python file with the code",
        "Replace the masked API key with your actual WandB API key",
        "Run the script: python wandb-inference-example.py"
      ]
    },
    typescript: {
      label: "TypeScript",
      icon: FileCode,
      language: "typescript",
      code: generateTypeScriptCode(requestData),
      installCmd: "npm install openai",
      filename: "wandb-inference-example.ts",
      description: "TypeScript/Node.js implementation",
      steps: [
        "Install the OpenAI package via npm",
        "Create a new TypeScript/JavaScript file",
        "Replace the masked API key with your actual WandB API key",
        "Compile and run: npx ts-node wandb-inference-example.ts"
      ]
    },
  };

  const copyToClipboard = async (text: string, tab: string, type: 'code' | 'install' = 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'install') {
        setCopiedInstall(tab);
        setTimeout(() => setCopiedInstall(null), 2000);
      } else {
        setCopiedTab(tab);
        setTimeout(() => setCopiedTab(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" disabled={disabled}>
            <Code2 className="h-4 w-4 mr-2" />
            Export Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh] flex flex-col p-0">
        <div className="flex flex-col h-full p-6">
        <DialogHeader className="pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Code2 className="h-5 w-5" />
            <span>Export Request Code</span>
          </DialogTitle>
          <DialogDescription>
            Step-by-step guide to integrate this request into your application
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          <Tabs defaultValue="curl" className="h-full flex flex-col">
            <TabsList className="grid grid-cols-3 w-full mb-4 flex-shrink-0">
              {Object.entries(codeExamples).map(([key, example]) => {
                const Icon = example.icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center space-x-2 text-xs sm:text-sm">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{example.label}</span>
                    <span className="sm:hidden">{example.label.slice(0, 3)}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(codeExamples).map(([key, example]) => (
              <TabsContent key={key} value={key} className="flex-1 min-h-0 overflow-y-auto space-y-4 mt-0 pr-2">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <example.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{example.label}</h3>
                      <p className="text-sm text-muted-foreground">{example.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(example.code, key)}
                      className="flex-1 sm:flex-initial"
                    >
                      {copiedTab === key ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      <span className="hidden sm:inline">{copiedTab === key ? "Copied!" : "Copy Code"}</span>
                      <span className="sm:hidden">{copiedTab === key ? "✓" : "Copy"}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadCode(example.code, example.filename)}
                      className="flex-1 sm:flex-initial"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Download</span>
                      <span className="sm:hidden">⬇</span>
                    </Button>
                  </div>
                </div>

                {/* Step-by-step instructions */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Play className="h-4 w-4 mr-2" />
                    Step-by-Step Instructions
                  </h4>
                  <ol className="space-y-2">
                    {example.steps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Installation command */}
                {key !== 'curl' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Installation Command
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(example.installCmd, key, 'install')}
                      >
                        {copiedInstall === key ? (
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        <span className="hidden sm:inline">{copiedInstall === key ? "Copied!" : "Copy"}</span>
                        <span className="sm:hidden">{copiedInstall === key ? "✓" : "📋"}</span>
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <code className="text-sm font-mono">{example.installCmd}</code>
                    </div>
                  </div>
                )}

                {/* Code block */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center">
                    <FileCode className="h-4 w-4 mr-2" />
                    {example.label} Code
                  </h4>
                  <div className="relative rounded-lg overflow-hidden border">
                    <div className="max-h-80 overflow-auto">
                      <SyntaxHighlighter
                        language={example.language}
                        style={oneDark}
                        customStyle={{
                          margin: 0,
                          padding: '1rem',
                          fontSize: '0.8rem',
                          lineHeight: '1.4',
                        }}
                        showLineNumbers={true}
                        wrapLines={true}
                        wrapLongLines={true}
                      >
                        {example.code}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>

                {/* Security notice */}
                <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5">
                      🔐
                    </div>
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium mb-1">Security Notice</p>
                      <p>
                        The API key is masked with <code>...</code> for security. 
                        Replace <code>{requestData.settings.apiKey.substring(0, 4)}...{requestData.settings.apiKey.substring(requestData.settings.apiKey.length - 4)}</code> with your actual WandB API key from{" "}
                        <a 
                          href="https://wandb.ai/authorize" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium underline hover:no-underline inline-flex items-center"
                        >
                          wandb.ai/authorize
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="flex justify-end pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

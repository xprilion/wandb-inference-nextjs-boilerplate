"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, ExternalLink, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { WandbSettings, getWandbSettings, saveWandbSettings, validateWandbSettings, clearWandbSettings } from "@/lib/settings";

interface SettingsDialogProps {
  onSettingsChange?: (settings: WandbSettings | null) => void;
  trigger?: React.ReactNode;
}

export function SettingsDialog({ onSettingsChange, trigger }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [project, setProject] = useState("");

  const [showApiKey, setShowApiKey] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load settings when dialog opens
  useEffect(() => {
    if (open) {
      const settings = getWandbSettings();
      if (settings) {
        setApiKey(settings.apiKey);
        setProject(settings.project || "");
      }
      setErrors([]);
      setConnectionStatus('idle');
    }
  }, [open]);

  const testConnection = async () => {
    const tempSettings = { apiKey, project: project?.trim() || undefined };
    const validationErrors = validateWandbSettings(tempSettings);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsTestingConnection(true);
    setErrors([]);
    
    try {
      // Test the connection by making a request to our API with the settings
      const response = await fetch('/api/models', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-WandB-API-Key': apiKey,
          ...(project?.trim() ? { 'OpenAI-Project': project.trim() } : {}),
        },
      });

      if (response.ok) {
        setConnectionStatus('success');
      } else {
        const errorData = await response.json();
        setConnectionStatus('error');
        const errorMessages = [errorData.error || 'Failed to connect to WandB API'];
        if (!project?.trim()) {
          errorMessages.push('Tip: Set project as entity_name/project_name to avoid defaulting to personal project');
        }
        setErrors(errorMessages);
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrors([error instanceof Error ? error.message : 'Connection test failed']);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = () => {
    const settings: WandbSettings = { apiKey, project: project?.trim() || undefined };
    const validationErrors = validateWandbSettings(settings);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    saveWandbSettings(settings);
    onSettingsChange?.(settings);
    setOpen(false);
  };

  const handleClear = () => {
    clearWandbSettings();
    setApiKey("");
    setProject("");
    setErrors([]);
    setConnectionStatus('idle');
    onSettingsChange?.(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>WandB Settings</DialogTitle>
          <DialogDescription>
            Configure your WandB credentials to use the playground
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Getting Started:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>
                Get your API key from{" "}
                <a
                  href="https://wandb.ai/authorize"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  wandb.ai/authorize
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>Test the connection and save</li>
            </ol>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">WandB API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your WandB API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* WandB Project (optional) */}
          <div className="space-y-2">
            <Label htmlFor="project">WandB Project (optional)</Label>
            <Input
              id="project"
              type="text"
              placeholder="entity_name/project_name"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Sent as <code>OpenAI-Project</code> header, e.g. <code>my-entity/my-project</code>.
            </p>
          </div>

          {/* Test Connection */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={isTestingConnection || !apiKey}
            >
              {isTestingConnection ? "Testing..." : "Test Connection"}
            </Button>
            
            {connectionStatus === 'success' && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                Connection successful
              </div>
            )}
            
            {connectionStatus === 'error' && (
              <div className="flex items-center text-red-600 text-sm">
                <XCircle className="h-4 w-4 mr-1" />
                Connection failed
              </div>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <ul className="text-sm text-destructive space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleClear}>
              Clear Settings
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={errors.length > 0}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

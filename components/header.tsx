"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SettingsDialog } from "@/components/settings-dialog";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink, Menu, X, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { isWandbConfigured, WandbSettings } from "@/lib/settings";
import Image from "next/image";

interface HeaderProps {
  onSettingsChange?: (settings: WandbSettings | null) => void;
}

export function Header({ onSettingsChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(isWandbConfigured());
  }, []);

  const handleSettingsChange = (settings: WandbSettings | null) => {
    setIsConfigured(settings !== null);
    onSettingsChange?.(settings);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <Image src="/logo.jpg" alt="WandB Logo" width={32} height={32} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold leading-tight">WandB Inference</h1>
            <p className="text-xs text-muted-foreground leading-tight">Next.js Boilerplate</p>
          </div>
          <div className="block sm:hidden">
            <h1 className="text-base font-semibold">WandB</h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://docs.wandb.ai/guides/inference/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Docs</span>
            </a>
          </Button>
          
          <Button variant="ghost" size="sm" asChild>
            <a
              href="https://github.com/wandb/wandb"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          </Button>

          <SettingsDialog 
            onSettingsChange={handleSettingsChange}
            trigger={
              <Button variant="outline" size="sm" className="relative">
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
                {isConfigured ? (
                  <CheckCircle className="h-3 w-3 ml-2 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 ml-2 text-orange-500" />
                )}
              </Button>
            }
          />

          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-2">
          <SettingsDialog 
            onSettingsChange={handleSettingsChange}
            trigger={
              <Button variant="outline" size="sm" className="relative p-2">
                <Settings className="h-4 w-4" />
                {isConfigured ? (
                  <CheckCircle className="h-2 w-2 absolute -top-1 -right-1 text-green-500 bg-background rounded-full" />
                ) : (
                  <AlertCircle className="h-2 w-2 absolute -top-1 -right-1 text-orange-500 bg-background rounded-full" />
                )}
              </Button>
            }
          />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <SettingsDialog 
              onSettingsChange={handleSettingsChange}
              trigger={
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                  {isConfigured ? (
                    <CheckCircle className="h-4 w-4 ml-auto text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 ml-auto text-orange-500" />
                  )}
                </Button>
              }
            />
            
            <Button variant="ghost" size="sm" asChild className="w-full justify-start">
              <a
                href="https://docs.wandb.ai/guides/inference/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <ExternalLink className="h-4 w-4" />
                <span>Documentation</span>
              </a>
            </Button>
            
            <Button variant="ghost" size="sm" asChild className="w-full justify-start">
              <a
                href="https://github.com/wandb/wandb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

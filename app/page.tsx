"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Playground } from "@/components/playground";
import { WandbSettings, getWandbSettings } from "@/lib/settings";

export default function Home() {
  const [userSettings, setUserSettings] = useState<WandbSettings | null>(null);

  useEffect(() => {
    setUserSettings(getWandbSettings());
  }, []);

  const handleSettingsChange = (settings: WandbSettings | null) => {
    setUserSettings(settings);
  };
  return (
    <div className="min-h-screen bg-background">
      <Header onSettingsChange={handleSettingsChange} />
      
      {/* Hero Section - Fixed height to prevent layout shifts */}
      <section className="py-12 lg:py-16 border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              WandB Inference{" "}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Playground
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore cutting-edge AI models with advanced reasoning, code generation, and vision capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Main Playground */}
      <main className="py-8">
        <Playground userSettings={userSettings} onSettingsChange={handleSettingsChange} />
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              Built with{" "}
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground"
              >
                Next.js
              </a>{" "}
              and{" "}
              <a
                href="https://wandb.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-foreground"
              >
                WandB Inference
              </a>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <a
                href="https://docs.wandb.ai/guides/inference/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                Documentation
              </a>
              <a
                href="https://github.com/wandb/wandb"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

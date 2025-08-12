import { Header } from "@/components/header";
import { Playground } from "@/components/playground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              WandB Inference{" "}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Playground
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Explore the power of AI with WandB Inference. Try different models and tasks 
              including advanced reasoning, code generation, and vision capabilities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <CardTitle className="text-lg">Multiple Models</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Access cutting-edge models like DeepSeek R1, Qwen3, GPT OSS, and Llama through WandB Inference
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <CardTitle className="text-lg">Real-time Streaming</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Experience fast, real-time AI responses with streaming capabilities
                  </CardDescription>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🔧</span>
                  </div>
                  <CardTitle className="text-lg">Easy Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Built with Next.js and OpenAI-compatible APIs for seamless integration
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Playground */}
          <Playground />
        </div>
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
                href="https://docs.wandb.ai"
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

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  Workflow,
  Network,
  Monitor,
  FileText,
  Shield,
  Zap,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      <nav className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="ScribeBoard" width={34} height={34} />
            <span className="font-bold text-lg tracking-tight text-white">
              Scribe<span className="text-indigo-400">Board</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#ai-engine" className="hover:text-white transition-colors">AI Engine</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white hover:bg-slate-800/60">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shadow-md shadow-indigo-500/20">
                Launch Workspace <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]" />
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/50 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-md">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>Powered by Groq Llama 3.3 & Excalidraw Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] text-slate-100">
            Turn Technical Ideas Into <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Interactive Whiteboard Diagrams
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The collaborative infinite canvas built for engineers and software architects. Generate microservices architectures, flowcharts, and system designs in seconds using agentic AI.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold h-12 px-8 rounded-xl shadow-lg shadow-indigo-500/25 gap-2">
                Start Creating Free <ChevronRight size={16} />
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-sm h-12 px-7 rounded-xl">
                Explore Capabilities
              </Button>
            </a>
          </div>

          <div className="mt-16 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-2 shadow-2xl backdrop-blur-sm">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400">Prompt Demo</span>
                </div>
                <p className="text-sm sm:text-base font-mono text-indigo-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  &ldquo;Design a distributed event-driven microservices architecture with Kafka, API Gateway, and PostgreSQL&rdquo;
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-400" /> Auto-structured JSON</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-400" /> Direct Excalidraw Elements</span>
                </div>
              </div>

              <div className="w-full md:w-64 p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-800/40 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-indigo-300">
                  <Zap size={14} /> Low Latency Generation
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Groq LPUs process your requirements at blazing speed, converting complex systems into editable canvas shapes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Features & Tools
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Engineered for Modern Engineering Teams
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 hover:border-indigo-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center mb-4">
                <Network size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Architecture Designer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate multi-tier system topologies, cloud infrastructure diagrams, and decoupled microservice maps with connected directional flow.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 hover:border-violet-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-violet-950/80 text-violet-400 flex items-center justify-center mb-4">
                <Workflow size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Workflow & Flowcharts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Map authentication flows, payment checkouts, and logical decision paths with start/end states, diamonds, and labeled decision branches.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 hover:border-pink-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-pink-950/80 text-pink-400 flex items-center justify-center mb-4">
                <Monitor size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Wireframes & Mockups</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Synthesize desktop and mobile interface wireframes, SaaS dashboard mockups, and layout structures directly onto the canvas.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 hover:border-cyan-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-cyan-950/80 text-cyan-400 flex items-center justify-center mb-4">
                <FileText size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">SmartDoc Dual Mode</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Switch seamlessly between infinite drawing canvas and technical documentation markdown editor with AI spec generation.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 hover:border-emerald-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center mb-4">
                <Shield size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Neon Cloud Persistence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Whiteboard elements, zoom levels, viewports, and attachments persist automatically with Neon Serverless Postgres and Drizzle ORM.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 hover:border-amber-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Explain & Brainstorm</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select elements on your canvas and ask AI to explain architecture nuances, detect bottlenecks, or brainstorm next-generation features.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-slate-900 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to design systems at the speed of thought?
          </h2>
          <p className="text-sm text-slate-400 mt-3 max-w-xl mx-auto">
            Experience the full-stack AI whiteboard with custom controls, Groq generation, and infinite collaborative canvas.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 h-12 rounded-xl gap-2 shadow-lg shadow-indigo-500/20">
                Launch ScribeBoard Free <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="logo" width={22} height={22} />
            <span className="font-semibold text-slate-300">ScribeBoard AI</span>
          </div>
          <p>Full-Stack AI Agentic Whiteboard with Next.js, Groq, Neon & Excalidraw.</p>
        </div>
      </footer>
    </div>
  );
}

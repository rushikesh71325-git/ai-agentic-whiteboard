"use client"
import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Wand2 } from 'lucide-react';
import CreateNewBoardDialog from './CreateNewBoardDialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

function WelcomeBanner() {
    const { user } = useUser();
    const [showAiModal, setShowAiModal] = useState(false);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-lg">
            <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium text-white mb-3">
                    <Sparkles size={13} className="text-amber-300" />
                    <span>Agentic AI Infinite Canvas</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome Back, {user?.firstName || "Creator"}!
                </h1>
                <p className="text-xs sm:text-sm text-indigo-100 mt-2 leading-relaxed max-w-xl">
                    Generate system architectures, complex user flows, and wireframes automatically using Groq models on an infinite collaborative canvas.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                    <CreateNewBoardDialog />
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowAiModal(true)}
                        className="bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-md text-xs gap-1.5 cursor-pointer h-9 px-4"
                    >
                        <Wand2 size={14} className="text-amber-300" />
                        Explore AI Prompts
                    </Button>
                </div>
            </div>

            <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <Sparkles size={16} className="text-indigo-600" />
                            AI Whiteboard Prompts
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-2 text-xs">
                        <p className="text-slate-500 mb-3">
                            You can prompt the AI in any board to generate diagrams directly on canvas:
                        </p>
                        {[
                            "Microservices architecture with Next.js, API Gateway, Kafka & Neon",
                            "E-Commerce checkout and Stripe payment flow with fallback",
                            "User authentication flowchart with MFA and session token refresh",
                            "High-fidelity SaaS product landing page wireframe",
                        ].map((prompt, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-mono text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                <span>&ldquo;{prompt}&rdquo;</span>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default WelcomeBanner
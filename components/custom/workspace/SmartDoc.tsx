"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Sparkles,
  Copy,
  Download,
  Check,
  Loader2,
  FileText,
  List,
  Heading,
  Code,
  Bold,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import axios from 'axios'

function SmartDoc() {
  const { projectid } = useParams()
  const [title, setTitle] = useState("Project Architecture & Requirements")
  const [content, setContent] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!projectid) return
    const saved = localStorage.getItem(`smartdoc_${projectid}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setTitle(parsed.title || "Project Architecture & Requirements")
        setContent(parsed.content || "")
      } catch (e) {
        setContent(saved)
      }
    } else {
      setContent(
        `# Architecture & Product Specs\n\n## Overview\nDescribe your application goals, target audience, and key performance indicators here.\n\n## Core Architecture\n- **Client Layer**: Next.js App Router with TypeScript\n- **Database Layer**: Neon Serverless Postgres with Drizzle ORM\n- **AI Pipeline**: Groq Llama 3.3 Engine for real-time synthesis\n\n## User Journey & Flows\n1. User logs in via Clerk authentication.\n2. Navigates to dashboard and launches a new whiteboard.\n3. Uses AI assistant to generate architecture and flow diagrams.\n4. Documents technical specifications in SmartDoc.\n`
      )
    }
  }, [projectid])

  useEffect(() => {
    const handleInsert = (e: any) => {
      if (e.detail?.content) {
        setContent((prev) => prev ? `${prev}\n\n${e.detail.content}` : e.detail.content)
      }
    }
    window.addEventListener("smartdoc:insert-content", handleInsert)
    return () => {
      window.removeEventListener("smartdoc:insert-content", handleInsert)
    }
  }, [])

  useEffect(() => {
    if (!projectid || !content) return
    const timer = setTimeout(() => {
      localStorage.setItem(
        `smartdoc_${projectid}`,
        JSON.stringify({ title, content })
      )
    }, 1500)
    return () => clearTimeout(timer)
  }, [title, content, projectid])

  const handleGenerateAiSpecs = async () => {
    if (!aiPrompt.trim() || loading) return
    setLoading(true)

    try {
      const res = await axios.post("/api/ai", {
        userInput: aiPrompt.trim(),
        action: "smartdoc",
      })

      if (res.data?.response) {
        setContent((prev) => prev + "\n\n" + res.data.response)
        setAiPrompt("")
        toast.add({
          type: "success",
          title: "Documentation Generated",
          description: "AI specs appended to your SmartDoc.",
        })
      }
    } catch (err) {
      console.error(err)
      toast.add({
        type: "error",
        title: "Generation Failed",
        description: "Could not generate AI documentation.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    toast.add({ type: "success", title: "Copied to Clipboard" })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.md`
    link.click()
    URL.revokeObjectURL(url)
    toast.add({ type: "success", title: "Downloaded Markdown File" })
  }

  const insertSnippet = (prefix: string, suffix: string = "") => {
    setContent((prev) => prev + "\n" + prefix + suffix)
  }

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200 dark:border-slate-800">
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base font-semibold border-none shadow-none focus-visible:ring-0 px-0 h-8 max-w-md text-slate-900 dark:text-slate-100"
          />

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 gap-1.5 cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span className="hidden sm:inline">Copy</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="h-8 gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export .md</span>
            </Button>
          </div>
        </div>

        <div className="px-6 py-2 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-900/60 flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 cursor-pointer"
            onClick={() => insertSnippet("### Section Title")}
            title="Heading"
          >
            <Heading size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 cursor-pointer"
            onClick={() => insertSnippet("**Bold Text**")}
            title="Bold"
          >
            <Bold size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 cursor-pointer"
            onClick={() => insertSnippet("- Feature Item")}
            title="List"
          >
            <List size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 cursor-pointer"
            onClick={() => insertSnippet("```ts\nconst data = 1;\n```")}
            title="Code Block"
          >
            <Code size={14} />
          </Button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your markdown documentation, requirements, notes..."
            className="w-full h-full min-h-[500px] resize-none border-none shadow-none focus-visible:ring-0 bg-transparent text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 p-0"
          />
        </div>
      </div>

      <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 flex flex-col p-4 shrink-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white">
            <Sparkles size={14} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              AI SmartDoc Assistant
            </h3>
            <p className="text-[10px] text-slate-500">
              Generate specs & requirements
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="E.g. Generate technical requirements for a real-time collaborative canvas with webhooks..."
            className="min-h-[110px] text-xs resize-none bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />

          <Button
            size="sm"
            onClick={handleGenerateAiSpecs}
            disabled={loading || !aiPrompt.trim()}
            className="w-full h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs cursor-pointer"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Generate Specifications
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Quick Prompts
          </h4>
          <div className="space-y-1.5">
            {[
              "Draft System Architecture Specification",
              "Generate API Endpoint Table & Data Models",
              "Create Sprint User Stories & Acceptance Criteria",
              "Summarize Whiteboard Design Decisions",
            ].map((promptText) => (
              <button
                key={promptText}
                type="button"
                onClick={() => setAiPrompt(promptText)}
                className="w-full text-left p-2 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-colors cursor-pointer border border-transparent hover:border-indigo-200"
              >
                + {promptText}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartDoc
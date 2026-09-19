"use client"

import React, { useState, useRef } from "react"
import {
  Sparkles,
  X,
  PencilRuler,
  Workflow,
  Network,
  Monitor,
  Smartphone,
  ArrowUp,
  Wand2,
  Loader2,
  HelpCircle,
  Lightbulb,
  FileText,
  Copy,
  Check,
  Layers,
  RotateCcw,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import axios from "axios"
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types"

interface AIFloatingSidebarProps {
  onClose?: () => void
  onGenerate?: (tool: string, prompt: string) => void
  excalidrawApi?: ExcalidrawImperativeAPI | null
}

const AiTools = [
  {
    name: "Generate Diagrams",
    desc: "Create visual diagrams",
    icon: PencilRuler,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    activeRing: "ring-blue-500/30 border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/20",
    presets: ["Microservices Blueprint", "Event-Driven AI Pipeline", "Full-Stack SaaS Architecture"],
    prompt: `You are an expert visual diagram generation agent.
Your task is to convert the user's idea into a clear, structured, professional diagram.
Create a clean visual hierarchy. Use rectangles for concepts, diamonds for decisions, arrows for relationships.
Keep labels short and readable. Maintain consistent spacing.`,
  },
  {
    name: "Flowchart",
    desc: "Visualize workflows",
    icon: Workflow,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/20",
    activeRing: "ring-violet-500/30 border-violet-500/50 bg-violet-50/40 dark:bg-violet-950/20",
    presets: ["OAuth2 / JWT Token Refresh", "Multi-Step Checkout & Payment", "Support Ticket Incident Escalation"],
    prompt: `You are an expert flowchart generation agent.
Convert description into a flowchart with start/end nodes, process steps, decision diamonds, and labeled arrows.`,
  },
  {
    name: "Architecture",
    desc: "Design system architecture",
    icon: Network,
    color: "text-orange-600 dark:text-amber-400",
    bgColor: "bg-orange-50 dark:bg-amber-950/20",
    activeRing: "ring-orange-500/30 border-orange-500/50 bg-amber-50/40 dark:bg-amber-950/20",
    presets: ["Next.js + Neon + Clerk + Redis Stack", "Kubernetes Microservices Mesh", "Kafka Event-Driven Architecture"],
    prompt: `You are a senior software architect. Convert the description into a clear system architecture diagram. Group clients, API gateway, microservices, databases, caches, and queues.`,
  },
  {
    name: "Web Mockup",
    desc: "Generate web wireframes",
    icon: Monitor,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/20",
    activeRing: "ring-cyan-500/30 border-cyan-500/50 bg-cyan-50/40 dark:bg-cyan-950/20",
    presets: ["SaaS Analytics Dashboard", "AI Whiteboard Workspace", "E-Commerce Storefront"],
    prompt: `You are an expert UI wireframe designer. Create a desktop web wireframe with header, hero, features grid, call to action, and clean layout cards.`,
  },
  {
    name: "Mobile Mockup",
    desc: "Generate app wireframes",
    icon: Smartphone,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/20",
    activeRing: "ring-pink-500/30 border-pink-500/50 bg-pink-50/40 dark:bg-pink-950/20",
    presets: ["Mobile Auth & 2FA Screen", "Crypto Wallet Portfolio", "Real-Time Chat & Activity Feed"],
    prompt: `You are an expert mobile app designer. Create a phone frame wireframe with status bar, content cards, buttons, and bottom tab bar.`,
  },
]

export default function AIFloatingSidebar({
  onClose,
  onGenerate,
  excalidrawApi,
}: AIFloatingSidebarProps) {
  const [selectedTool, setSelectedTool] = useState("Generate Diagrams")
  const [selectedType, setSelectedType] = useState(AiTools[0])
  const [userInput, setUserInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiTextResult, setAiTextResult] = useState<string | null>(null)
  const [detailLevel, setDetailLevel] = useState<"standard" | "enterprise">("enterprise")
  const [canvasMode, setCanvasMode] = useState<"replace" | "append">("replace")
  const [copiedText, setCopiedText] = useState(false)
  const placeholderIdsRef = useRef<string[]>([])

  const getTargetCanvasPosition = (): { x: number; y: number } => {
    if (!excalidrawApi || canvasMode === "replace") {
      return { x: 80, y: 100 }
    }

    const elements = excalidrawApi
      .getSceneElements()
      .filter((element) => !element.isDeleted && !element.id.startsWith("ai-generation-placeholder"))

    if (elements.length === 0) {
      return { x: 80, y: 100 }
    }

    const maxRight = Math.max(
      ...elements.map((element) => element.x + (element.width || 0))
    )
    const minTop = Math.min(...elements.map((element) => element.y))

    return {
      x: maxRight + 120,
      y: Math.max(50, minTop),
    }
  }

  const addAiPlaceholder = async (position: { x: number; y: number }) => {
    if (!excalidrawApi) return

    try {
      const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw")
      const placeholderElements = convertToExcalidrawElements([
        {
          type: "rectangle",
          id: "ai-generation-placeholder-card",
          x: position.x,
          y: position.y,
          width: 380,
          height: 180,
          backgroundColor: "#f5f3ff",
          strokeColor: "#8b5cf6",
          fillStyle: "solid",
          strokeWidth: 2,
          roughness: 0,
          roundness: { type: 3 },
        },
        {
          type: "text",
          id: "ai-generation-placeholder-t1",
          x: position.x + 24,
          y: position.y + 30,
          text: "Generating with AI...",
          fontSize: 18,
          strokeColor: "#6d28d9",
        },
        {
          type: "text",
          id: "ai-generation-placeholder-t2",
          x: position.x + 24,
          y: position.y + 70,
          text: "Synthesizing diagram & layout...",
          fontSize: 13,
          strokeColor: "#6b7280",
        },
      ])

      placeholderIdsRef.current = placeholderElements.map((el) => el.id)
      const current = excalidrawApi.getSceneElements().filter((el) => !el.id.startsWith("ai-generation-placeholder"))
      excalidrawApi.updateScene({
        elements: [...current, ...placeholderElements],
      })
    } catch (e) {
      console.error(e)
    }
  }

  const removeAiPlaceholder = () => {
    if (!excalidrawApi) return
    try {
      const elements = excalidrawApi
        .getSceneElements()
        .filter((el) => {
          if (el.id.startsWith("ai-generation-placeholder")) return false
          if (placeholderIdsRef.current.includes(el.id)) return false
          const text = (el as any).text || ""
          if (text.includes("Generating with") || text.includes("Synthesizing diagram")) return false
          return true
        })
      excalidrawApi.updateScene({ elements })
      placeholderIdsRef.current = []
    } catch (e) {
      console.error(e)
    }
  }

  const handleClearCanvas = () => {
    if (!excalidrawApi) return
    excalidrawApi.updateScene({ elements: [] })
    toast.add({
      type: "info",
      title: "Canvas Reset",
      description: "Whiteboard cleared.",
    })
  }

  const onClickGenerate = async () => {
    if (!userInput.trim() || loading) return

    const currentAiTool = AiTools.find((tool) => tool.name === selectedTool) || AiTools[0]
    setLoading(true)
    setAiTextResult(null)

    const targetPos = getTargetCanvasPosition()
    await addAiPlaceholder(targetPos)

    try {
      const result = await axios.post("/api/ai", {
        userInput: userInput.trim(),
        type: currentAiTool.name,
        systemPrompt: currentAiTool.prompt,
        detailLevel: detailLevel,
      })

      removeAiPlaceholder()

      if (result.data?.elements && Array.isArray(result.data.elements) && excalidrawApi) {
        const rawElements = result.data.elements

        const nonArrowElements = rawElements.filter((el: any) => el.type !== "arrow")
        const baseElements = nonArrowElements.length > 0 ? nonArrowElements : rawElements

        const minElemX = Math.min(...baseElements.map((el: any) => el.x ?? 0))
        const minElemY = Math.min(...baseElements.map((el: any) => el.y ?? 0))

        const normalizedElements = rawElements.map((el: any) => {
          let currentX = el.x ?? 0
          let currentY = el.y ?? 0
          let points = el.points

          if (el.type === "arrow" && Array.isArray(points) && points.length > 1) {
            const p0x = points[0][0] ?? 0
            const p0y = points[0][1] ?? 0
            if (p0x !== 0 || p0y !== 0) {
              currentX += p0x
              currentY += p0y
              points = points.map((p: any) => [p[0] - p0x, p[1] - p0y])
            }
          }

          const newX = targetPos.x + (currentX - minElemX)
          const newY = targetPos.y + (currentY - minElemY)

          return {
            ...el,
            x: newX,
            y: newY,
            points: points || el.points,
            seed: Math.floor(Math.random() * 1000000),
            version: 1,
            versionNonce: Math.floor(Math.random() * 1000000),
            isDeleted: false,
            fillStyle: el.fillStyle || "solid",
            strokeWidth: el.strokeWidth || 2,
            roughness: el.roughness ?? 0,
            roundness: el.roundness || { type: 3 },
          }
        })

        const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw")
        const converted = convertToExcalidrawElements(normalizedElements)

        const cleanExisting = excalidrawApi.getSceneElements().filter((e) => {
          if (e.isDeleted) return false
          if (e.id.startsWith("ai-generation-placeholder")) return false
          if (placeholderIdsRef.current.includes(e.id)) return false
          const text = (e as any).text || ""
          if (text.includes("Generating with") || text.includes("Synthesizing diagram")) return false
          return true
        })

        const finalSceneElements = canvasMode === "replace" ? converted : [...cleanExisting, ...converted]

        excalidrawApi.updateScene({
          elements: finalSceneElements,
        })

        setTimeout(() => {
          try {
            excalidrawApi.scrollToContent(converted, {
              fitToViewport: true,
              viewportZoomFactor: 0.8,
            })
          } catch (e) {
            console.error(e)
          }
        }, 60)

        if (result.data?.summary) {
          setAiTextResult(result.data.summary)
        }

        toast.add({
          type: "success",
          title: "Detailed Diagram Created",
          description: `${converted.length} elements placed on canvas with architectural specification.`,
        })

        if (onGenerate) {
          onGenerate(selectedTool, userInput)
        }
      } else {
        toast.add({
          type: "error",
          title: "Generation Failed",
          description: "No elements were produced.",
        })
      }
    } catch (error: any) {
      removeAiPlaceholder()
      console.error(error)
      toast.add({
        type: "error",
        title: "AI Generation Error",
        description: error?.response?.data?.error || "Could not generate diagram.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = async (actionType: "explain" | "brainstorm") => {
    if (!excalidrawApi || loading) return

    const currentElements = excalidrawApi.getSceneElements().filter((el) => !el.isDeleted)
    if (currentElements.length === 0 && actionType === "explain") {
      toast.add({
        type: "warning",
        title: "Whiteboard is Empty",
        description: "Add some elements or diagrams to explain first.",
      })
      return
    }

    setLoading(true)
    setAiTextResult(null)

    try {
      const summaryContext = currentElements.map((el) => ({
        type: el.type,
        text: (el as any).text || "",
        x: Math.round(el.x),
        y: Math.round(el.y),
      }))

      const result = await axios.post("/api/ai", {
        userInput: userInput.trim() || (actionType === "explain" ? "Explain current board" : "Brainstorm whiteboard ideas"),
        action: actionType,
        context: summaryContext,
      })

      if (result.data?.response) {
        setAiTextResult(result.data.response)
        toast.add({
          type: "success",
          title: actionType === "explain" ? "Explanation Ready" : "Ideas Generated",
        })
      }
    } catch (error) {
      console.error(error)
      toast.add({
        type: "error",
        title: "Action Failed",
        description: "Unable to complete AI request.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopySummary = async () => {
    if (!aiTextResult) return
    await navigator.clipboard.writeText(aiTextResult)
    setCopiedText(true)
    toast.add({
      type: "success",
      title: "Architecture Summary Copied",
      description: "Copied detailed output to clipboard.",
    })
    setTimeout(() => setCopiedText(false), 2000)
  }

  const handleSendToSmartDoc = () => {
    if (!aiTextResult) return
    window.dispatchEvent(
      new CustomEvent("smartdoc:insert-content", {
        detail: { content: aiTextResult },
      })
    )
    toast.add({
      type: "success",
      title: "Appended to SmartDoc",
      description: "Detailed output transferred to technical documentation.",
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      onClickGenerate()
    }
  }

  const currentToolData = selectedType || AiTools[0]

  return (
    <div
      className="
        fixed bottom-16 right-5 z-50
        w-full max-w-[370px]
        overflow-hidden rounded-2xl
        border border-slate-200/90 dark:border-slate-800
        bg-white/95 dark:bg-slate-900/95
        shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)]
        backdrop-blur-xl transition-all duration-300 max-h-[90vh] flex flex-col
      "
    >
      <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-none">
                AI Whiteboard Assistant
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Groq Llama 3.3 Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto p-4 space-y-3 flex-1">
        <div className="flex items-center gap-2 pb-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px] gap-1 flex-1"
            onClick={() => handleQuickAction("explain")}
            disabled={loading}
          >
            <HelpCircle className="h-3 w-3 text-indigo-500" />
            Explain Board
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px] gap-1 flex-1"
            onClick={() => handleQuickAction("brainstorm")}
            disabled={loading}
          >
            <Lightbulb className="h-3 w-3 text-amber-500" />
            Brainstorm
          </Button>
        </div>

        {aiTextResult && (
          <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 text-xs text-slate-800 dark:text-slate-200 relative shadow-xs">
            <div className="flex items-center justify-between font-semibold mb-1.5 text-indigo-700 dark:text-indigo-300">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Sparkles className="h-3 w-3 text-indigo-500" />
                Detailed Architecture Specification
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  title="Copy breakdown"
                  className="p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-slate-500 hover:text-indigo-700 dark:text-slate-400 dark:hover:text-indigo-300 cursor-pointer"
                >
                  {copiedText ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </button>
                <button
                  type="button"
                  onClick={handleSendToSmartDoc}
                  title="Insert into SmartDoc"
                  className="p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-slate-500 hover:text-indigo-700 dark:text-slate-400 dark:hover:text-indigo-300 cursor-pointer"
                >
                  <FileText className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setAiTextResult(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[10px] ml-1 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed text-[11px] font-normal text-slate-700 dark:text-slate-300 pr-1">
              {aiTextResult}
            </div>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select Generation Mode
            </h3>
            <span className="text-[10px] text-slate-400">
              {AiTools.length} tools
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {AiTools.map((tool, index) => {
              const Icon = tool.icon
              const isSelected = selectedTool === tool.name
              const isLastOdd =
                index === AiTools.length - 1 && AiTools.length % 2 !== 0

              return (
                <button
                  key={tool.name}
                  type="button"
                  onClick={() => {
                    setSelectedTool(tool.name)
                    setSelectedType(tool)
                  }}
                  className={`
                    group relative flex items-center gap-2
                    rounded-xl border p-2 text-left transition-all cursor-pointer
                    ${isLastOdd ? "col-span-2" : "col-span-1"}
                    ${
                      isSelected
                        ? `ring-1 ${tool.activeRing} shadow-sm`
                        : "border-slate-200/60 bg-slate-50/50 hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-800/30"
                    }
                  `}
                >
                  {isSelected && (
                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  )}

                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tool.bgColor} ${tool.color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-none">
                      {tool.name}
                    </p>
                    <p className="truncate text-[9px] text-slate-400 mt-0.5">
                      {tool.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Layers className="h-3 w-3 text-indigo-500" /> Output Depth
            </span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
              <button
                type="button"
                onClick={() => setDetailLevel("standard")}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  detailLevel === "standard"
                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setDetailLevel("enterprise")}
                className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                  detailLevel === "enterprise"
                    ? "bg-indigo-600 text-white shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Deep / Detailed
              </button>
            </div>
          </div>

          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <RotateCcw className="h-3 w-3 text-indigo-500" /> Canvas Mode
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setCanvasMode("replace")}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                    canvasMode === "replace"
                      ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs font-semibold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => setCanvasMode("append")}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                    canvasMode === "append"
                      ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs font-semibold"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Append
                </button>
              </div>
              <button
                type="button"
                onClick={handleClearCanvas}
                title="Clear whiteboard canvas"
                className="flex items-center gap-1 text-[10px] text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100/60 px-1.5 py-0.5 rounded-md transition cursor-pointer"
              >
                <Trash2 className="h-2.5 w-2.5" /> Clear
              </button>
            </div>
          </div>

          <div className="mb-2 flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
            {currentToolData.presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setUserInput(preset)}
                className="
                  whitespace-nowrap rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5
                  text-[9px] font-medium text-slate-600 transition-colors cursor-pointer
                  hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600
                  dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300
                "
              >
                + {preset}
              </button>
            ))}
          </div>

          <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus-within:border-indigo-500/50 focus-within:bg-white focus-within:ring-1 focus-within:ring-indigo-500/20">
            <Textarea
              value={userInput}
              onChange={(event) => setUserInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your diagram, architecture, or workflow..."
              className="
                min-h-[90px] resize-none border-0 bg-transparent
                px-3 py-2 text-xs text-slate-800 dark:text-slate-100
                placeholder:text-slate-400 shadow-none focus-visible:ring-0
              "
            />

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-2.5 py-1.5">
              <div className="flex items-center gap-1 text-[9px] text-slate-400">
                <Wand2 className="h-2.5 w-2.5 text-indigo-500" />
                <span>Groq Powered</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">
                {userInput.length}/500
              </span>
            </div>
          </div>

          <Button
            size="sm"
            onClick={onClickGenerate}
            disabled={loading || !userInput.trim()}
            className="
              mt-2.5 h-8 w-full gap-1.5 rounded-lg
              bg-indigo-600 text-xs font-medium text-white
              shadow-sm hover:bg-indigo-700 active:scale-[0.99]
              disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer
            "
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Generate Elements
            <ArrowUp size={14} className="ml-auto" />
          </Button>
        </div>
      </div>
    </div>
  )
}
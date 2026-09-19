"use client"
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { useState, useRef, useEffect, useCallback } from 'react';
import "./whiteboard.css"
const Excalidraw = dynamic(
    async () => (await import("@excalidraw/excalidraw")).Excalidraw,
    { ssr: false }
);

import axios from 'axios';
import { useParams } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import {
    MousePointer2,
    Hand,
    Square,
    Diamond,
    Circle,
    ArrowRight,
    Minus,
    Pencil,
    Type,
    Eraser,
    Sparkles,
    CheckCircle2,
    Loader2
} from "lucide-react";
import FloatingProperties from "./FloatingProperties";
import { Button } from "@/components/ui/button"
import AIFloatingSidebar from "./AIFloatingSidebar";

const tools = [
    { name: "selection", icon: MousePointer2, color: "text-blue-600" },
    { name: "hand", icon: Hand, color: "text-cyan-600" },
    { name: "rectangle", icon: Square, color: "text-blue-600" },
    { name: "diamond", icon: Diamond, color: "text-blue-600" },
    { name: "ellipse", icon: Circle, color: "text-blue-600" },
    { name: "arrow", icon: ArrowRight, color: "text-blue-600" },
    { name: "line", icon: Minus, color: "text-blue-600" },
    { name: "draw", icon: Pencil, color: "text-blue-600" },
    { name: "text", icon: Type, color: "text-blue-600" },
    { name: "eraser", icon: Eraser, color: "text-red-600" },
]

function Whiteboard() {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const saveTimerRef = useRef<any>(null);
    const { projectid } = useParams();
    const [activeTool, setActiveTool] = useState("selection");
    const [selectedElement, setSelectedElement] = useState<any>(null);
    const [canvasState, setCanvasState] = useState<any>(null);
    const [showAISidebar, setShowAISidebar] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
    const initialLoadDone = useRef(false);

    const loadWhiteboardData = useCallback(async (api: ExcalidrawImperativeAPI) => {
        if (!projectid || initialLoadDone.current) return;
        try {
            const res = await axios.get(`/api/whiteboard?projectId=${projectid}`);
            if (res.data?.elements && Array.isArray(res.data.elements) && res.data.elements.length > 0) {
                const loadedAppState = res.data.appState ? { ...res.data.appState } : {};
                delete loadedAppState.collaborators;
                api.updateScene({
                    elements: res.data.elements,
                    appState: {
                        ...loadedAppState,
                        collaborators: new Map(),
                    },
                });
                if (res.data.files && Object.keys(res.data.files).length > 0) {
                    api.addFiles(Object.values(res.data.files));
                }
            }
            initialLoadDone.current = true;
        } catch (err) {
            console.error("Failed to load whiteboard data:", err);
        }
    }, [projectid]);

    useEffect(() => {
        if (excalidrawAPI) {
            loadWhiteboardData(excalidrawAPI);
        }
    }, [excalidrawAPI, loadWhiteboardData]);

    const savecanvasChanges = async (elements: readonly any[], appState: any, files: any, showToast = false) => {
        if (!projectid) return;
        setSaveStatus("saving");
        const { collaborators, ...serializableAppState } = appState || {};
        try {
            await axios.post("/api/whiteboard", {
                projectId: projectid,
                elements: elements,
                appState: serializableAppState,
                files: files
            });
            setSaveStatus("saved");
            if (showToast) {
                toast.add({ type: "success", title: "Whiteboard Saved" });
            }
        } catch (err) {
            console.error(err);
            setSaveStatus("unsaved");
            if (showToast) {
                toast.add({ type: "error", title: "Save failed" });
            }
        }
    }

    const handleCanvasChange = (elements: readonly any[], appState: any, files: any) => {
        setCanvasState(appState);
        const selectedIds = Object.keys(appState.selectedElementIds || {});
        if (selectedIds?.length === 1) {
            const element = elements.find((element) => element.id === selectedIds[0]);
            if (element) {
                setSelectedElement(element);
            }
        } else {
            setSelectedElement(null);
        }

        if (initialLoadDone.current) {
            setSaveStatus("unsaved");
            if (saveTimerRef?.current) {
                clearTimeout(saveTimerRef.current);
            }
            saveTimerRef.current = setTimeout(() => {
                savecanvasChanges(elements, appState, files, false);
            }, 3000);
        }
    }

    useEffect(() => {
        const handleManualSave = () => {
            if (excalidrawAPI) {
                const elements = excalidrawAPI.getSceneElements();
                const appState = excalidrawAPI.getAppState();
                const files = excalidrawAPI.getFiles();
                savecanvasChanges(elements, appState, files, true);
            }
        };

        window.addEventListener("whiteboard:save-request", handleManualSave);
        return () => {
            window.removeEventListener("whiteboard:save-request", handleManualSave);
        };
    }, [excalidrawAPI, projectid]);

    const changeTool = (tool: any) => {
        if (!excalidrawAPI) return;
        setActiveTool(tool);
        const excalType = tool === "draw" ? "freedraw" : tool;
        excalidrawAPI.setActiveTool({
            type: excalType
        });
    }

    const getFloatingPosition = () => {
        if (!selectedElement || !canvasState)
            return { left: 0, top: 0 };

        const zoom = canvasState.zoom?.value ?? 1;
        const scrollX = canvasState.scrollX ?? 0;
        const scrollY = canvasState.scrollY ?? 0;
        const centerX = selectedElement.x + (selectedElement.width || 0) / 2;
        const screenX = (centerX + scrollX) * zoom;
        const screenY = (selectedElement.y + scrollY) * zoom;

        return {
            left: screenX,
            top: screenY - 60
        };
    }

    const floatingPosition = getFloatingPosition();

    const handlePropertyChange = (property: string, value: any) => {
        if (!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();
        const updatedElements = elements.map((element) => {
            if (element.id !== selectedElement.id) {
                return element;
            }

            return {
                ...element,
                [property]: value,
                version: element.version + 1,
                updated: Date.now(),
            };
        });

        excalidrawAPI.updateScene({
            elements: updatedElements,
        });

        const currentUpdated = updatedElements.find((el) => el.id === selectedElement.id);
        if (currentUpdated) {
            setSelectedElement(currentUpdated);
        }
    };

    const handleDeleteElement = () => {
        if (!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();
        const updatedElements = elements.map((element) => {
            if (element.id === selectedElement.id) {
                return {
                    ...element,
                    isDeleted: true,
                    version: element.version + 1,
                    updated: Date.now(),
                };
            }
            return element;
        });

        excalidrawAPI.updateScene({
            elements: updatedElements,
        });

        setSelectedElement(null);
    };

    const handleOnDuplicate = () => {
        if (!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();
        const duplicateElement = {
            ...selectedElement,
            id: crypto.randomUUID(),
            x: selectedElement.x + 24,
            y: selectedElement.y + 24,
            seed: Math.floor(Math.random() * 1000000),
            version: 1,
            updated: Date.now(),
            isDeleted: false,
        };

        excalidrawAPI.updateScene({
            elements: [...elements, duplicateElement],
        });
    };

    const handleLockElement = () => {
        if (!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();
        const updatedElements = elements.map((element) => {
            if (element.id !== selectedElement.id) {
                return element;
            }

            return {
                ...element,
                locked: !element.locked,
                version: element.version + 1,
                updated: Date.now(),
            };
        });

        excalidrawAPI.updateScene({
            elements: updatedElements,
        });

        const updatedSelectedElement = updatedElements.find(
            (element) => element.id === selectedElement.id
        );

        if (updatedSelectedElement) {
            setSelectedElement(updatedSelectedElement);
        }
    };

    const handleBringFrontBack = (type: "front" | "back") => {
        if (!excalidrawAPI || !selectedElement) return;

        const elements = excalidrawAPI.getSceneElements();
        const selected = elements.find((element) => element.id === selectedElement.id);
        if (!selected) return;

        const remainingElements = elements.filter(
            (element) => element.id !== selectedElement.id
        );

        const updatedSelected = {
            ...selected,
            version: selected.version + 1,
            updated: Date.now(),
        };

        if (type === "front") {
            excalidrawAPI.updateScene({
                elements: [...remainingElements, updatedSelected],
            });
        } else {
            excalidrawAPI.updateScene({
                elements: [updatedSelected, ...remainingElements],
            });
        }
    };

    return (
        <div className="relative h-full w-full">
            <div className="h-full w-full">
                <Excalidraw
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                    onChange={handleCanvasChange}
                    initialData={{
                        appState: {
                            collaborators: new Map(),
                        },
                    }}
                />
            </div>

            <div className="absolute top-1/2 left-4 z-50 -translate-y-1/2 flex flex-col gap-1 rounded-2xl bg-white/95 dark:bg-slate-900/95 border shadow-xl p-1.5 backdrop-blur-md">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <button
                            key={tool.name}
                            type="button"
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-primary/10 cursor-pointer ${
                                activeTool === tool.name ? "bg-primary/15 shadow-xs" : ""
                            }`}
                            onClick={() => changeTool(tool.name)}
                            title={tool.name}
                        >
                            <Icon className={tool.color} size={17} />
                        </button>
                    );
                })}
            </div>

            <FloatingProperties
                selectedElement={selectedElement}
                position={floatingPosition}
                onPropertyChange={handlePropertyChange}
                onDelete={() => handleDeleteElement()}
                onDuplicate={() => handleOnDuplicate()}
                onBringToFront={() => handleBringFrontBack("front")}
                onSendToBack={() => handleBringFrontBack("back")}
                onLock={handleLockElement}
            />

            <div className="absolute bottom-4 left-4 z-40 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border text-[11px] text-slate-600 dark:text-slate-300 shadow-sm pointer-events-none">
                {saveStatus === "saving" ? (
                    <>
                        <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
                        <span>Saving...</span>
                    </>
                ) : saveStatus === "saved" ? (
                    <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span>Saved</span>
                    </>
                ) : (
                    <>
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>Unsaved</span>
                    </>
                )}
            </div>

            <div className="absolute bottom-4 right-14 z-50">
                <Button
                    size="lg"
                    onClick={() => setShowAISidebar(!showAISidebar)}
                    className="shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full px-5 gap-2 cursor-pointer transition-transform hover:scale-105"
                >
                    <Sparkles className="h-4 w-4" /> AI Assistant
                </Button>
            </div>

            {showAISidebar && (
                <AIFloatingSidebar
                    excalidrawApi={excalidrawAPI}
                    onClose={() => setShowAISidebar(false)}
                />
            )}
        </div>
    );
}

export default Whiteboard;
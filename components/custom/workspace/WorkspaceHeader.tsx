"use client";
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Save, Share, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import axios from 'axios'

type Props = {
    selectedTab: (value: "whiteboard" | "smartdoc") => void;
    activeTab?: "whiteboard" | "smartdoc";
}

function WorkspaceHeader({ selectedTab, activeTab = "whiteboard" }: Props) {
    const { projectid } = useParams();
    const [projectName, setProjectName] = useState("Workspace");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!projectid) return;
        const fetchProjectDetails = async () => {
            try {
                const res = await axios.get(`/api/projects?projectId=${projectid}`);
                if (res.data?.projectName) {
                    setProjectName(res.data.projectName);
                }
            } catch (e) {
                console.error("Could not fetch project details:", e);
            }
        };
        fetchProjectDetails();
    }, [projectid]);

    const handleSave = () => {
        setIsSaving(true);
        window.dispatchEvent(new CustomEvent("whiteboard:save-request"));
        setTimeout(() => {
            setIsSaving(false);
        }, 600);
    };

    const handleShare = async () => {
        try {
            if (typeof window !== "undefined") {
                await navigator.clipboard.writeText(window.location.href);
                toast.add({
                    type: "success",
                    title: "Link Copied",
                    description: "Shareable workspace URL copied to clipboard.",
                });
            }
        } catch (err) {
            console.error(err);
            toast.add({
                type: "error",
                title: "Copy Failed",
                description: "Could not copy URL to clipboard.",
            });
        }
    };

    return (
        <div className="px-4 py-2.5 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between relative z-40">
            <div className="flex gap-3 items-center">
                <Link
                    href="/dashboard"
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                    title="Back to Dashboard"
                >
                    <ArrowLeft size={18} />
                </Link>
                <div className="flex gap-2 items-center">
                    <Image src="/logo.svg" alt="logo" width={30} height={30} />
                    <h2 className="text-sm font-semibold max-w-[200px] sm:max-w-xs truncate text-slate-900 dark:text-slate-100">
                        {projectName}
                    </h2>
                </div>
            </div>

            <div>
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => selectedTab(value as "whiteboard" | "smartdoc")}
                >
                    <TabsList className="bg-slate-100 dark:bg-slate-800 h-9">
                        <TabsTrigger value="whiteboard" className="text-xs px-3">Whiteboard</TabsTrigger>
                        <TabsTrigger value="smartdoc" className="text-xs px-3">SmartDoc</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex gap-2 items-center">
                <Button
                    size="sm"
                    variant="default"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-8 gap-1.5 cursor-pointer bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span className="hidden sm:inline">Save</span>
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShare}
                    className="h-8 gap-1.5 cursor-pointer"
                >
                    <Share size={14} />
                    <span className="hidden sm:inline">Share</span>
                </Button>
            </div>
        </div>
    );
}

export default WorkspaceHeader;
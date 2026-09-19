"use client"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import { SidebarGroupLabel, SidebarMenuButton } from "@/components/ui/sidebar"
import { LayoutGrid, Sparkles, Folder, Wand2, Plus } from "lucide-react"
import { usePathname } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { UserButton, useUser } from "@clerk/nextjs"
import CreateNewBoardDialog from "./CreateNewBoardDialog"
import { useContext, useEffect, useState } from "react"
import { UserDetailContext } from "@/context/UserDetailContext"
import axios from "axios"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ProjectItem {
    id: number;
    projectId: string;
    projectName: string;
}

export function AppSidebar() {
    const path = usePathname();
    const { user } = useUser();
    const { userDetail } = useContext(UserDetailContext) || {};
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [aiModalOpen, setAiModalOpen] = useState(false);

    useEffect(() => {
        const fetchUserProjects = async () => {
            try {
                const res = await axios.get("/api/projects");
                if (Array.isArray(res.data)) {
                    setProjects(res.data);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchUserProjects();
    }, []);

    const maxFreeBoards = 10;
    const boardCount = projects.length;
    const progressValue = Math.min(100, Math.round((boardCount / maxFreeBoards) * 100));

    return (
        <Sidebar className="border-r border-slate-200 dark:border-slate-800">
            <SidebarHeader className="p-4 border-b border-slate-100 dark:border-slate-800/80">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                    <div>
                        <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">
                            ScribeBoard
                        </h1>
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                            AI Whiteboard
                        </span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="p-3">
                <SidebarGroup>
                    <CreateNewBoardDialog />
                </SidebarGroup>

                <SidebarGroup className="mt-2">
                    <SidebarGroupLabel className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                        Navigation
                    </SidebarGroupLabel>
                    <Link href="/dashboard">
                        <SidebarMenuButton className="p-2.5 mt-1 cursor-pointer" isActive={path === "/dashboard"}>
                            <LayoutGrid size={15} />
                            <span className="text-xs font-medium">All Boards</span>
                        </SidebarMenuButton>
                    </Link>

                    <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
                        <DialogTrigger asChild>
                            <SidebarMenuButton className="p-2.5 mt-1 cursor-pointer" isActive={false}>
                                <Sparkles size={15} className="text-indigo-500" />
                                <span className="text-xs font-medium">AI Diagram Guide</span>
                            </SidebarMenuButton>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-base font-bold flex items-center gap-2">
                                    <Wand2 size={16} className="text-indigo-600" />
                                    AI Whiteboard Generators
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 py-2 text-xs">
                                <p className="text-slate-500">
                                    Inside any whiteboard workspace, click the floating <strong>AI Assistant</strong> button to generate:
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                        <div className="font-semibold text-indigo-600 dark:text-indigo-400">Flowcharts & Workflows</div>
                                        <div className="text-[11px] text-slate-500">Authentication, checkout steps, onboarding flows with decision logic.</div>
                                    </div>
                                    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                        <div className="font-semibold text-indigo-600 dark:text-indigo-400">System Architecture</div>
                                        <div className="text-[11px] text-slate-500">Microservices, database topologies, cloud infrastructures & API gateways.</div>
                                    </div>
                                    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                        <div className="font-semibold text-indigo-600 dark:text-indigo-400">UI Wireframes</div>
                                        <div className="text-[11px] text-slate-500">Desktop SaaS landing wireframes and mobile screen layouts.</div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </SidebarGroup>

                {projects.length > 0 && (
                    <SidebarGroup className="mt-2">
                        <SidebarGroupLabel className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                            Recent Boards
                        </SidebarGroupLabel>
                        <div className="space-y-0.5 mt-1 max-h-52 overflow-y-auto no-scrollbar">
                            {projects.slice(0, 6).map((proj) => (
                                <Link
                                    key={proj.projectId}
                                    href={`/workspace/${proj.projectId}`}
                                    className="block"
                                >
                                    <SidebarMenuButton
                                        className="p-2 cursor-pointer h-8 text-xs"
                                        isActive={path === `/workspace/${proj.projectId}`}
                                    >
                                        <Folder size={13} className="text-slate-400 shrink-0" />
                                        <span className="truncate text-[11px]">{proj.projectName}</span>
                                    </SidebarMenuButton>
                                </Link>
                            ))}
                        </div>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-300 font-medium mb-1.5">
                        <span>{boardCount} of {maxFreeBoards} boards</span>
                        <span className="text-[10px] text-slate-400">{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} className="h-1.5" />
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                        <span>AI Engine: Groq Llama 3.1</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {userDetail?.user?.credits ?? 3} Credits
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/60">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <UserButton />
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-none">
                                {user?.fullName || "User"}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {user?.primaryEmailAddress?.emailAddress}
                            </p>
                        </div>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}

"use client"

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface Props {
    onBoardCreated?: () => void;
}

function CreateNewBoardDialog({ onBoardCreated }: Props) {
    const [workspaceName, setWorkspaceName] = useState("");
    const [loading, setLoading] = useState(false);
    const [dialog, setDialog] = useState(false);
    const router = useRouter();

    const handleCreateBoard = async () => {
        if (workspaceName.trim() === "" || workspaceName.length > 50) {
            toast.add({
                type: 'error',
                title: 'Invalid Workspace Name',
                description: 'Please enter a valid workspace name (1-50 characters)'
            })
            return;
        }

        setLoading(true);
        try {
            const projectId = crypto.randomUUID();
            await axios.post("/api/projects", {
                projectName: workspaceName.trim(),
                projectId: projectId,
            });

            toast.add({
                type: 'success',
                title: 'New Workspace Created',
            });

            setDialog(false);
            setWorkspaceName("");
            if (onBoardCreated) {
                onBoardCreated();
            }
            router.push(`/workspace/${projectId}`);
        } catch (error) {
            console.error(error);
            toast.add({
                type: 'error',
                title: 'Creation Failed',
                description: 'Could not create workspace. Please check database configuration.'
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={dialog} onOpenChange={setDialog}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm">
                    <Plus size={16} /> Create New Board
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-base font-bold">New Whiteboard Workspace</DialogTitle>
                </DialogHeader>
                <div className="py-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Workspace Name
                    </label>
                    <Input
                        placeholder="e.g. E-Commerce Microservices Architecture"
                        className="mt-1.5 text-xs"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleCreateBoard();
                            }
                        }}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" size="sm">Cancel</Button>
                    </DialogClose>
                    <Button
                        size="sm"
                        disabled={workspaceName.trim() === "" || loading}
                        onClick={handleCreateBoard}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer gap-1.5"
                    >
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        Create Workspace
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateNewBoardDialog
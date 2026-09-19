"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Folder, Search, MoreVertical, Trash2, Edit3, ExternalLink, Calendar, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import CreateNewBoardDialog from './CreateNewBoardDialog'
import axios from 'axios'
import { toast } from '@/components/ui/toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Project {
  id: number;
  projectId: string;
  projectName: string;
  userEmail: string;
  createdAt: string;
}

function ProjectList() {
  const [projectList, setProjectList] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [newProjectName, setNewProjectName] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.get("/api/projects")
      if (Array.isArray(res.data)) {
        setProjectList(res.data)
      }
    } catch (err) {
      console.error("Failed to load projects:", err)
      toast.add({
        type: "error",
        title: "Could not load boards",
        description: "Failed to connect to database.",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleRename = async () => {
    if (!selectedProject || !newProjectName.trim()) return
    setActionLoading(true)
    try {
      await axios.patch("/api/projects", {
        projectId: selectedProject.projectId,
        projectName: newProjectName.trim(),
      })
      toast.add({ type: "success", title: "Board Renamed" })
      setRenameDialogOpen(false)
      fetchProjects()
    } catch (err) {
      console.error(err)
      toast.add({ type: "error", title: "Failed to rename board" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProject) return
    setActionLoading(true)
    try {
      await axios.delete(`/api/projects?projectId=${selectedProject.projectId}`)
      toast.add({ type: "success", title: "Board Deleted" })
      setDeleteDialogOpen(false)
      fetchProjects()
    } catch (err) {
      console.error(err)
      toast.add({ type: "error", title: "Failed to delete board" })
    } finally {
      setActionLoading(false)
    }
  }

  const filteredProjects = projectList.filter((p) =>
    p.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Recent Whiteboards
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage, organize, and open your agentic workspaces
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search boards..."
              className="pl-9 h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>
          <CreateNewBoardDialog onBoardCreated={fetchProjects} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
              <div className="h-8 bg-slate-100 dark:bg-slate-800/60 rounded" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50 mt-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 mb-4">
            <Folder size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {searchQuery ? "No matching boards found" : "No Boards Created Yet"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
            {searchQuery
              ? `No whiteboards match "${searchQuery}". Try a different search term.`
              : "Launch your infinite canvas with AI diagram and architecture generators."}
          </p>
          <CreateNewBoardDialog onBoardCreated={fetchProjects} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.projectId}
              className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/workspace/${project.projectId}`}
                    className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 flex-1"
                  >
                    {project.projectName}
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedProject(project)
                          setNewProjectName(project.projectName)
                          setRenameDialogOpen(true)
                        }}
                        className="gap-2 cursor-pointer text-xs"
                      >
                        <Edit3 size={14} /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedProject(project)
                          setDeleteDialogOpen(true)
                        }}
                        className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer text-xs"
                      >
                        <Trash2 size={14} /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                  <Calendar size={12} />
                  <span>
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently created"}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  Canvas
                </span>
                <Link
                  href={`/workspace/${project.projectId}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Open Board <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Rename Whiteboard</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter new board name"
              className="text-sm"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={actionLoading || !newProjectName.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {actionLoading && <Loader2 size={14} className="animate-spin mr-1.5" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600">
              Delete Whiteboard
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-500">
            Are you sure you want to delete &ldquo;{selectedProject?.projectName}&rdquo;? This will permanently remove all whiteboard shapes, canvas data, and smart docs.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 size={14} className="animate-spin mr-1.5" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectList
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'

function AppHeader() {
  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="cursor-pointer text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100" />
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Dashboard / Overview
        </span>
      </div>

      <div className="flex items-center gap-3">
        <UserButton />
      </div>
    </header>
  )
}

export default AppHeader
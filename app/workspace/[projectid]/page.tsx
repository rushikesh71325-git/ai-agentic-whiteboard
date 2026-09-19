"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import WorkspaceHeader from '@/components/custom/workspace/WorkspaceHeader';
import SmartDoc from '@/components/custom/workspace/SmartDoc';

const Whiteboard = dynamic(
  () => import('@/components/custom/workspace/Whiteboard'),
  { ssr: false }
);

type TabType = "whiteboard" | "smartdoc";

export default function Workspace() {
  const [activeTab, setActiveTab] = useState<TabType>("whiteboard");

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <WorkspaceHeader
        selectedTab={(value: TabType) => setActiveTab(value)}
        activeTab={activeTab}
      />

      <main className="flex-1 w-full relative overflow-hidden">
        <div className={`h-full w-full ${activeTab === "whiteboard" ? "block" : "hidden"}`}>
          <Whiteboard />
        </div>
        <div className={`h-full w-full ${activeTab === "smartdoc" ? "block" : "hidden"}`}>
          <SmartDoc />
        </div>
      </main>
    </div>
  );
}
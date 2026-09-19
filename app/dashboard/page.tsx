import { UserButton } from '@clerk/nextjs'
import React from 'react'
import WelcomeBanner from '@/components/custom/dashboard/WelcomeBanner'
import ProjectList from '@/components/custom/dashboard/ProjectList'
function DashboardPage() {
  return (
    <div>
      <WelcomeBanner/>
      <ProjectList/>
      
    </div>
  )
}

export default DashboardPage
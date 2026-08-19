"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useLocale } from "next-intl"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageBackground } from "@/components/page-background"
import { AIFunction } from "@/components/operate"
import { Sidebar, SidebarTab } from "@/components/sidebar"
import { ProjectsList } from "@/components/projects-list"

function CreatePageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<SidebarTab>('create')

  // 从 URL 获取项目 ID 和版本 ID（用于恢复未完成的生成任务）
  const projectId = searchParams.get('projectId')
  const versionId = searchParams.get('versionId')

  // 根据 URL 路径同步 activeTab
  useEffect(() => {
    if (pathname?.endsWith('/projects')) {
      setActiveTab('projects')
    } else {
      setActiveTab('create')
    }
  }, [pathname])

  // 如果有 projectId，自动切换到创建界面
  useEffect(() => {
    if (projectId) {
      setActiveTab('create')
    }
  }, [projectId])

  const handleTabChange = (tab: SidebarTab) => {
    setActiveTab(tab)
    if (tab === 'projects') {
      router.replace(`/${locale}/projects`, { scroll: false })
    } else {
      router.replace(`/${locale}/create`, { scroll: false })
    }
  }

  return (
    <PageBackground>
      <Navbar />
      <main className="relative z-10 min-h-screen flex overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        {/* 侧边栏 */}
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'create' ? (
            // 创建视频界面
            <div className="flex-1 flex items-center justify-center py-20 md:py-20 pt-20 overflow-y-auto">
              <div className="container mx-auto px-4 py-8 md:py-16">
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="w-full max-w-full">
                    {/* 传递 projectId 和 versionId 给 AIFunction 用于恢复指定版本的项目 */}
                    <AIFunction resumeProjectId={projectId} resumeVersionId={versionId} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // 项目列表界面
            <ProjectsList onCreateClick={() => setActiveTab('create')} />
          )}
        </div>
      </main>
      {/* 桌面端显示 Footer，移动端隐藏 */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </PageBackground>
  )
}

// 用 Suspense 包裹以支持 useSearchParams
export default function CreatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CreatePageContent />
    </Suspense>
  )
}

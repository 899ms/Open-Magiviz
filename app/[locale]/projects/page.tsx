"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useLocale } from "next-intl"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageBackground } from "@/components/page-background"
import { AIFunction } from "@/components/operate"
import { Sidebar, SidebarTab } from "@/components/sidebar"
import { ProjectsList } from "@/components/projects-list"
import { SignInDialog } from "@/components/auth/signin-dialog"
import { Loader2 } from "lucide-react"

export default function ProjectsPage() {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState<SidebarTab>('projects')
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  // 根据 URL 路径同步 activeTab
  useEffect(() => {
    if (pathname?.endsWith('/projects')) {
      setActiveTab('projects')
    } else if (pathname?.endsWith('/library')) {
      setActiveTab('library')
    } else {
      setActiveTab('create')
    }
  }, [pathname])

  // 检查登录状态，未登录时显示登录弹窗
  useEffect(() => {
    if (status === 'unauthenticated') {
      setShowLoginDialog(true)
    } else {
      setShowLoginDialog(false)
    }
  }, [status])

  // 当 activeTab 改变时，更新 URL（但不触发页面跳转）
  const handleTabChange = (tab: SidebarTab) => {
    setActiveTab(tab)
    const routes: Record<SidebarTab, string> = {
      create: `/${locale}/create`,
      projects: `/${locale}/projects`,
      library: `/${locale}/library`,
    }
    router.replace(routes[tab], { scroll: false })
  }

  // 渲染对应内容
  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <div className="flex-1 flex items-center justify-center py-20 md:py-20 pt-20 overflow-y-auto">
            <div className="container mx-auto px-4 py-8 md:py-16">
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-full max-w-full">
                  <AIFunction />
                </div>
              </div>
            </div>
          </div>
        )
      case 'library':
      case 'projects':
      default:
        return <ProjectsList onCreateClick={() => handleTabChange('create')} />
    }
  }

  // 加载状态
  if (status === 'loading') {
    return (
      <PageBackground>
        <Navbar />
        <main className="relative z-10 min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </PageBackground>
    )
  }

  return (
    <PageBackground>
      <Navbar />
      <main className="relative z-10 min-h-screen flex overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        {/* 侧边栏 */}
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

        {/* 主内容区域 */}
        {renderContent()}
      </main>
      {/* 桌面端显示 Footer，移动端隐藏 */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* 登录弹窗 */}
      <SignInDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </PageBackground>
  )
}

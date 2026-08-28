"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageBackground } from "@/components/page-background"
import { Sidebar } from "@/components/sidebar"
import { ProjectsList } from "@/components/projects-list"
import { SignInDialog } from "@/components/auth/signin-dialog"
import { Loader2 } from "lucide-react"

export default function ProjectsPage() {
  const { status } = useSession()
  const router = useRouter()
  const locale = useLocale()
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  // 检查登录状态，未登录时显示登录弹窗
  useEffect(() => {
    if (status === 'unauthenticated') {
      setShowLoginDialog(true)
    } else {
      setShowLoginDialog(false)
    }
  }, [status])

  const handleCreateClick = () => {
    router.push(`/${locale}/create`)
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
        {/* Sidebar 自动根据 URL 高亮当前 tab */}
        <Sidebar />

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ProjectsList onCreateClick={handleCreateClick} />
        </div>
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

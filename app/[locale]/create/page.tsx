"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useLocale } from "next-intl"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageBackground } from "@/components/page-background"
import { AIFunction } from "@/components/operate"
import { Sidebar } from "@/components/sidebar"
import { SignInDialog } from "@/components/auth/signin-dialog"
import { Loader2 } from "lucide-react"

function CreatePageContent() {
  const { status } = useSession()
  const searchParams = useSearchParams()
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  // 从 URL 获取项目 ID 和版本 ID（用于恢复未完成的生成任务）
  const projectId = searchParams.get('projectId')
  const versionId = searchParams.get('versionId')

  // 检查登录状态，未登录时显示登录弹窗
  useEffect(() => {
    if (status === 'unauthenticated') {
      setShowLoginDialog(true)
    } else {
      setShowLoginDialog(false)
    }
  }, [status])

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

        {/* 主内容区域 - 仅渲染创建界面 */}
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

// 用 Suspense 包裹以支持 useSearchParams
export default function CreatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CreatePageContent />
    </Suspense>
  )
}

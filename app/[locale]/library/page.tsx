"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageBackground } from "@/components/page-background"
import { Sidebar } from "@/components/sidebar"
import { UnifiedLibraryPage } from "@/components/library/unified-library-page"
import { SignInDialog } from "@/components/auth/signin-dialog"
import { Loader2 } from "lucide-react"

export default function LibraryPage() {
  const { status } = useSession()
  const [showLoginDialog, setShowLoginDialog] = useState(false)

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
        {/* Sidebar 自动根据 URL 高亮当前 tab（无需传 activeTab/onTabChange） */}
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <UnifiedLibraryPage />
        </div>
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* 登录弹窗 */}
      <SignInDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </PageBackground>
  )
}

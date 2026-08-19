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
import { UnifiedLibraryPage } from "@/components/library/unified-library-page"
import { SignInDialog } from "@/components/auth/signin-dialog"
import { Loader2 } from "lucide-react"

export default function LibraryPage() {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState<SidebarTab>('library')
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  useEffect(() => {
    if (pathname?.includes('/library')) {
      setActiveTab('library')
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

  const handleTabChange = (tab: SidebarTab) => {
    setActiveTab(tab)
    const routes: Record<SidebarTab, string> = {
      create: `/${locale}/create`,
      projects: `/${locale}/projects`,
      library: `/${locale}/library`,
    }
    router.replace(routes[tab], { scroll: false })
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
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'library' && <UnifiedLibraryPage />}
          {activeTab === 'create' && (
            <div className="flex-1 flex items-center justify-center py-20 md:py-20 pt-20 overflow-y-auto">
              <div className="container mx-auto px-4 py-8 md:py-16">
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="w-full max-w-full">
                    <AIFunction />
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'projects' && <ProjectsList onCreateClick={() => handleTabChange('create')} />}
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

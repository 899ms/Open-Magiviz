"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"
import { useParams } from "next/navigation"

export function PricingPageContent() {
  const params = useParams()
  const locale = params.locale as string
  const isZh = locale === 'zh'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* 价格部分 */}
        <PricingSection />

        {/* FAQ 部分 */}
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}

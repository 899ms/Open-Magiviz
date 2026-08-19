"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle2, Loader2, Sparkles } from "lucide-react"

export function NewsletterSignup() {
  const t = useTranslations("hero.newsletter")
  const locale = useLocale()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error")
      setMessage(t("error"))
      return
    }

    setStatus("loading")

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, locale }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || t("successMessage"))
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || data.message || t("errorNetwork"))
      }
    } catch {
      setStatus("error")
      setMessage(t("errorNetwork"))
    }
  }

  return (
    <div className="mt-16 transition-all duration-1000 delay-1200 opacity-100 translate-y-0">
      <div className="max-w-lg mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t("title")}</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            {t("description")}
          </p>
        </div>

        {status === "success" ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-green-500 font-medium text-lg">{t("success")}</p>
            <p className="text-green-600/80 text-sm mt-2">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                <Input
                  type="email"
                  placeholder={t("placeholder")}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status === "error") setStatus("idle")
                  }}
                  className="h-14 pl-12 pr-4 bg-background/80 border-primary/20 focus:border-primary/50 rounded-xl text-base"
                  disabled={status === "loading"}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-primary/25 rounded-xl font-medium"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t("button")}
                  </>
                )}
              </Button>
            </div>

            {status === "error" && message && (
              <p className="text-red-500 text-sm mt-3 text-center">{message}</p>
            )}
          </form>
        )}

        {/* 隐私提示 */}
        <p className="text-xs text-muted-foreground/60 text-center mt-4">
          {t("privacy")}
        </p>
      </div>
    </div>
  )
}

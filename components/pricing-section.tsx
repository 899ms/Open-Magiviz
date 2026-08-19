"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Stars, CheckCircle2 } from "lucide-react"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { StripeCheckoutButton } from "./stripe-checkout-button"
import { SUBSCRIPTION_PRICE_IDS } from "@/lib/stripe"
import { useTranslations } from "next-intl"

export function PricingSection() {
  const { data: session } = useSession()
  const t = useTranslations("pricing")
  const [hasTrialSubscription, setHasTrialSubscription] = useState(false)
  const [hasActiveProSubscription, setHasActiveProSubscription] = useState(false)
  const [hasActiveAnnualSubscription, setHasActiveAnnualSubscription] = useState(false)
  const [currentSubscriptionPlan, setCurrentSubscriptionPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/user/subscription")
        if (response.ok) {
          const data = await response.json()
          setHasTrialSubscription(data.hasTrialSubscription || false)
          setCurrentSubscriptionPlan(data.subscriptionPlan || null)

          const now = new Date()
          const isActivePro =
            data.subscriptionStatus === "active" &&
            data.subscriptionPlan === "pro" &&
            data.subscriptionCurrentPeriodEnd &&
            new Date(data.subscriptionCurrentPeriodEnd) > now

          setHasActiveProSubscription(isActivePro || false)

          const isActiveAnnual =
            data.subscriptionStatus === "active" &&
            data.subscriptionPlan === "annual" &&
            data.subscriptionCurrentPeriodEnd &&
            new Date(data.subscriptionCurrentPeriodEnd) > now

          setHasActiveAnnualSubscription(isActiveAnnual || false)
        }
      } catch (error) {
        console.error("获取订阅状态失败:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionStatus()
  }, [session])

  const plans = [
    {
      name: t("trial.name"),
      price: t("trial.price"),
      period: t("trial.period"),
      description: t("trial.description"),
      features: [
        t("trial.features.period"),
        t("trial.features.points"),
        t("trial.features.upload_size"),
        t("trial.features.storage"),
        t("trial.features.license"),
      ],
      cta: t("trial.cta"),
      offer: t("trial.offer"),
      featured: false,
      priceId: SUBSCRIPTION_PRICE_IDS.trial,
      planType: "trial",
    },
    {
      name: t("annual.name"),
      price: t("annual.price"),
      period: t("annual.period"),
      originalPrice: t("annual.originalPrice"),
      savings: t("annual.savings"),
      description: t("annual.description"),
      features: [
        t("annual.features.period"),
        t("annual.features.points"),
        t("annual.features.upload_size"),
        t("annual.features.storage"),
        t("annual.features.license"),
      ],
      cta: t("annual.cta"),
      offer: t("annual.offer"),
      featured: true,
      badge: t("annual.badge"),
      priceId: SUBSCRIPTION_PRICE_IDS.annual,
      planType: "annual",
    },
    {
      name: t("pro.name"),
      price: t("pro.price"),
      period: t("pro.period"),
      originalPrice: t("pro.originalPrice"),
      savings: t("pro.savings"),
      description: t("pro.description"),
      features: [
        t("pro.features.period"),
        t("pro.features.points"),
        t("pro.features.upload_size"),
        t("pro.features.storage"),
        t("pro.features.license"),
      ],
      cta: t("pro.cta"),
      offer: t("pro.offer"),
      featured: false,
      priceId: SUBSCRIPTION_PRICE_IDS.pro,
      planType: "pro",
    },
  ]

  return (
    <section className="py-24 bg-background" id="pricing">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-headline text-4xl font-black tracking-tight text-foreground"
          >
            {t("heading")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            {t("subheading")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-card rounded-xl p-8 flex flex-col border shadow-sm transition-all duration-300 relative ${
                plan.featured
                  ? "border-primary shadow-2xl scale-105 z-10"
                  : "border-border hover:shadow-md"
              }`}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase font-headline whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <div className="mb-8">
                <h3 className="font-headline text-xl font-bold mb-2">{plan.name}</h3>
                <div className="space-y-1">
                  {plan.originalPrice && plan.originalPrice !== "" && (
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-0.5 bg-red-500/10 text-red-500 text-xs font-bold rounded">
                        {plan.savings}
                      </span>
                      <span className="text-muted-foreground/50 text-sm line-through">
                        {plan.originalPrice}{plan.period}
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`font-black text-foreground ${
                        plan.featured ? "text-5xl" : "text-4xl"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm font-bold">
                      {plan.period}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                <li
                  className={`flex items-center gap-3 text-xs font-bold px-3 py-2 rounded-lg ${
                    plan.featured
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Stars className="w-4 h-4 shrink-0" />
                  <span>{plan.offer}</span>
                </li>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="text-primary w-5 h-5 shrink-0" />
                    <span
                      className={
                        plan.featured && feature.includes("day") || plan.featured && feature.includes("天")
                          ? "font-semibold"
                          : ""
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.planType === "trial" &&
              (hasTrialSubscription ||
                hasActiveProSubscription ||
                hasActiveAnnualSubscription) ? (
                hasActiveProSubscription ? (
                  <Button className="w-full" variant="outline" disabled>
                    {t("trial.not_available_for_pro")}
                  </Button>
                ) : hasActiveAnnualSubscription ? (
                  <Button className="w-full" variant="outline" disabled>
                    {t("trial.not_available_for_annual")}
                  </Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    {t("trial.trial_only_once")}
                  </Button>
                )
              ) : plan.planType === "pro" && hasActiveProSubscription ? (
                <StripeCheckoutButton
                  priceId={plan.priceId}
                  planType={plan.planType}
                  className={`w-full py-3 rounded-lg font-headline font-bold transition-all border border-primary text-primary hover:bg-[#C98860] hover:text-white`}
                  variant="outline"
                >
                  {t("pro.renew")}
                </StripeCheckoutButton>
              ) : plan.planType === "pro" && hasActiveAnnualSubscription ? (
                <Button className="w-full" variant="outline" disabled>
                  {t("annual.cannot_downgrade")}
                </Button>
              ) : plan.planType === "annual" && hasActiveAnnualSubscription ? (
                <StripeCheckoutButton
                  priceId={plan.priceId}
                  planType={plan.planType}
                  className={`w-full py-3 rounded-lg font-headline font-bold transition-all bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-[1.02]`}
                  variant="default"
                >
                  {t("annual.renew")}
                </StripeCheckoutButton>
              ) : (
                <StripeCheckoutButton
                  priceId={plan.priceId}
                  planType={plan.planType}
                  className={`w-full py-3 rounded-lg font-headline font-bold transition-all ${
                    plan.featured
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-[1.02]"
                      : "border border-primary text-primary hover:bg-[#C98860] hover:text-white"
                  }`}
                  variant={plan.featured ? "default" : "outline"}
                >
                  {plan.planType === "pro" && currentSubscriptionPlan === "trial"
                    ? t("upgrade_to_pro")
                    : plan.planType === "annual" &&
                      (currentSubscriptionPlan === "trial" ||
                        currentSubscriptionPlan === "pro")
                      ? t("annual.upgrade")
                      : plan.cta}
                </StripeCheckoutButton>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { useTranslations } from "next-intl"
import { Shield, LayoutDashboard, UserPlus, CreditCard, Coins, Lock, TrendingUp } from "lucide-react"

export function FeaturesSection() {
  const t = useTranslations("features")

  const features = [
    {
      icon: Shield,
      title: t("adminCenter.title"),
      description: t("adminCenter.description"),
      image: "/images/admin-demo.png",
    },
    {
      icon: LayoutDashboard,
      title: t("userDashboard.title"),
      description: t("userDashboard.description"),
      image: "/images/profile-demo.png",
    },
    {
      icon: TrendingUp,
      title: t("affiliateSystem.title"),
      description: t("affiliateSystem.description"),
      image: "/images/affiliate-demo.png",
    },
    {
      icon: UserPlus,
      title: t("referralSystem.title"),
      description: t("referralSystem.description"),
      image: "/images/referral-demo.png",
    },
    {
      icon: CreditCard,
      title: t("subscriptionPlans.title"),
      description: t("subscriptionPlans.description"),
      image: "/images/subscription-demo.png",
    },
    {
      icon: Coins,
      title: t("creditsPurchase.title"),
      description: t("creditsPurchase.description"),
      image: "/images/Credits-demo.png",
    },
    {
      icon: Lock,
      title: t("authSystem.title"),
      description: t("authSystem.description"),
      image: "/images/auth-demo.png",
    },
  ]

  return (
    <section id="features" className="relative py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
        </div>

        <div className="max-w-7xl mx-auto space-y-24">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            const isEven = index % 2 === 0

            return (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                  !isEven ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* 图片区域 */}
                <div
                  className={`relative ${!isEven ? "lg:col-start-2" : ""}`}
                >
                  <div className="relative rounded-2xl overflow-hidden cyber-glow-subtle bg-secondary/50 border border-primary/50 backdrop-blur-sm">
                    {/* 装饰性背景 */}
                    <div className="absolute inset-0 bg-secondary/20" />

                    {/* 主要内容区域 */}
                    <div className="relative p-8 min-h-[400px] flex items-center justify-center">
                      {/* 3D效果容器 */}
                      <div className="relative transform transition-all duration-700 hover:scale-105 w-full max-w-md">
                        {/* 主图片 */}
                        <div className="relative rounded-xl overflow-hidden shadow-xl aspect-[4/3] bg-secondary flex items-center justify-center">
                          <img
                            src={feature.image || "/placeholder.svg"}
                            alt={feature.title}
                            className="w-full h-full object-cover transition-opacity duration-500"
                          />

                          {/* 覆盖层效果 */}
                          <div className="absolute inset-0 bg-background/20" />

                          {/* 中央图标展示 */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg cyber-glow">
                              <IconComponent className="w-10 h-10 text-primary-foreground" />
                            </div>
                          </div>
                        </div>

                        {/* 浮动标签 */}
                        <div className="absolute -top-4 -right-4 bg-secondary/90 backdrop-blur-sm rounded-lg p-3 cyber-glow-subtle border border-primary/50">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                            <span className="text-xs font-medium text-foreground">
                              {t("liveGeneration")}
                            </span>
                          </div>
                        </div>

                        {/* 底部信息卡片 */}
                        <div className="absolute -bottom-4 -left-4 bg-secondary/90 backdrop-blur-sm rounded-lg p-4 cyber-glow-subtle border border-primary/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center cyber-glow">
                              <IconComponent className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-foreground">{feature.title}</div>
                              <div className="text-xs text-muted-foreground">SaaS Template</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 文字介绍区域 */}
                <div className={`${!isEven ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                  <div className="space-y-6">
                    {/* 图标和标题 */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center cyber-glow">
                        <IconComponent className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                        {feature.title}
                      </h3>
                    </div>

                    {/* 描述 */}
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>

                    {/* 功能编号 */}
                    <div className="flex items-center gap-2 pt-4">
                      <span className="text-sm font-medium text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

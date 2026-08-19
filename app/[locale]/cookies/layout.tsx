import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

const locales = ['en', 'zh']

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  if (!locales.includes(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'metadata.cookies' })
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: locale === 'zh'
      ? 'Cookie政策,网站Cookie,用户体验,数据收集,网站优化,网站分析,视频创作平台'
      : 'Cookie Policy,Website Cookies,User Experience,Data Collection,Website Optimization,Website Analytics,Video Creation Platform',
  }
}

export default async function CookieLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!locales.includes(locale)) {
    notFound()
  }

  return children
} 
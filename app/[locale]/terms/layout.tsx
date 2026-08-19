import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

interface TermsLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  // 验证 locale 是否有效
  const locales = ['en', 'zh']
  if (!locales.includes(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'metadata.terms' })
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: locale === 'zh'
      ? '服务条款,使用协议,用户协议,视频创作平台服务条款,平台使用规则,许可协议'
      : 'Terms of Service,User Agreement,Service Agreement,Video Creation Platform Service Terms,Platform Usage Rules,License Agreement',
  }
}

export default async function TermsLayout({ children, params }: TermsLayoutProps) {
  const { locale } = await params
  // 验证 locale 是否有效
  const locales = ['en', 'zh']
  if (!locales.includes(locale)) {
    notFound()
  }

  return children
} 
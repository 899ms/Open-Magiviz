import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

const locales = ['en', 'zh']

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  
  if (!locales.includes(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'metadata.privacy' })
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: locale === 'zh'
      ? '隐私政策,数据保护,个人信息,用户数据安全,隐私权,数据安全,视频创作隐私'
      : 'Privacy Policy,Data Protection,Personal Information,User Data Security,Privacy Rights,Data Security,Video Creation Privacy',
  }
}

export default async function PrivacyLayout({
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
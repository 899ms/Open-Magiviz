"use client"

import { ReactNode } from 'react'

interface PageBackgroundProps {
  children: ReactNode
  className?: string
}

export function PageBackground({ children, className = "" }: PageBackgroundProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* 主背景 - 自适应背景色 */}
      <div className="absolute inset-0 bg-background" />

      {/* 次级背景层 - 装饰 */}
      <div className="absolute inset-0 bg-secondary/20" />

      {/* 大型装饰圆形 - 主色发光效果 */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse delay-1000 cyber-glow-subtle" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-2000" />
      <div className="absolute bottom-10 right-1/3 w-64 h-64 bg-primary/12 rounded-full blur-3xl animate-pulse delay-3000 cyber-glow-subtle" />

      {/* 中型装饰圆形 */}
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-primary/20 rounded-full blur-2xl animate-pulse delay-1500" />
      <div className="absolute top-3/4 left-1/6 w-32 h-32 bg-secondary/25 rounded-full blur-xl animate-pulse delay-2500" />
      
      {/* 内容区域 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

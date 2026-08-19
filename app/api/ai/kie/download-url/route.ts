import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/ai/kie/download-url
 * 
 * 将 Kie.ai 生成的图片 URL 转换为可下载的临时 URL
 * 转换后的 URL 有效期为 20 分钟
 * 
 * Body:
 * {
 *   url: string  // Kie.ai 生成的图片 URL
 * }
 */

const KIE_API_URL = "https://api.kie.ai/api/v1/common/download-url"
const KIE_API_KEY = process.env.KIE_API_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    if (!KIE_API_KEY) {
      return NextResponse.json({ error: "KIE_API_KEY is not configured" }, { status: 500 })
    }

    // 调用 Kie.ai 下载 URL 接口
    const response = await fetch(KIE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    })

    const data = await response.json()

    if (data.code !== 200) {
      console.error('Kie.ai download URL error:', data)
      return NextResponse.json({ 
        error: data.msg || "Failed to get download URL",
        code: data.code 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      downloadUrl: data.data,
      expiresIn: 20 * 60 // 20 分钟
    })

  } catch (error) {
    console.error("Kie.ai Download URL Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


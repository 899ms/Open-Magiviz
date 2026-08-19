import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { userAssets } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"

// 存储空间限制定义（字节）
const STORAGE_LIMITS: Record<string, number> = {
  free: 1 * 1024 * 1024 * 1024,
  trial: 50 * 1024 * 1024 * 1024,
  pro: 100 * 1024 * 1024 * 1024,
  annual: -1,
}

// GET: 获取用户存储空间信息
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 获取用户订阅计划
    const userPlan = (session.user as any).subscriptionPlan || "free"
    const storageLimit = STORAGE_LIMITS[userPlan] ?? STORAGE_LIMITS.free

    // 计算当前已用存储空间
    // Neon 返回格式: { rows: [{ total: "12345" }] }，数字是字符串形式
    const usageResult = await db.execute(
      sql`SELECT COALESCE(SUM(${userAssets.fileSize}), 0) as total FROM ${userAssets} WHERE ${userAssets.userId} = ${session.user.id}`
    )

    let usedStorage = 0
    if (usageResult && typeof usageResult === 'object') {
      const rows = (usageResult as any).rows
      if (Array.isArray(rows) && rows.length > 0) {
        const total = rows[0].total
        usedStorage = typeof total === 'string' ? parseInt(total, 10) : Number(total)
      }
    }

    return NextResponse.json({
      usedStorage,
      storageLimit,
      availableStorage: storageLimit > 0 ? storageLimit - usedStorage : -1,
      plan: userPlan,
    })
  } catch (err) {
    console.error("Get storage info error:", err)
    return NextResponse.json({ error: "Failed to get storage info" }, { status: 500 })
  }
}

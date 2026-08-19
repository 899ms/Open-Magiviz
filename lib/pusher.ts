import Pusher from 'pusher'

/**
 * Pusher Server-side Configuration
 * 
 * 环境变量要求：
 * - PUSHER_APP_ID: Pusher 应用 ID
 * - PUSHER_KEY: Pusher Key (Public Key)
 * - PUSHER_SECRET: Pusher Secret (Secret Key)
 * - PUSHER_CLUSTER: Pusher 集群名称
 */

// 检查必要环境变量
const requiredEnvVars = ['PUSHER_APP_ID', 'PUSHER_KEY', 'PUSHER_SECRET', 'PUSHER_CLUSTER']
const missingEnvVars = requiredEnvVars.filter(env => !process.env[env])

if (missingEnvVars.length > 0) {
  console.warn(`[Pusher] 警告: 缺少环境变量: ${missingEnvVars.join(', ')}`)
  console.warn('[Pusher] Pusher 功能将不可用')
}

/**
 * 服务端 Pusher 实例
 * 用于在后端触发事件，推送到前端
 */
export const pusherServer = process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET && process.env.PUSHER_CLUSTER
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true
    })
  : null

/**
 * 推送任务状态到前端
 * 
 * @param taskId - 任务 ID (来自 Kie.ai)
 * @param status - 状态: 'success' | 'fail' | 'pending'
 * @param data - 附加数据
 */
export async function notifyTaskStatus(params: {
  taskId: string
  status: 'success' | 'fail' | 'pending'
  data?: Record<string, any>
}): Promise<boolean> {
  const { taskId, status, data } = params

  if (!pusherServer) {
    console.error('[Pusher] 未配置 Pusher，无法推送任务状态')
    return false
  }

  try {
    const channel = `task-${taskId}`
    const event = 'status'

    const payload = {
      taskId,
      status,
      data: data || {},
      timestamp: new Date().toISOString()
    }

    console.log(`[Pusher] 推送事件到 ${channel}:`, { status, taskId })

    await pusherServer.trigger(channel, event, payload)

    console.log(`[Pusher] ✅ 推送成功: ${channel}/${event}`)
    return true

  } catch (error) {
    console.error('[Pusher] ❌ 推送失败:', error)
    return false
  }
}

/**
 * 推送图片生成成功事件
 *
 * @param taskId - Kie.ai 返回的任务 ID
 * @param resultData - 生成结果数据
 */
export async function notifyImageSuccess(params: {
  taskId: string
  imageUrl: string
  resultUrls?: string[]
  characterId?: string
  sceneId?: string
  projectId?: string
  versionId?: string
  version?: number
  versionGroupId?: string
  frameType?: 'first' | 'last' // 首尾帧模式专用
}): Promise<boolean> {
  const { taskId, imageUrl, resultUrls, characterId, sceneId, projectId, versionId, version, versionGroupId, frameType } = params

  return notifyTaskStatus({
    taskId,
    status: 'success',
    data: {
      type: 'image',
      imageUrl,
      resultUrls: resultUrls || [imageUrl],
      characterId,
      sceneId,
      projectId,
      versionId,
      version,
      versionGroupId,
      ...(frameType && { frameType }), // 首尾帧模式专用
    }
  })
}

/**
 * 推送分镜图生成成功事件
 */
export async function notifyStoryboardSuccess(params: {
  taskId: string
  imageUrl: string
  resultUrls?: string[]
  sceneIndex?: number
  aspectRatio?: string
}): Promise<boolean> {
  const { taskId, imageUrl, resultUrls, sceneIndex, aspectRatio } = params

  return notifyTaskStatus({
    taskId,
    status: 'success',
    data: {
      type: 'storyboard',
      imageUrl,
      resultUrls: resultUrls || [imageUrl],
      sceneIndex,
      aspectRatio
    }
  })
}

/**
 * 推送视频生成成功事件
 */
export async function notifyVideoSuccess(params: {
  taskId: string
  videoUrl: string
  resultUrls?: string[]
  originUrls?: string[]
  resolution?: string
  duration?: string
  sceneIndex?: number
  projectId?: string
  versionId?: string
  version?: number
  versionGroupId?: string
}): Promise<boolean> {
  const { taskId, videoUrl, resultUrls, originUrls, resolution, duration, sceneIndex, projectId, versionId, version, versionGroupId } = params

  return notifyTaskStatus({
    taskId,
    status: 'success',
    data: {
      type: 'video',
      videoUrl,
      resultUrls: resultUrls || [videoUrl],
      originUrls,
      resolution,
      duration,
      sceneIndex,
      projectId,
      versionId,
      version,
      versionGroupId,
    }
  })
}

/**
 * 推送最终视频合成成功事件
 */
export async function notifyComposeSuccess(params: {
  taskId: string
  videoUrl: string
  thumbnailUrl?: string
  duration?: number
  aspectRatio?: string
  fileSize?: string
  projectId?: string
  versionId?: string
  version?: number
  versionGroupId?: string
}): Promise<boolean> {
  const { taskId, videoUrl, thumbnailUrl, duration, aspectRatio, fileSize, projectId, versionId, version, versionGroupId } = params

  return notifyTaskStatus({
    taskId,
    status: 'success',
    data: {
      type: 'compose',
      videoUrl,
      thumbnailUrl,
      duration,
      aspectRatio,
      fileSize,
      projectId,
      versionId,
      version,
      versionGroupId,
    }
  })
}

/**
 * 推送任务失败事件
 */
export async function notifyTaskFail(params: {
  taskId: string
  error: string
  errorCode?: string
}): Promise<boolean> {
  const { taskId, error, errorCode } = params

  return notifyTaskStatus({
    taskId,
    status: 'fail',
    data: {
      error,
      errorCode
    }
  })
}

/**
 * 推送进度更新事件 (可选，用于长时间任务)
 */
export async function notifyTaskProgress(params: {
  taskId: string
  progress: number
  message?: string
}): Promise<boolean> {
  const { taskId, progress, message } = params

  return notifyTaskStatus({
    taskId,
    status: 'pending',
    data: {
      progress,
      message
    }
  })
}


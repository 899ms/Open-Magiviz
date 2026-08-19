/**
 * Seedance 2.0 / Seedance 2.0 Fast / Seedance 2.0 Mini 多模态参考约束
 * Seedance 2.0 Mini 文档: https://docs.kie.ai/cn/market/bytedance/seedance-2-mini
 *
 * reference_video_urls:
 *   - 数量: <= 3
 *   - 格式: mp4, mov
 *   - 单个时长: [2, 15] s
 *   - 所有视频总时长: <= 15 s
 *   - 宽高比 (W/H): [0.4, 2.5]
 *   - 宽 / 高 (px): [300, 6000]
 *   - 总像素 (W*H): [409600, 927408]
 *   - 大小: <= 50 MB
 *   - 帧率 (FPS): [24, 60]
 *
 * reference_audio_urls:
 *   - 数量: <= 3
 *   - 格式: wav, mp3
 *   - 单个时长: [2, 15] s
 *   - 所有音频总时长: <= 15 s
 *   - 大小: <= 15 MB
 */

export type MediaValidationCode =
  | "format"
  | "count"
  | "duration_single"
  | "duration_total"
  | "ratio"
  | "dimension"
  | "pixels"
  | "size"
  | "fps"
  | "unsupported"

export interface MediaValidationError {
  code: MediaValidationCode
  message: string
}

export interface MediaMeta {
  duration: number // seconds
  width?: number
  height?: number
  fps?: number
}

export const SEEDANCE_LIMITS = {
  video: {
    maxCount: 3,
    maxSizeBytes: 50 * 1024 * 1024,
    maxTotalDuration: 15,
    minDuration: 2,
    maxDuration: 15,
    minRatio: 0.4,
    maxRatio: 2.5,
    minDimension: 300,
    maxDimension: 6000,
    minPixels: 640 * 640, // 409600
    maxPixels: 834 * 1112, // 927408
    minFps: 24,
    maxFps: 60,
    allowedExt: ["mp4", "mov"],
  },
  audio: {
    maxCount: 3,
    maxSizeBytes: 15 * 1024 * 1024,
    maxTotalDuration: 15,
    minDuration: 2,
    maxDuration: 15,
    allowedExt: ["wav", "mp3"],
  },
} as const

function getExt(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/)
  return m ? m[1] : ""
}

export function validateVideoMeta(meta: MediaMeta): MediaValidationError | null {
  const L = SEEDANCE_LIMITS.video
  if (meta.duration < L.minDuration || meta.duration > L.maxDuration) {
    return {
      code: "duration_single",
      message: `duration must be in [${L.minDuration},${L.maxDuration}]s (got ${meta.duration.toFixed(1)}s)`,
    }
  }
  if (meta.width && meta.height) {
    const ratio = meta.width / meta.height
    if (ratio < L.minRatio || ratio > L.maxRatio) {
      return {
        code: "ratio",
        message: `aspect ratio (W/H) must be in [${L.minRatio},${L.maxRatio}] (got ${ratio.toFixed(2)})`,
      }
    }
    if (
      meta.width < L.minDimension ||
      meta.width > L.maxDimension ||
      meta.height < L.minDimension ||
      meta.height > L.maxDimension
    ) {
      return {
        code: "dimension",
        message: `width/height must be in [${L.minDimension},${L.maxDimension}]px (got ${meta.width}x${meta.height})`,
      }
    }
    const pixels = meta.width * meta.height
    if (pixels < L.minPixels || pixels > L.maxPixels) {
      return {
        code: "pixels",
        message: `total pixels must be in [${L.minPixels},${L.maxPixels}] (got ${pixels})`,
      }
    }
  }
  if (meta.fps !== undefined && (meta.fps < L.minFps || meta.fps > L.maxFps)) {
    return {
      code: "fps",
      message: `FPS must be in [${L.minFps},${L.maxFps}] (got ${meta.fps})`,
    }
  }
  return null
}

export function validateAudioMeta(meta: MediaMeta): MediaValidationError | null {
  const L = SEEDANCE_LIMITS.audio
  if (meta.duration < L.minDuration || meta.duration > L.maxDuration) {
    return {
      code: "duration_single",
      message: `duration must be in [${L.minDuration},${L.maxDuration}]s (got ${meta.duration.toFixed(1)}s)`,
    }
  }
  return null
}

export function validateFileFormat(
  file: File,
  type: "video" | "audio",
): MediaValidationError | null {
  const L = type === "video" ? SEEDANCE_LIMITS.video : SEEDANCE_LIMITS.audio
  const ext = getExt(file.name) || (file.type.split("/")[1] || "")
  const allowed = L.allowedExt as readonly string[]
  if (!allowed.includes(ext)) {
    return { code: "format", message: `format must be ${allowed.join("/")}, got .${ext}` }
  }
  if (file.size > L.maxSizeBytes) {
    return {
      code: "size",
      message: `size exceeds ${L.maxSizeBytes / 1024 / 1024}MB (got ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
    }
  }
  return null
}

/**
 * 探测媒体元数据，接受 URL（远程或 ObjectURL）。
 */
export function probeMediaUrl(
  src: string,
  type: "video" | "audio",
): Promise<MediaMeta> {
  return new Promise((resolve, reject) => {
    const el = type === "video" ? document.createElement("video") : document.createElement("audio")
    el.preload = "metadata"
    if (type === "video") (el as HTMLVideoElement).muted = true
    el.src = src
    const cleanup = () => {
      try {
        el.removeAttribute("src")
        el.load()
      } catch {}
    }
    el.onloadedmetadata = () => {
      const meta: MediaMeta = { duration: (el as any).duration || 0 }
      if (type === "video") {
        const v = el as HTMLVideoElement
        meta.width = v.videoWidth
        meta.height = v.videoHeight
        const webkitFps =
          // @ts-expect-error 非标准属性
          typeof v.webkitDecodedFrameCount === "number" && v.duration
            ? // @ts-expect-error 非标准属性
              v.webkitDecodedFrameCount / v.duration
            : undefined
        const quality = (v as any).getVideoPlaybackQuality?.()
        const fps =
          typeof webkitFps === "number" && isFinite(webkitFps) && webkitFps > 0
            ? webkitFps
            : quality && v.duration
            ? quality.totalVideoFrames / v.duration
            : undefined
        if (fps && isFinite(fps)) {
          meta.fps = Number(fps.toFixed(2))
        }
      }
      cleanup()
      resolve(meta)
    }
    el.onerror = () => {
      cleanup()
      reject(new Error(`failed to load ${type} metadata`))
    }
  })
}
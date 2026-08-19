"use client"

import { useState, useCallback } from "react"

// 用户素材类型
export interface UserAsset {
  id: string
  name: string
  type: "image" | "audio" | "video" | "file"
  url: string
  thumbnailUrl?: string
  fileSize?: number
  mimeType?: string
  createdAt: string
}

// 分页类型
export interface UserAssetPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// API 响应类型
interface UserAssetResponse {
  success: boolean
  error?: string
  data: {
    items: UserAsset[]
    pagination: UserAssetPagination
  }
}

// Hook 返回类型
interface UseUserAssetsReturn {
  assets: UserAsset[]
  loading: boolean
  uploading: boolean
  error: string | null
  pagination: UserAssetPagination | null
  uploadAsset: (file: File, name?: string, tags?: string[]) => Promise<UserAsset | null>
  updateAsset: (id: string, data: { name?: string; tags?: string[] }) => Promise<boolean>
  deleteAsset: (id: string) => Promise<boolean>
  loadAssets: (page?: number, type?: string, search?: string, append?: boolean) => Promise<void>
  refreshAssets: () => Promise<void>
}

// 用户素材库 Hook
export function useUserAssets(): UseUserAssetsReturn {
  const [assets, setAssets] = useState<UserAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<UserAssetPagination | null>(null)

  const loadAssets = useCallback(async (
    page: number = 1,
    type: string = "all",
    search: string = "",
    append: boolean = false
  ) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "30" })
      if (type !== "all") params.append("type", type)
      if (search) params.append("search", search)

      const response = await fetch(`/api/library/upload?${params}`)
      const data: UserAssetResponse = await response.json()

      if (!response.ok) throw new Error(data.error || "加载素材失败")

      setAssets(prev => append ? [...prev, ...data.data.items] : data.data.items)
      setPagination(data.data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载素材失败")
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadAsset = useCallback(async (
    file: File,
    name?: string,
    tags?: string[]
  ): Promise<UserAsset | null> => {
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (name) formData.append("name", name)
      if (tags && tags.length > 0) formData.append("tags", JSON.stringify(tags))

      const response = await fetch("/api/library/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || "上传失败")

      const newAsset: UserAsset = data.data
      setAssets(prev => [newAsset, ...prev])
      setPagination(prev => prev ? {
        ...prev,
        total: prev.total + 1,
        totalPages: Math.ceil((prev.total + 1) / prev.limit),
      } : null)

      return newAsset
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败")
      return null
    } finally {
      setUploading(false)
    }
  }, [])

  const updateAsset = useCallback(async (
    id: string,
    data: { name?: string }
  ): Promise<boolean> => {
    setError(null)

    try {
      const response = await fetch(`/api/library/upload?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error || "更新失败")

      setAssets(prev => prev.map(a =>
        a.id === id ? { ...a, ...data } : a
      ))

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败")
      return false
    }
  }, [])

  const deleteAsset = useCallback(async (id: string): Promise<boolean> => {
    setError(null)

    try {
      const response = await fetch(`/api/library/upload?id=${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error || "删除失败")

      setAssets(prev => prev.filter(a => a.id !== id))
      setPagination(prev => prev ? {
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.limit),
      } : null)

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败")
      return false
    }
  }, [])

  const refreshAssets = useCallback(async () => {
    await loadAssets(1, "all", "")
  }, [loadAssets])

  return {
    assets,
    loading,
    uploading,
    error,
    pagination,
    uploadAsset,
    updateAsset,
    deleteAsset,
    loadAssets,
    refreshAssets,
  }
}

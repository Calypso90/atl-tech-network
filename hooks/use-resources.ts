'use client'

import { useState, useEffect } from 'react'
import type { Resource } from '@/components/resource-card'

interface UseResourcesOptions {
  type?: 'meetup' | 'conference' | 'online' | 'tech-hub'
  search?: string
  limit?: number
}

interface UseResourcesResult {
  resources: Resource[]
  loading: boolean
  error: Error | null
  total: number
  refetch: () => Promise<void>
}

interface APIResponse {
  success: boolean
  data: Array<{
    id: number
    type: 'meetup' | 'conference' | 'online' | 'tech-hub'
    name: string
    description: string
    tags: string[]
    link: string
    image: string | null
    conference_date: string | null
    cfp_date: string | null
  }>
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Hook to fetch resources from the API
 * Falls back to sample data if API is unavailable (for local dev without D1)
 */
export function useResources(options: UseResourcesOptions = {}): UseResourcesResult {
  const { type, search, limit = 100 } = options
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)

  const fetchResources = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build query string
      const params = new URLSearchParams()
      if (type) params.set('type', type)
      if (search) params.set('search', search)
      if (limit) params.set('limit', limit.toString())

      const url = `/api/resources${params.toString() ? `?${params}` : ''}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.status}`)
      }

      const data: APIResponse = await response.json()

      if (!data.success) {
        throw new Error('API returned unsuccessful response')
      }

      // Transform API response to Resource format
      const transformed: Resource[] = data.data.map((item) => {
        const base = {
          id: item.id.toString(),
          name: item.name,
          description: item.description,
          tags: item.tags,
          link: item.link,
          image: item.image || '/placeholder.svg',
        }

        if (item.type === 'conference') {
          return {
            ...base,
            type: 'conference' as const,
            conferenceDate: item.conference_date || undefined,
            cfpDate: item.cfp_date || undefined,
          }
        }

        return {
          ...base,
          type: item.type,
        }
      })

      setResources(transformed)
      setTotal(data.pagination.total)
    } catch (err) {
      console.error('Error fetching resources:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))

      // Fall back to sample data for local development without D1
      try {
        const { sampleMeetups, sampleConferences, sampleOnlineResources, sampleTechHubs } = await import('@/lib/sample-data')

        let fallbackData: Resource[] = []
        if (type === 'meetup') fallbackData = sampleMeetups
        else if (type === 'conference') fallbackData = sampleConferences
        else if (type === 'online') fallbackData = sampleOnlineResources
        else if (type === 'tech-hub') fallbackData = sampleTechHubs
        else {
          fallbackData = [
            ...sampleMeetups,
            ...sampleConferences,
            ...sampleOnlineResources,
            ...sampleTechHubs,
          ]
        }

        setResources(fallbackData)
        setTotal(fallbackData.length)
        // Clear error since we have fallback data
        setError(null)
      } catch {
        // If sample data also fails, keep the original error
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [type, search, limit])

  return {
    resources,
    loading,
    error,
    total,
    refetch: fetchResources,
  }
}

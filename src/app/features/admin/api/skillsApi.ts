import { apiClient } from '@/shared/lib/api/client'
import type { ApiResponse } from '../model/types'

export interface Skill {
  id: string
  name: string
}

const BASE = '/skills'

export const skillsApi = {
  getAll: async (): Promise<Skill[]> => {
    const res = await apiClient.get<ApiResponse<Skill[]>>(BASE)
    return res.data.data
  },

  getById: async (id: string): Promise<Skill> => {
    const res = await apiClient.get<ApiResponse<Skill>>(`${BASE}/${id}`)
    return res.data.data
  },

  create: async (name: string): Promise<Skill> => {
    const res = await apiClient.post<ApiResponse<Skill>>(BASE, { name })
    return res.data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`)
  }
}

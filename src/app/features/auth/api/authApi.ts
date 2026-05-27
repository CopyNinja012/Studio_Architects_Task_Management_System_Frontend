import { apiClient } from '@/shared/lib/api/client'
import type {
  LoginCredentials,
  LoginResponse,
  RefreshResponse,
  ChangePasswordRequest,
  AuthResponse,
} from '../model/types'

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<AuthResponse<LoginResponse>>(
      '/auth/login',
      credentials,
      { skipAuth: true }
    )
    return response.data.data
  },

  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await apiClient.post<AuthResponse<RefreshResponse>>(
      '/auth/refresh',
      { refreshToken },
      { skipAuth: true }
    )
    return response.data.data
  },

  logout: async (refreshToken: string) => {
    // Depending on backend, logout may or may not require Authorization.
    // Keeping it WITHOUT skipAuth is usually fine.
    await apiClient.post('/auth/logout', { refreshToken }).catch(() => {})
  },

  changePassword: async (data: ChangePasswordRequest) => {
    const response = await apiClient.post<AuthResponse<string>>('/auth/change-password', data)
    return response.data.data
  },
}
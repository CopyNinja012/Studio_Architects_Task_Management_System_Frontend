import axios, { AxiosHeaders, type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import { useAuthStore } from '@/store'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  timeout: 15000,
})

// Separate client for refresh to avoid interceptor loops
const refreshClient = axios.create({
  baseURL: BASE_URL,
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  timeout: 15000,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // IMPORTANT: do not attach Authorization on endpoints like login/refresh
  if ((config as any).skipAuth) return config

  const token = useAuthStore.getState().user?.token
  if (token) {
    if (!(config.headers instanceof AxiosHeaders)) {
      config.headers = new AxiosHeaders(config.headers)
    }
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = []

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : token && p.resolve(token)))
  failedQueue = []
}

const toMessage = (err: unknown) => {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data
    if (err.response?.status === 403) {
      console.error('[403 Forbidden Detail]:', {
        data,
        headers: err.response.headers,
        url: err.config?.url
      })
    }
    return data?.message || data?.error || err.message
  }
  return err instanceof Error ? err.message : 'Request failed'
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (!error.response) {
      console.error('[API Network Error]', {
        message: error.message,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        },
        code: error.code
      })
      return Promise.reject(
        new Error(`Network error: Unable to reach ${error.config?.baseURL}${error.config?.url}. Please check if the backend server is running and accessible.`)
      )
    }

    const originalRequest: any = error.config
    const status = error.response.status

    // If request was marked skipAuth, never refresh for it
    if (originalRequest?.skipAuth) {
      return Promise.reject(new Error(toMessage(error)))
    }

    // Many backends use 401 OR 403 when access token is invalid/expired
    const shouldRefresh = (status === 401 || status === 403) && !originalRequest?._retry
    if (!shouldRefresh) return Promise.reject(new Error(toMessage(error)))

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers = originalRequest.headers ?? {}
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          },
          reject,
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = useAuthStore.getState().user?.refreshToken
    if (!refreshToken) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(new Error('Session expired. Please login again.'))
    }

    try {
      const resp = await refreshClient.post('/auth/refresh', { refreshToken }, { skipAuth: true })
      const { accessToken, refreshToken: newRefreshToken } = (resp.data as any).data

      useAuthStore.getState().setTokens(accessToken, newRefreshToken)

      processQueue(null, accessToken)

      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(originalRequest)
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(new Error(toMessage(refreshErr)))
    } finally {
      isRefreshing = false
    }
  }
)
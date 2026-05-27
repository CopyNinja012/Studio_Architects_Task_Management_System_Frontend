export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  id: string
  email: string
  name: string
  designation?: string
  roles: string[]
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface AuthResponse<T> {
  success: boolean
  message: string
  data: T
}
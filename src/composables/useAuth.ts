import { ref, computed } from 'vue'
import { authAPI } from '../services/api'
import type { AxiosResponse } from 'axios'

interface User {
  email: string
  displayName: string
  userId: number
}

interface AuthResponse {
  token: string
  email: string
  displayName: string
  userId: number
}

const user = ref<User | null>(null)
const token = ref<string | null>(localStorage.getItem('token'))

export const useAuth = () => {
  const isAuthenticated = computed(() => !!token.value)

  const login = async (email: string, password: string) => {
    try {
      const response: AxiosResponse<AuthResponse> = await authAPI.login(email, password)
      const { token: newToken, email: userEmail, displayName, userId } = response.data
      
      token.value = newToken
      localStorage.setItem('token', newToken)
      user.value = { email: userEmail, displayName, userId }
      
      return { success: true }
    } catch (error: unknown) {
      return { 
        success: false, 
        error: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (email: string, password: string, displayName?: string) => {
    try {
      const response: AxiosResponse<AuthResponse> = await authAPI.register(email, password, displayName)
      const { token: newToken, email: userEmail, displayName: name, userId } = response.data
      
      token.value = newToken
      localStorage.setItem('token', newToken)
      user.value = { email: userEmail, displayName: name, userId }
      
      return { success: true }
    } catch (error: unknown) {
      return { 
        success: false, 
        error: (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      // Ignore errors on logout
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }

  const fetchUser = async () => {
    if (!token.value) return
    
    try {
      const response: AxiosResponse<User> = await authAPI.getMe()
      user.value = response.data
    } catch (error) {
      // Token invalid, clear it
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }

  // Initialize user if token exists
  if (token.value) {
    fetchUser()
  }

  return {
    user: computed(() => user.value),
    token: computed(() => token.value),
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
  }
}


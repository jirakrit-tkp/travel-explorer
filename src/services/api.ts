import axios from 'axios'

const API_BASE_URL = 'https://travel-explorer-server.onrender.com/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (email: string, password: string, displayName?: string) =>
    api.post('/auth/register', { email, password, displayName }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  getMe: () => api.get('/auth/me'),
  
  logout: () => api.post('/auth/logout'),
}

// Trips API
export const tripsAPI = {
  getAll: () => api.get('/trips'),
  
  search: (query?: string) => 
    api.get('/trips/search', { params: { q: query } }),
  
  getById: (id: number) => api.get(`/trips/${id}`),
  
  getMine: () => api.get('/trips/mine'),
  
  create: (trip: {
    title: string
    description?: string
    photos?: string[]
    tags?: string[]
    latitude?: number
    longitude?: number
  }) => api.post('/trips', trip),
  
  update: (id: number, trip: {
    title?: string
    description?: string
    photos?: string[]
    tags?: string[]
    latitude?: number
    longitude?: number
  }) => api.put(`/trips/${id}`, trip),
  
  delete: (id: number) => api.delete(`/trips/${id}`),
}

// Files API
export const filesAPI = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  uploadMultiple: (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    return api.post('/files/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  delete: (url: string) => 
    api.delete('/files/upload', { params: { url } }),
}

export default api


import axios from 'axios'
import type { AuthRequest, ZKAuthRequest, AuthResponse } from './types'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export class ApiService {
  static async traditionalSignup(data: AuthRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/signup', data)
    return response.data
  }

  static async traditionalLogin(data: AuthRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data)
    return response.data
  }

  static async zkSignup(data: ZKAuthRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/zk-signup', data)
    return response.data
  }

  static async zkLogin(data: ZKAuthRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/zk-login', data)
    return response.data
  }

  static async getPasswordHash(email: string): Promise<{ hash: string; salt: string }> {
    const response = await api.get(`/auth/hash/${encodeURIComponent(email)}`)
    return response.data
  }
}
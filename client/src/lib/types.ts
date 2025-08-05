import { z } from 'zod'

export const AuthRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const ZKAuthRequestSchema = z.object({
  email: z.string().email(),
  proof: z.object({
    pi_a: z.array(z.string()),
    pi_b: z.array(z.array(z.string())),
    pi_c: z.array(z.string()),
  }),
  publicSignals: z.array(z.string()),
  salt: z.string().optional(),
  expectedHash: z.string().optional(),
})

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  token: z.string().optional(),
  userId: z.string().optional(),
})

export type AuthRequest = z.infer<typeof AuthRequestSchema>
export type ZKAuthRequest = z.infer<typeof ZKAuthRequestSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>

export interface ZKProof {
  pi_a: string[]
  pi_b: string[][]
  pi_c: string[]
}

export interface ProofGenerationInput {
  password: string
  salt: string
  expectedHash: string
}

export type AuthMethod = 'traditional' | 'zk'
export type AuthMode = 'signup' | 'login'

export interface DebugData {
  method: AuthMethod
  mode: AuthMode
  request: any
  response: any
  timestamp: number
}
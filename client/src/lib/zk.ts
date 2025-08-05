import * as snarkjs from 'snarkjs'
import type { ZKProof, ProofGenerationInput } from './types'

const CIRCUIT_WASM_PATH = '/circuits/password.wasm'
const CIRCUIT_ZKEY_PATH = '/circuits/password_0001.zkey'

export class ZKService {
  private static instance: ZKService
  private wasmBuffer: Uint8Array | null = null
  private zkey: Uint8Array | null = null

  static getInstance(): ZKService {
    if (!ZKService.instance) {
      ZKService.instance = new ZKService()
    }
    return ZKService.instance
  }

  async initialize(): Promise<void> {
    if (this.wasmBuffer && this.zkey) return

    try {
      const [wasmResponse, zkeyResponse] = await Promise.all([
        fetch(CIRCUIT_WASM_PATH),
        fetch(CIRCUIT_ZKEY_PATH)
      ])

      this.wasmBuffer = new Uint8Array(await wasmResponse.arrayBuffer())
      this.zkey = new Uint8Array(await zkeyResponse.arrayBuffer())
    } catch (error) {
      throw new Error(`Failed to initialize ZK circuits: ${error}`)
    }
  }

  async generateProof(input: ProofGenerationInput): Promise<{
    proof: ZKProof
    publicSignals: string[]
  }> {
    await this.initialize()

    const passwordBigInt = this.stringToBigInt(input.password)
    const saltBigInt = this.stringToBigInt(input.salt)
    // The expectedHash should be the sum of password + salt (what the circuit calculates)
    const expectedHashBigInt = passwordBigInt + saltBigInt

    const circuitInput = {
      password: passwordBigInt.toString(),
      salt: saltBigInt.toString(),
      expectedHash: expectedHashBigInt.toString()
    }

    if (!this.wasmBuffer || !this.zkey) {
      throw new Error('ZK circuits not initialized')
    }

    try {
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        circuitInput,
        this.wasmBuffer,
        this.zkey
      )

      return {
        proof: {
          pi_a: proof.pi_a.slice(0, 2),
          pi_b: [proof.pi_b[0].slice(0, 2), proof.pi_b[1].slice(0, 2)],
          pi_c: proof.pi_c.slice(0, 2)
        },
        publicSignals
      }
    } catch (error) {
      throw new Error(`Proof generation failed: ${error}`)
    }
  }

  generateSalt(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    // Match the circuit's simple hash: password + salt
    const passwordBigInt = this.stringToBigInt(password)
    const saltBigInt = this.stringToBigInt(salt)
    const sum = passwordBigInt + saltBigInt
    return sum.toString()
  }

  private stringToBigInt(str: string): bigint {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)
    let result = BigInt(0)
    for (let i = 0; i < bytes.length; i++) {
      result = result * BigInt(256) + BigInt(bytes[i])
    }
    return result
  }
}
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
    
    // Let the circuit calculate the hash: password + salt
    // Don't use the pre-calculated expectedHash, let the circuit do it
    const calculatedHash = passwordBigInt + saltBigInt

    console.log('ZK Service - Password BigInt:', passwordBigInt.toString())
    console.log('ZK Service - Salt BigInt:', saltBigInt.toString())  
    console.log('ZK Service - Calculated Hash (password + salt):', calculatedHash.toString())
    console.log('ZK Service - Input expectedHash:', input.expectedHash)

    const circuitInput = {
      password: passwordBigInt.toString(),
      salt: saltBigInt.toString(),
      expectedHash: calculatedHash.toString()  // Use the calculated hash
    }

    if (!this.wasmBuffer || !this.zkey) {
      throw new Error('ZK circuits not initialized')
    }

    try {
      console.log('Generating proof with circuit input:', circuitInput)
      
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        circuitInput,
        this.wasmBuffer,
        this.zkey
      )

      console.log('Generated proof:', proof)
      console.log('Generated publicSignals:', publicSignals)

      // Return the proof in the exact format snarkjs expects for verification
      return {
        proof,
        publicSignals
      }
    } catch (error) {
      console.error('Proof generation error details:', error)
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
    // Use a simple hash: sum of character codes
    // This matches what the circuit expects
    let result = BigInt(0)
    for (let i = 0; i < str.length; i++) {
      result += BigInt(str.charCodeAt(i))
    }
    return result
  }
}
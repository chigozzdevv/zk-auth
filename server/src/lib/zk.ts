import * as snarkjs from 'snarkjs'
import { readFileSync } from 'fs'
import { join } from 'path'

interface ZKProof {
  pi_a: string[]
  pi_b: string[][]
  pi_c: string[]
}

interface VerificationInput {
  proof: ZKProof
  publicSignals: string[]
}

export class ZKVerifier {
  private static instance: ZKVerifier
  private verificationKey: any = null

  static getInstance(): ZKVerifier {
    if (!ZKVerifier.instance) {
      ZKVerifier.instance = new ZKVerifier()
    }
    return ZKVerifier.instance
  }

  async initialize(): Promise<void> {
    if (this.verificationKey) return

    try {
      const vkeyPath = join(process.cwd(), 'src/circuits/verification_key.json')
      this.verificationKey = JSON.parse(readFileSync(vkeyPath, 'utf8'))
    } catch (error) {
      throw new Error(`Failed to load verification key: ${error}`)
    }
  }

  async verifyProof(input: VerificationInput): Promise<boolean> {
    await this.initialize()

    try {
      console.log('Verifying proof:', JSON.stringify(input, null, 2))
      console.log('Verification key loaded:', !!this.verificationKey)
      console.log('Verification key nPublic:', this.verificationKey.nPublic)
      console.log('About to call snarkjs.groth16.verify with:')
      console.log('- vkey.nPublic:', this.verificationKey.nPublic)
      console.log('- publicSignals length:', input.publicSignals.length)
      console.log('- publicSignals:', input.publicSignals)

      const proof = {
        pi_a: input.proof.pi_a,
        pi_b: input.proof.pi_b,
        pi_c: input.proof.pi_c,
        protocol: "groth16",
        curve: "bn128"
      }

      const verified = await snarkjs.groth16.verify(
        this.verificationKey,
        input.publicSignals,
        proof
      )

      console.log('Snarkjs verification result:', verified)
      return verified
    } catch (error) {
      console.error('Proof verification failed:', error)
      return false
    }
  }

  hashPassword(password: string, salt: string): string {
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
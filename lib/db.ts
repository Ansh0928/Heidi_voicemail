import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

export const sql: NeonQueryFunction<false, false> | null = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : null

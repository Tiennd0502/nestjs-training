'use server'

import { z } from 'zod'

const helloSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export async function helloAction(formData: FormData) {
  const parsed = helloSchema.safeParse({
    name: formData.get('name'),
  })
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() }
  }
  return { ok: true as const, message: `Hello, ${parsed.data.name}` }
}

import { parseSignInCredentialsForm } from '@/schemas/sign-in'

const toFormData = (identifier: string, password: string): FormData => {
  const fd = new FormData()
  fd.set('identifier', identifier)
  fd.set('password', password)
  return fd
}

describe('parseSignInCredentialsForm', () => {
  it('accepts a valid email and non-empty password', () => {
    const result = parseSignInCredentialsForm(
      toFormData('user@example.com', 'secret'),
    )
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.identifier).toBe('user@example.com')
      expect(result.data.password).toBe('secret')
    }
  })

  it('rejects an invalid email', () => {
    const result = parseSignInCredentialsForm(
      toFormData('not-an-email', 'secret'),
    )
    expect(result.success).toBe(false)
  })

  it('rejects empty fields', () => {
    const result = parseSignInCredentialsForm(toFormData('', ''))
    expect(result.success).toBe(false)
  })
})

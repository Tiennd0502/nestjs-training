import { ERROR_MESSAGES } from '@/constants/messages'
import { parseSignUpStartForm } from '@/schemas/sign-up'

const fullStartForm = (
  firstName: string,
  lastName: string,
  birthday: string,
  emailAddress: string,
  password: string,
): FormData => {
  const fd = new FormData()
  fd.set('firstName', firstName)
  fd.set('lastName', lastName)
  fd.set('birthday', birthday)
  fd.set('emailAddress', emailAddress)
  fd.set('password', password)
  return fd
}

describe('parseSignUpStartForm', () => {
  it('accepts valid profile, email, and password', () => {
    const result = parseSignUpStartForm(
      fullStartForm(
        'Ada',
        'Lovelace',
        '2000-01-15',
        'user@example.com',
        'password1',
      ),
    )
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.firstName).toBe('Ada')
      expect(result.data.lastName).toBe('Lovelace')
      expect(result.data.birthday).toBe('2000-01-15')
      expect(result.data.emailAddress).toBe('user@example.com')
      expect(result.data.password).toBe('password1')
    }
  })

  it('rejects empty profile or credentials', () => {
    expect(
      parseSignUpStartForm(fullStartForm('', '', '', '', '')).success,
    ).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = parseSignUpStartForm(
      fullStartForm(
        'Ada',
        'Lovelace',
        '2000-01-15',
        'not-an-email',
        'password1',
      ),
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === ERROR_MESSAGES.EMAIL_ADDRESS_INVALID,
        ),
      ).toBe(true)
    }
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = parseSignUpStartForm(
      fullStartForm(
        'Ada',
        'Lovelace',
        '2000-01-15',
        'user@example.com',
        'short',
      ),
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === ERROR_MESSAGES.PASSWORD_MIN_LENGTH,
        ),
      ).toBe(true)
    }
  })

  it('rejects empty first or last name', () => {
    expect(
      parseSignUpStartForm(
        fullStartForm(
          '',
          'Lovelace',
          '2000-01-15',
          'user@example.com',
          'password1',
        ),
      ).success,
    ).toBe(false)
    expect(
      parseSignUpStartForm(
        fullStartForm('Ada', '', '2000-01-15', 'user@example.com', 'password1'),
      ).success,
    ).toBe(false)
  })

  it('rejects an invalid calendar date for birthday', () => {
    const result = parseSignUpStartForm(
      fullStartForm(
        'Ada',
        'Lovelace',
        '2000-02-30',
        'user@example.com',
        'password1',
      ),
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === ERROR_MESSAGES.DATE_OF_BIRTH_INVALID,
        ),
      ).toBe(true)
    }
  })

  it('rejects malformed birthday strings', () => {
    const result = parseSignUpStartForm(
      fullStartForm(
        'Ada',
        'Lovelace',
        '01-15-2000',
        'user@example.com',
        'password1',
      ),
    )
    expect(result.success).toBe(false)
  })

  it('rejects a future birthday', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    const y = future.getFullYear()
    const m = String(future.getMonth() + 1).padStart(2, '0')
    const d = String(future.getDate()).padStart(2, '0')
    const result = parseSignUpStartForm(
      fullStartForm(
        'Ada',
        'Lovelace',
        `${y}-${m}-${d}`,
        'user@example.com',
        'password1',
      ),
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === ERROR_MESSAGES.DATE_OF_BIRTH_FUTURE,
        ),
      ).toBe(true)
    }
  })

  it('rejects a birthday that does not meet the minimum age', () => {
    const recent = new Date()
    recent.setFullYear(recent.getFullYear() - 10)
    const y = recent.getFullYear()
    const m = String(recent.getMonth() + 1).padStart(2, '0')
    const d = String(recent.getDate()).padStart(2, '0')
    const result = parseSignUpStartForm(
      fullStartForm(
        'Ada',
        'Lovelace',
        `${y}-${m}-${d}`,
        'user@example.com',
        'password1',
      ),
    )
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some(
          (i) => i.message === ERROR_MESSAGES.DATE_OF_BIRTH_UNDER_MINIMUM_AGE,
        ),
      ).toBe(true)
    }
  })
})

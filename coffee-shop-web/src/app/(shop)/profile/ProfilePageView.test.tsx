import { render, screen } from '@testing-library/react'

import { ProfilePageView } from '@/app/(shop)/profile/ProfilePageView'

const mockUseAuth = jest.fn()
const mockUseClerkUser = jest.fn()

jest.mock('@/hooks/useAuth', () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}))

jest.mock('@clerk/nextjs', () => ({
  useUser: (...args: unknown[]) => mockUseClerkUser(...args),
}))

describe('ProfilePageView', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      error: null,
      isSignedIn: true,
      isAuthLoaded: true,
    })
    mockUseClerkUser.mockReturnValue({
      user: null,
      isLoaded: true,
    })
  })

  it('does not render the order history section (order feature not implemented on backend yet)', () => {
    render(<ProfilePageView />)

    expect(screen.queryByText('Order History')).not.toBeInTheDocument()
  })
})

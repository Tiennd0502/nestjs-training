import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ShopHeader from '@/layouts/Header/ShopHeader'
import { ROUTES } from '@/constants/routes'

const mockPush = jest.fn()
let mockPathname = '/'

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockPush }),
}))

let mockSignedIn = false

jest.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) =>
    mockSignedIn ? children : null,
  SignedOut: ({ children }: { children: React.ReactNode }) =>
    mockSignedIn ? null : children,
  useUser: () =>
    mockSignedIn
      ? {
          isSignedIn: true,
          user: {
            firstName: 'Ada',
            lastName: 'Lovelace',
            imageUrl: '',
          },
        }
      : { isSignedIn: false, user: null },
  useClerk: () => ({ signOut: jest.fn() }),
}))

jest.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: jest.fn(),
  }),
}))

const setViewportLg = () => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches:
      String(query).includes('1024px') ||
      String(query).includes('64rem') ||
      String(query).includes('width >= 64'),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
}

const setViewportBelowLg = () => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
}

describe('ShopHeader', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockPathname = '/'
    mockSignedIn = false
    setViewportBelowLg()
  })

  it('renders search field with accessible name', () => {
    render(<ShopHeader />)
    expect(
      screen.getByRole('searchbox', { name: /search products/i }),
    ).toBeInTheDocument()
  })

  it('renders cart link', () => {
    render(<ShopHeader />)
    expect(
      screen.getByRole('link', { name: /shopping cart/i }),
    ).toHaveAttribute('href', ROUTES.CART)
  })

  it('shows sign-in when signed out', () => {
    mockSignedIn = false
    render(<ShopHeader />)
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      ROUTES.SIGN_IN,
    )
  })

  it('shows account dropdown when signed in', async () => {
    mockSignedIn = true
    render(<ShopHeader />)
    await waitFor(() => {
      expect(screen.getByTestId('btn-dropdown')).toBeInTheDocument()
    })
    expect(
      screen.queryByRole('link', { name: /^sign in$/i }),
    ).not.toBeInTheDocument()
  })

  it('marks active desktop nav link with aria-current', async () => {
    mockSignedIn = false
    mockPathname = '/contact'
    setViewportLg()
    render(<ShopHeader />)
    const contact = screen.getByRole('link', { name: 'Contact' })
    await waitFor(() => {
      expect(contact).toHaveAttribute('aria-current', 'page')
    })
  })

  it('opens mobile nav menu and navigates on item click', async () => {
    mockSignedIn = false
    setViewportBelowLg()
    const user = userEvent.setup()
    render(<ShopHeader />)

    await user.click(
      screen.getByRole('button', { name: /open navigation menu/i }),
    )
    const menu = await screen.findByRole('menu')
    await user.click(within(menu).getByRole('menuitem', { name: 'Roasts' }))
    expect(mockPush).toHaveBeenCalledWith('/roasts')
  })
})

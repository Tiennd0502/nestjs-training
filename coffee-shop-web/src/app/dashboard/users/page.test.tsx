import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PageContent } from '@/app/dashboard/users/PageContent'
import { PAGE_SIZE } from '@/constants/common'
import { API_FALLBACK_ERRORS } from '@/constants/messages'
import { useUsers, type UseUsersParams } from '@/hooks/useUser'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { USER_ROLES, USER_STATUS } from '@/types/user'

let navQueryString = ''

const mockReplace = jest.fn((href: string) => {
  navQueryString = href.includes('?') ? href.split('?')[1] : ''
})

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock('@/hooks/useUser', () => ({
  useUsers: jest.fn(),
}))

jest.mock('@/components/Select', () => ({
  Select: ({
    selected,
    onValueChange,
    options,
  }: {
    selected?: string
    onValueChange?: (value: string) => void
    options: { value: string; label: string }[]
  }) => (
    <label>
      <span className="sr-only">Role filter</span>
      <select
        aria-label="Role filter"
        value={selected ?? ''}
        onChange={(event) => onValueChange?.(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
}))

const mockUsePathname = jest.mocked(usePathname)
const mockUseRouter = jest.mocked(useRouter)
const mockUseSearchParams = jest.mocked(useSearchParams)
const mockUseUsers = jest.mocked(useUsers)
const refetchMock = jest.fn()

/** Simulated API page size in tests (response meta `limit`). */
const MOCK_USERS_PAGE_SIZE = 4

function mockUsersByApiParams(params: UseUsersParams = {}) {
  const page = params.page ?? 1
  const search = params.search?.trim().toLowerCase() ?? ''
  const roleFilter = params.role

  const base = {
    isLoading: false,
    isError: false,
    errorMessage: null,
    refetch: refetchMock,
  }

  let list = [...usersFixture]

  if (search.length > 0) {
    list = list.filter((u) => {
      const name = (u.name ?? `${u.firstName} ${u.lastName}`)
        .trim()
        .toLowerCase()
      const email = (u.email ?? '').toLowerCase()
      return name.includes(search) || email.includes(search)
    })
  }

  if (roleFilter) {
    list = list.filter((u) => u.role === roleFilter)
  }

  const pageSize = MOCK_USERS_PAGE_SIZE
  const totalCount = list.length
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize) || 1)
  const start = (page - 1) * pageSize
  const slice = list.slice(start, start + pageSize)

  return {
    ...base,
    users: slice,
    meta: {
      limit: pageSize,
      currentPage: page,
      pageCount,
      totalCount,
    },
  }
}

const usersFixture = [
  {
    id: 'u-1',
    email: 'julian.v@sensorybrew.com',
    firstName: 'Julian',
    lastName: 'Vance',
    name: 'Julian Vance',
    imageUrl: 'https://i.pravatar.cc/100?img=12',
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
  },
  {
    id: 'u-2',
    email: 'e.rossi@sensorybrew.com',
    firstName: 'Elena',
    lastName: 'Rossi',
    name: 'Elena Rossi',
    imageUrl: 'https://i.pravatar.cc/100?img=32',
    role: USER_ROLES.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    id: 'u-3',
    email: 'm.thorne@sensorybrew.com',
    firstName: 'Marcus',
    lastName: 'Thorne',
    name: 'Marcus Thorne',
    imageUrl: 'https://i.pravatar.cc/100?img=15',
    role: USER_ROLES.USER,
    status: USER_STATUS.INACTIVE,
  },
  {
    id: 'u-4',
    email: 's.bloom@sensorybrew.com',
    firstName: 'Sasha',
    lastName: 'Bloom',
    name: 'Sasha Bloom',
    imageUrl: 'https://i.pravatar.cc/100?img=47',
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
  },
  {
    id: 'u-5',
    email: 'l.carter@sensorybrew.com',
    firstName: 'Lena',
    lastName: 'Carter',
    name: 'Lena Carter',
    imageUrl: 'https://i.pravatar.cc/100?img=6',
    role: USER_ROLES.USER,
    status: USER_STATUS.ACTIVE,
  },
  {
    id: 'u-6',
    email: 'n.grimes@sensorybrew.com',
    firstName: 'Noah',
    lastName: 'Grimes',
    name: 'Noah Grimes',
    imageUrl: 'https://i.pravatar.cc/100?img=9',
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.INACTIVE,
  },
]

function renderUsersPage() {
  mockUseSearchParams.mockImplementation(
    () =>
      new URLSearchParams(navQueryString) as ReturnType<typeof useSearchParams>,
  )
  return render(<PageContent />)
}

describe('Dashboard users page', () => {
  beforeEach(() => {
    navQueryString = ''
    mockReplace.mockClear()
    mockUsePathname.mockReturnValue('/dashboard/users')
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
    } as unknown as ReturnType<typeof useRouter>)
    mockUseSearchParams.mockImplementation(
      () =>
        new URLSearchParams(navQueryString) as ReturnType<
          typeof useSearchParams
        >,
    )
    refetchMock.mockReset()
    mockUseUsers.mockImplementation((params) => mockUsersByApiParams(params))
  })

  it('renders manage users heading with first page records', () => {
    renderUsersPage()

    expect(
      screen.getByRole('heading', { name: 'Manage Users' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Invite User/i })).toBeDisabled()

    expect(screen.getByText('julian.v@sensorybrew.com')).toBeInTheDocument()
    expect(screen.getByText('s.bloom@sensorybrew.com')).toBeInTheDocument()
    expect(
      screen.queryByText('l.carter@sensorybrew.com'),
    ).not.toBeInTheDocument()
  })

  it('filters users by keyword via API params', async () => {
    const view = renderUsersPage()
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Filter users by name or email' }),
      { target: { value: 'marcus' } },
    )

    await waitFor(() => {
      expect(navQueryString).toContain('marcus')
    })
    view.rerender(<PageContent />)

    await waitFor(() => {
      expect(mockUseUsers).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: 'marcus',
          page: 1,
          limit: PAGE_SIZE,
        }),
      )
    })
    expect(screen.getByText('m.thorne@sensorybrew.com')).toBeInTheDocument()
    expect(
      screen.queryByText('julian.v@sensorybrew.com'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 1 users')
  })

  it('filters users by role via API params', async () => {
    const view = renderUsersPage()
    fireEvent.change(screen.getByLabelText('Role filter'), {
      target: { value: 'ADMIN' },
    })
    view.rerender(<PageContent />)

    await waitFor(() => {
      expect(mockUseUsers).toHaveBeenLastCalledWith(
        expect.objectContaining({
          role: USER_ROLES.ADMIN,
          page: 1,
          limit: PAGE_SIZE,
        }),
      )
    })
    expect(screen.getByText('julian.v@sensorybrew.com')).toBeInTheDocument()
    expect(screen.getByText('s.bloom@sensorybrew.com')).toBeInTheDocument()
    expect(
      screen.queryByText('m.thorne@sensorybrew.com'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Showing 3 of 3 users')
  })

  it('moves to next page', async () => {
    const user = userEvent.setup()
    const view = renderUsersPage()

    await user.click(screen.getByLabelText('Go to next page'))
    view.rerender(<PageContent />)

    expect(mockUseUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2, limit: PAGE_SIZE }),
    )
    expect(screen.getByText('l.carter@sensorybrew.com')).toBeInTheDocument()
    expect(screen.getByText('n.grimes@sensorybrew.com')).toBeInTheDocument()
    expect(
      screen.queryByText('julian.v@sensorybrew.com'),
    ).not.toBeInTheDocument()
  })

  it('renders loading state', () => {
    mockUseUsers.mockImplementation(() => ({
      users: [],
      meta: null,
      isLoading: true,
      isError: false,
      errorMessage: null,
      refetch: refetchMock,
    }))

    renderUsersPage()

    expect(screen.getByText('Loading users...')).toBeInTheDocument()
  })

  it('renders error state and retries', async () => {
    const user = userEvent.setup()
    mockUseUsers.mockImplementation(() => ({
      users: [],
      meta: null,
      isLoading: false,
      isError: true,
      errorMessage: API_FALLBACK_ERRORS.USERS_LOAD,
      refetch: refetchMock,
    }))

    renderUsersPage()

    expect(screen.getByText(API_FALLBACK_ERRORS.USERS_LOAD)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(refetchMock).toHaveBeenCalledTimes(1)
  })
})

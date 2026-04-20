import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UsersPage from '@/app/dashboard/users/page'
import { usePathname } from 'next/navigation'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('@/components/Select', () => ({
  Select: ({
    value,
    onValueChange,
    options,
  }: {
    value?: string
    onValueChange?: (value: string) => void
    options: string[]
  }) => (
    <label>
      <span className="sr-only">Role filter</span>
      <select
        aria-label="Role filter"
        value={value}
        onChange={(event) => onValueChange?.(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  ),
}))

const mockUsePathname = jest.mocked(usePathname)

describe('Dashboard users page', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard/users')
  })

  it('renders manage users heading with first page records', () => {
    render(<UsersPage />)

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

  it('filters users by keyword', async () => {
    const user = userEvent.setup()
    render(<UsersPage />)

    await user.type(
      screen.getByRole('searchbox', { name: 'Filter users by name or email' }),
      'marcus',
    )

    expect(screen.getByText('m.thorne@sensorybrew.com')).toBeInTheDocument()
    expect(
      screen.queryByText('julian.v@sensorybrew.com'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 1 users')
  })

  it('filters users by role', async () => {
    const user = userEvent.setup()
    render(<UsersPage />)

    await user.selectOptions(screen.getByLabelText('Role filter'), 'ADMIN')

    expect(screen.getByText('julian.v@sensorybrew.com')).toBeInTheDocument()
    expect(screen.getByText('s.bloom@sensorybrew.com')).toBeInTheDocument()
    expect(
      screen.queryByText('m.thorne@sensorybrew.com'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Showing 3 of 3 users')
  })

  it('moves to next page', async () => {
    const user = userEvent.setup()
    render(<UsersPage />)

    await user.click(screen.getByLabelText('Go to next page'))

    expect(screen.getByText('l.carter@sensorybrew.com')).toBeInTheDocument()
    expect(screen.getByText('n.grimes@sensorybrew.com')).toBeInTheDocument()
    expect(
      screen.queryByText('julian.v@sensorybrew.com'),
    ).not.toBeInTheDocument()
  })
})

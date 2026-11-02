import { render, screen } from '@testing-library/react'

import PageHeader from '.'
import { ROUTES } from '@/constants/routes'

jest.mock('next/navigation', () => ({
  usePathname: () => ROUTES.DASHBOARD_CATEGORIES_ADD,
}))

const breadcrumbItems = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
  { label: 'Categories', href: ROUTES.DASHBOARD_CATEGORIES },
]

describe('PageHeader', () => {
  it('renders the breadcrumb, the title as a level-1 heading and the actions', () => {
    render(
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Add Category"
        actions={<button type="submit">Create category</button>}
      />,
    )

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      ROUTES.DASHBOARD,
    )
    expect(screen.getByRole('link', { name: 'Categories' })).toHaveAttribute(
      'href',
      ROUTES.DASHBOARD_CATEGORIES,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Add Category' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create category' }),
    ).toBeInTheDocument()
  })

  it('renders the description only when given', () => {
    const { container, rerender } = render(
      <PageHeader breadcrumbItems={breadcrumbItems} title="Products" />,
    )
    expect(container.querySelector('header p')).toBeNull()

    rerender(
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Products"
        description="Oversee your products"
      />,
    )
    expect(screen.getByText('Oversee your products')).toBeInTheDocument()
  })

  it('puts the breadcrumb on its own line and centres the actions against the title and description', () => {
    render(
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Add Category"
        description="Create a category"
        actions={<button type="submit">Create category</button>}
      />,
    )

    const header = screen.getByRole('banner')
    const breadcrumb = screen.getByRole('navigation', { name: 'breadcrumb' })
    expect(header).toHaveClass('flex-col')
    expect(header.firstElementChild).toBe(breadcrumb)

    const actions = screen.getByRole('button', {
      name: 'Create category',
    }).parentElement
    const titleRow = actions?.parentElement
    expect(titleRow?.parentElement).toBe(header)
    expect(titleRow).toHaveClass('items-center', 'justify-between')
    expect(titleRow).toContainElement(
      screen.getByRole('heading', { level: 1, name: 'Add Category' }),
    )
    expect(titleRow).toContainElement(screen.getByRole('paragraph'))
    expect(titleRow).not.toContainElement(breadcrumb)
  })

  it('keeps the category title classes by default', () => {
    render(
      <PageHeader breadcrumbItems={breadcrumbItems} title="Add Category" />,
    )

    const title = screen.getByRole('heading', { level: 1 })
    expect(title).toHaveClass('font-headline', 'text-4xl', 'font-semibold')
  })

  it('makes the actions full width on phones and keeps them on the right from sm, even when they wrap', () => {
    render(
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Add Category"
        actions={<button type="submit">Create category</button>}
      />,
    )

    const wrapper = screen.getByRole('button', {
      name: 'Create category',
    }).parentElement
    expect(wrapper).toHaveAttribute(
      'class',
      'flex w-full flex-wrap items-center justify-end gap-3 sm:ml-auto sm:w-auto *:w-full sm:*:w-auto',
    )
  })
})

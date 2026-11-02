import { createRef, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import NumberInput from '.'

const onValueChange = jest.fn()

// Keeps the value in state, as a form would, so the input follows it.
const StatefulNumberInput = ({ initial }: { initial: number | '' }) => {
  const [value, setValue] = useState<number | ''>(initial)
  return (
    <NumberInput
      label="Price"
      maxDecimalPlaces={2}
      value={value}
      onValueChange={(next) => {
        onValueChange(next)
        setValue(next)
      }}
    />
  )
}

describe('NumberInput', () => {
  beforeEach(() => {
    onValueChange.mockClear()
  })

  it('keeps the typed text while it parses to the same number', async () => {
    const user = userEvent.setup()
    render(<StatefulNumberInput initial="" />)
    const input = screen.getByLabelText('Price')

    await user.type(input, '12.')
    expect(input).toHaveValue('12.')
    expect(onValueChange).toHaveBeenLastCalledWith(12)

    await user.type(input, '5')
    expect(input).toHaveValue('12.5')
    expect(onValueChange).toHaveBeenLastCalledWith(12.5)
  })

  it('clears text that is not a number on blur', async () => {
    const user = userEvent.setup()
    const onBlur = jest.fn()
    render(
      <NumberInput
        label="Price"
        value=""
        onValueChange={onValueChange}
        onBlur={onBlur}
      />,
    )
    const input = screen.getByLabelText('Price')

    await user.type(input, '.')
    expect(input).toHaveValue('.')

    await user.tab()

    expect(input).toHaveValue('')
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('clears a lone minus sign on blur', async () => {
    const user = userEvent.setup()
    render(<StatefulNumberInput initial="" />)
    const input = screen.getByLabelText('Price')

    await user.type(input, '-')
    await user.tab()

    expect(input).toHaveValue('')
  })

  it('keeps text that is a number on blur', async () => {
    const user = userEvent.setup()
    render(<StatefulNumberInput initial="" />)
    const input = screen.getByLabelText('Price')

    await user.type(input, '12.')
    await user.tab()

    expect(input).toHaveValue('12.')
  })

  it('follows a value set from outside', () => {
    const { rerender } = render(
      <NumberInput label="Price" value={12} onValueChange={onValueChange} />,
    )

    rerender(
      <NumberInput label="Price" value={30} onValueChange={onValueChange} />,
    )

    expect(screen.getByLabelText('Price')).toHaveValue('30')
  })

  it("reports an empty input as ''", async () => {
    const user = userEvent.setup()
    render(<StatefulNumberInput initial={5} />)

    await user.clear(screen.getByLabelText('Price'))

    expect(onValueChange).toHaveBeenLastCalledWith('')
    expect(screen.getByLabelText('Price')).toHaveValue('')
  })

  it('forwards the ref to the input', () => {
    const ref = createRef<HTMLElement>()
    render(
      <NumberInput
        ref={ref}
        label="Price"
        value=""
        onValueChange={onValueChange}
      />,
    )

    expect(ref.current).toBe(screen.getByLabelText('Price'))
  })
})

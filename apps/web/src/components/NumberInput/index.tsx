'use client'

import * as React from 'react'

import { Input, type InputProps } from '@/components/Input'
import { normalizeNumericInput } from '@/utils/number'

export type NumberInputProps = Omit<
  InputProps,
  'value' | 'onChange' | 'defaultValue' | 'onValueChange'
> & {
  value?: number | ''
  onValueChange: (value: number | '') => void
}

const parseNumber = (value: string): number | undefined => {
  const normalized = normalizeNumericInput(value)
  if (!normalized) return undefined

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

const toInputText = (value: number | '' | undefined) =>
  value === undefined || value === '' ? '' : String(value)

const NumberInput = React.forwardRef<HTMLElement, NumberInputProps>(
  function NumberInput({ value, onValueChange, onBlur, ...props }, ref) {
    const [text, setText] = React.useState(() => toInputText(value))

    React.useEffect(() => {
      setText((current) =>
        (parseNumber(current) ?? '') === value ? current : toInputText(value),
      )
    }, [value])

    return (
      <Input
        {...props}
        ref={ref}
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          onValueChange(parseNumber(event.target.value) ?? '')
        }}
        onBlur={(event) => {
          if (parseNumber(text) === undefined) setText(toInputText(value))
          onBlur?.(event)
        }}
      />
    )
  },
)

export default NumberInput

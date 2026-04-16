'use client'

import { useId } from 'react'

import { Text } from '@/components/Text'
import { Slider } from '@/components/ui/slider'
import { formatPrice } from '@/utils/common'
import { cn } from '@/utils/styles'

const DEFAULT_TITLE = 'PRICE RANGE'

export interface PriceRangeSliderProps {
  min?: number
  max?: number
  step?: number
  value: [number, number]
  onValueChange: (next: [number, number]) => void
  title?: string
  currency?: string
  locale?: string
  className?: string
}

export const PriceRangeSlider = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  onValueChange,
  title = DEFAULT_TITLE,
  currency = 'USD',
  locale = 'en-US',
  className,
}: PriceRangeSliderProps) => {
  const titleId = useId()

  const handleValueChange = (next: number | readonly number[]) => {
    const arr = typeof next === 'number' ? [next] : [...next]
    if (arr.length < 2) {
      return
    }
    const [a, b] = arr
    onValueChange([Math.min(a, b), Math.max(a, b)])
  }

  return (
    <div
      className={cn('w-full max-w-md space-y-3', className)}
      aria-labelledby={titleId}
    >
      <Text
        as="h6"
        className="font-bold tracking-wide text-on-surface-variant uppercase"
        id={titleId}
      >
        {title}
      </Text>
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={handleValueChange}
      />
      <div className="flex justify-between text-sm font-medium text-on-surface-variant">
        <span>{formatPrice(value[0], locale, currency)}</span>
        <span>{formatPrice(value[1], locale, currency)}</span>
      </div>
    </div>
  )
}

'use client'

import * as React from 'react'

import { Label } from '@/components/ui/label'
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface SelectProps extends Omit<
  React.ComponentProps<typeof SelectRoot>,
  'children' | 'id'
> {
  label?: React.ReactNode
  placeholder?: string
  options: string[]
}

export const Select = ({
  label,
  placeholder = '',
  options,
  ...rootProps
}: SelectProps) => {
  const controlId = React.useId()

  return (
    <div className="w-full">
      {Boolean(label) && <Label htmlFor={controlId}>{label}</Label>}
      <SelectRoot {...rootProps}>
        <SelectTrigger
          id={controlId}
          className="w-full"
          disabled={rootProps.disabled}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
    </div>
  )
}

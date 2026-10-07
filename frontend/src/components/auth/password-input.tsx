'use client'

import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function PasswordInput(props: Omit<React.ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className="pr-12" />
      <Button
        variant="ghost"
        size="icon"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-controls={props.id}
        onClick={() => setVisible((shown) => !shown)}
        className="absolute top-1/2 right-1 size-9 -translate-y-1/2"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  )
}

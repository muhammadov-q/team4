import { cn } from 'cn'

// The sheen animation lives in globals.css, keyed on data-slot.
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="skeleton" className={cn('rounded-md bg-skeleton', className)} {...props} />
}

export { Skeleton }

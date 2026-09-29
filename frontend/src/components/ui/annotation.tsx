import { cn } from 'cn'

export function Annotation({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span className={cn('font-mono text-caption text-subtle tabular-nums', className)} {...props} />
  )
}

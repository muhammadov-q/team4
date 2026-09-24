import { cn } from 'cn'

export function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('rounded-2xl bg-card p-8', className)} {...props} />
}

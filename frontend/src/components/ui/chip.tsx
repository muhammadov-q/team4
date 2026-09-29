import { cn } from 'cn'

export function Chip({ className, children, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-md bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground',
        className
      )}
      {...props}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-[#9db400] dark:bg-lime" />
      {children}
    </span>
  )
}

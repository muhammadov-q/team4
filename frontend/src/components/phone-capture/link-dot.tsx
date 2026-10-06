import { cn } from 'cn'

export function LinkDot({ pulse = false, className }: { pulse?: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn('relative flex size-2 shrink-0', className)}>
      {pulse && (
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#9db400] opacity-75 motion-reduce:animate-none dark:bg-lime" />
      )}
      <span className="relative inline-flex size-2 rounded-full bg-[#9db400] dark:bg-lime" />
    </span>
  )
}

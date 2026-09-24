import { cn } from 'cn'

/** The Codex Lens mark: a lens ring that doubles as a C, with a rubric focal point. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn('shrink-0', className)}>
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="9"
        strokeWidth="1.5"
        className="fill-card stroke-border"
      />
      <path
        d="M21.9 10.1a8.4 8.4 0 1 0 0 11.8"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-primary"
      />
      <circle cx="16" cy="16" r="2.6" className="fill-rubric" />
    </svg>
  )
}

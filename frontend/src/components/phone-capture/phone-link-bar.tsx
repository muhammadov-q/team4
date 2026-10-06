import { Button } from '@/components/ui/button'
import { LinkDot } from './link-dot'

interface PhoneLinkBarProps {
  linked: boolean
  onShowCode: () => void
  onStop: () => void
}

export function PhoneLinkBar({ linked, onShowCode, onStop }: PhoneLinkBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card py-2 pr-2 pl-4">
      <LinkDot pulse={!linked} />
      <p role="status" className="min-w-0 flex-1 truncate text-sm">
        {linked
          ? 'Phone linked. New photos replace the page.'
          : 'Waiting for a photo from your phone'}
      </p>
      <Button variant="ghost" size="sm" onClick={onShowCode}>
        Show code
      </Button>
      <Button variant="ghost" size="sm" onClick={onStop}>
        {linked ? 'Unlink' : 'Cancel'}
      </Button>
    </div>
  )
}

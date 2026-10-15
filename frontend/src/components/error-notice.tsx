import { CircleAlertIcon } from 'lucide-react'

export function ErrorNotice({ title, message }: { title: string; message: string }) {
  return (
    <div role="alert" className="flex gap-3 rounded-xl bg-muted p-5">
      <CircleAlertIcon className="mt-0.5 size-5 shrink-0 text-foreground" />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export function StatusPage({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children: React.ReactNode
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-6 pt-32 text-center">
      <p className="font-mono text-sm text-muted-foreground">{label}</p>
      <h1 className="mt-6 text-heading font-medium">{title}</h1>
      {children}
    </main>
  )
}

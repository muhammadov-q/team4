import { DashboardMenu } from '@/components/dashboard-menu'

export default function DashboardLayout({ children }: LayoutProps<'/dashboard'>) {
  return (
    <div className="flex min-h-svh">
      <DashboardMenu />

      <div className="min-w-0 flex-1">
        <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  )
}

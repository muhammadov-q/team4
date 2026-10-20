import { AuthButton } from '@/components/auth/auth-button'
import { DashboardMenu } from '@/components/dashboard-menu'

export default function DashboardLayout({ children }: LayoutProps<'/dashboard'>) {
  return (
    <div className="flex min-h-svh">
      <DashboardMenu />

      <div className="min-w-0 flex-1">
        <header className="flex justify-end px-4 py-4 sm:px-6">
          <AuthButton />
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-12 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  )
}

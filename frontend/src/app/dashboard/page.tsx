import { connection } from 'next/server'
import { AuthButton } from '@/components/auth/auth-button'
import { DashboardMenu } from '@/components/dashboard-menu'
import { RecognitionWorkbench } from '@/components/recognition/recognition-workbench'
import { lanAddress } from '@/lib/lan-address'

export default async function DashboardPage() {
  await connection()

  return (
    <div className="flex min-h-svh">
      <DashboardMenu />

      <div className="min-w-0 flex-1">
        <header className="flex justify-end px-4 py-4 sm:px-6">
          <AuthButton />
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-12 sm:px-6 lg:px-10">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
              Read handwritten digits
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Upload a photo and the model finds each digit and reads it.
            </p>
          </div>

          <RecognitionWorkbench lanAddress={lanAddress()} />
        </main>
      </div>
    </div>
  )
}

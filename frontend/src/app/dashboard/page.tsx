import { connection } from 'next/server'
import { DashboardMenu } from '@/components/dashboard-menu'
import { RecognitionWorkbench } from '@/components/recognition/recognition-workbench'
import { lanAddress } from '@/lib/lan-address'
import { SignOutButton } from '@/components/auth/sign-out-button'

export default async function DashboardPage() {
  await connection()

  return (
    <div className="min-h-svh">
      <DashboardMenu />
      <div className="fixed top-4 right-6 z-40">
        <SignOutButton />
      </div>

      <main className="mx-auto w-full max-w-[1400px] px-6 pt-24 pb-12 lg:px-10">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
            Read handwritten digits
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Upload a photo and the model finds each digit and reads it.
          </p>
        </header>

        <RecognitionWorkbench lanAddress={lanAddress()} />
      </main>
    </div>
  )
}

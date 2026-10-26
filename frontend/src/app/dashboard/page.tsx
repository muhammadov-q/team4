import { connection } from 'next/server'
import { RecognitionWorkbench } from '@/components/recognition/recognition-workbench'
import { lanAddress } from '@/lib/lan-address'

export default async function DashboardPage() {
  await connection()

  return <RecognitionWorkbench lanAddress={lanAddress()} />
}

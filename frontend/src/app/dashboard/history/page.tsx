import type { Metadata } from 'next'
import { HistoryList } from '@/components/history/history-list'

export const metadata: Metadata = { title: 'History' }

export default function HistoryPage() {
  return (
    <>
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">History</h1>
        <p className="mt-3 text-lg text-muted-foreground">Pages you read before, newest first.</p>
      </div>

      <HistoryList />
    </>
  )
}

import { QueryClient, isServer } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      // Above zero so data fetched during SSR isn't refetched straight after hydration.
      queries: { staleTime: 60_000 },
    },
  })
}

let browserQueryClient: QueryClient | undefined

/** A fresh client per server request, one shared client per browser tab. Not useState:
 *  React throws that away if the first render suspends. */
export function getQueryClient() {
  if (isServer) return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

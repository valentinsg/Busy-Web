import { Suspense } from "react"
import { PendingClient } from "./pending-client"

export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <Suspense>
      <PendingClient />
    </Suspense>
  )
}

import { Suspense } from "react"
import { FailureClient } from "./failure-client"

export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <Suspense>
      <FailureClient />
    </Suspense>
  )
}

"use client"

import { BusyLogo } from "@/components/shared/busy-logo"

/**
 * @deprecated Use BusyLogo component directly for more control
 */
export function Logo() {
  return (
    <div className="relative w-24 h-24">
      <BusyLogo variant="white" fill />
    </div>
  )
}

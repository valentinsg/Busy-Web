"use client"

import dynamic from "next/dynamic"
import ModalShell from "@/components/admin/modal-shell"

const NewCouponPage = dynamic(() => import("../../new/page"), { ssr: false })

export default function CouponsNewModal() {
  return (
    <ModalShell title="Nuevo cupón">
      <NewCouponPage />
    </ModalShell>
  )
}

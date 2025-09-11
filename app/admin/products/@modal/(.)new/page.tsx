"use client"

import dynamic from "next/dynamic"
import ModalShell from "@/components/admin/modal-shell"

const NewProductPage = dynamic(() => import("../../new/page"), { ssr: false })

export default function ProductsNewModal() {
  return (
    <ModalShell title="Nuevo producto">
      <NewProductPage />
    </ModalShell>
  )
}

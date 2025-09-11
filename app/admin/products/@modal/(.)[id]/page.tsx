"use client"

import dynamic from "next/dynamic"
import ModalShell from "@/components/admin/modal-shell"

type Props = { params: { id: string } }

const EditProductPage = dynamic(() => import("../../[id]/page"), { ssr: false })

export default function ProductsEditModal(props: Props) {
  return (
    <ModalShell title="Editar producto">
      <EditProductPage {...props} />
    </ModalShell>
  )
}

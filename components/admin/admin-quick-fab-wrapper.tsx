"use client"

import dynamic from "next/dynamic"

export const AdminQuickFAB = dynamic(() => import('@/components/admin/admin-quick-fab'), { ssr: false })

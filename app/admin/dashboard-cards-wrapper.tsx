"use client"

import dynamic from "next/dynamic"

const DashboardCards = dynamic(() => import("@/components/admin/dashboard-cards"), { ssr: false })

export default DashboardCards

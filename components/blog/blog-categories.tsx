"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface BlogCategoriesProps {
  categories: string[]
  selectedCategory: string | null
  onCategoryChangeAction: (category: string | null) => void
  postCounts?: Record<string, number>
}

export function BlogCategories({
  categories,
  selectedCategory,
  onCategoryChangeAction,
  postCounts = {},
}: BlogCategoriesProps) {
  return (
    <div className="font-body">
      <div className="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar ">
        {/* Todos */}
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => onCategoryChangeAction(null)}
          className="h-9 px-3 whitespace-nowrap"
        >
          <span className="mr-2">Todos</span>
          {postCounts.total && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
              {postCounts.total}
            </Badge>
          )}
        </Button>

        {/* Dinámicas */}
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => onCategoryChangeAction(cat)}
            className="h-9 px-3 whitespace-nowrap"
          >
            <span className="mr-2 text-sm">{cat}</span>
            {postCounts[cat] && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                {postCounts[cat]}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}

export function CategoryBadge({ categoryId }: { categoryId: string }) {
  if (!categoryId) return null
  return (
    <Badge variant="secondary" className="text-xs font-medium">
      {categoryId}
    </Badge>
  )
}

"use client"

import { useState, type ReactNode } from "react"
import {
  Briefcase,
  GraduationCap,
  Grid3X3,
  Heart,
  LayoutGrid,
  Monitor,
  Palette,
  Users,
} from "lucide-react"
import type { EventCategory } from "@/lib/events-data"
import { eventCategories } from "@/lib/events-data"

const categoryIcons: Record<string, ReactNode> = {
  all: <Grid3X3 className="h-5 w-5" />,
  tech: <Monitor className="h-5 w-5" />,
  business: <Briefcase className="h-5 w-5" />,
  design: <Palette className="h-5 w-5" />,
  community: <Users className="h-5 w-5" />,
  health: <Heart className="h-5 w-5" />,
  education: <GraduationCap className="h-5 w-5" />,
  more: <LayoutGrid className="h-5 w-5" />,
}

interface CategoryFilterProps {
  onChange?: (category: EventCategory | "more") => void
}

export function CategoryFilter({ onChange }: CategoryFilterProps) {
  const [active, setActive] = useState<EventCategory | "more">("all")

  const handleSelect = (id: EventCategory | "more") => {
    setActive(id)
    onChange?.(id)
  }

  return (
    <section className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
          {eventCategories.map((cat) => {
            const isActive = active === cat.id
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => handleSelect(cat.id)}
                className={`flex min-w-[100px] shrink-0 flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm font-medium transition-all ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {categoryIcons[cat.id]}
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

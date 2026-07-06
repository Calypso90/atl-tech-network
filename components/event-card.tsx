import Image from "next/image"
import Link from "next/link"
import { Clock, MapPin } from "lucide-react"
import type { FeaturedEvent } from "@/lib/events-data"

interface EventCardProps {
  event: FeaturedEvent
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={event.href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <div className="absolute left-3 top-3 overflow-hidden rounded-lg shadow-md">
          <div className="bg-primary px-2.5 py-0.5 text-center text-[10px] font-bold tracking-wider text-primary-foreground">
            {event.month}
          </div>
          <div className="bg-card px-2.5 py-1 text-center text-lg font-bold leading-none text-foreground">
            {event.day}
          </div>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary-foreground">
            {event.categoryLabel}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold leading-snug text-foreground group-hover:text-primary">
          {event.title}
        </h3>
        <div className="mt-auto space-y-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            {event.location}
          </p>
          <p className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-primary" />
            {event.time}
          </p>
        </div>
      </div>
    </Link>
  )
}

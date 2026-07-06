import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { EventCard } from "@/components/event-card"
import { featuredEvents } from "@/lib/events-data"

export function UpcomingEventsSection() {
  return (
    <section id="events" className="scroll-mt-24 bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Upcoming Events
          </h2>
          <Link
            href="/meetups"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View all events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next events"
            className="absolute -right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 lg:flex"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

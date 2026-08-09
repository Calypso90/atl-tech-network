"use client"

import { Navigation } from "@/components/navigation"
import { sampleConferences } from "@/lib/sample-data"
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarDays, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface CalendarEvent {
  id: string
  title: string
  date: Date
  tags: string[]
  link: string
}

function parseConferenceDate(dateStr: string) {
  if (!dateStr) return null
  // Collapse date ranges like "2026-05-05-07" or "May 5-7, 2026" to a single start date.
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  }
  const parsed = new Date(dateStr.replace(/(\d+)-\d+,/, "$1,"))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export default function CalendarPage() {
  const events = useMemo<CalendarEvent[]>(() => {
    return sampleConferences
      .map((conference) => {
        const date = parseConferenceDate(conference.conferenceDate || "")
        if (!date) return null
        return {
          id: conference.id,
          title: conference.name,
          date,
          tags: conference.tags,
          link: conference.link,
        }
      })
      .filter((event): event is CalendarEvent => event !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [])

  // Default the calendar to the month of the first upcoming event.
  const initialMonth = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const next = events.find((event) => event.date >= today) ?? events[0]
    const base = next ? next.date : today
    return { year: base.getFullYear(), month: base.getMonth() }
  }, [events])

  const [viewYear, setViewYear] = useState(initialMonth.year)
  const [viewMonth, setViewMonth] = useState(initialMonth.month)

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    events.forEach((event) => {
      if (event.date.getFullYear() === viewYear && event.date.getMonth() === viewMonth) {
        const key = String(event.date.getDate())
        map.set(key, [...(map.get(key) ?? []), event])
      }
    })
    return map
  }, [events, viewYear, viewMonth])

  const monthEvents = useMemo(
    () =>
      events.filter(
        (event) => event.date.getFullYear() === viewYear && event.date.getMonth() === viewMonth,
      ),
    [events, viewYear, viewMonth],
  )

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth

  const goToPrevMonth = () => {
    setViewMonth((prev) => {
      if (prev === 0) {
        setViewYear((y) => y - 1)
        return 11
      }
      return prev - 1
    })
  }

  const goToNextMonth = () => {
    setViewMonth((prev) => {
      if (prev === 11) {
        setViewYear((y) => y + 1)
        return 0
      }
      return prev + 1
    })
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <section className="px-4 py-16 sm:px-6 lg:px-8 md:py-20">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                ATLANTA TECH CALENDAR
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Events Calendar
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                Browse upcoming Atlanta tech conferences month by month and plan
                which events to attend.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
              {/* Calendar grid */}
              <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goToPrevMonth}
                      aria-label="Previous month"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextMonth}
                      aria-label="Next month"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {cells.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="aspect-square" />
                    }
                    const dayEvents = eventsByDay.get(String(day)) ?? []
                    const hasEvents = dayEvents.length > 0
                    const isToday = isCurrentMonth && today.getDate() === day

                    return (
                      <div
                        key={day}
                        className={`flex aspect-square flex-col items-center justify-start gap-1 rounded-xl border p-1.5 text-sm transition-colors sm:p-2 ${
                          hasEvents
                            ? "border-primary/40 bg-accent"
                            : "border-border bg-background"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                            isToday
                              ? "bg-primary text-primary-foreground"
                              : hasEvents
                                ? "text-accent-foreground"
                                : "text-foreground"
                          }`}
                        >
                          {day}
                        </span>
                        {hasEvents && (
                          <span className="mt-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Month event list */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">
                    {MONTH_NAMES[viewMonth]} Events
                  </h2>
                </div>

                {monthEvents.length > 0 ? (
                  <ul className="flex flex-col gap-4">
                    {monthEvents.map((event) => (
                      <li
                        key={event.id}
                        className="rounded-2xl border border-border bg-background p-4 transition-colors hover:border-primary/40"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <span className="text-[10px] font-semibold uppercase">
                              {MONTH_NAMES[event.date.getMonth()].slice(0, 3)}
                            </span>
                            <span className="text-lg font-bold leading-none">
                              {event.date.getDate()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-foreground">
                              {event.title}
                            </h3>
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              Atlanta, GA
                            </p>
                            <a
                              href={event.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              Visit conference
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No events scheduled this month. Use the arrows to browse other
                    months.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

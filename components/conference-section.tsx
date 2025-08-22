import { ResourceCard } from "./resource-card"
import { sampleConferences } from "@/lib/sample-data"
import Link from "next/link"

export function ConferenceSection() {
  const getUpcomingConferences = () => {
    const today = new Date()

    // Parse conference dates and sort chronologically
    const conferencesWithDates = sampleConferences.map((conference) => {
      let conferenceDate = new Date()

      if (conference.conferenceDate) {
        // Parse dates like "April 15-17, 2025" or "October 8-10, 2025"
        const dateMatch = conference.conferenceDate.match(/(\w+)\s+(\d+)(?:-\d+)?,\s+(\d{4})/)
        if (dateMatch) {
          const [, month, day, year] = dateMatch
          const monthIndex = new Date(`${month} 1, 2000`).getMonth()
          conferenceDate = new Date(Number.parseInt(year), monthIndex, Number.parseInt(day))
        }
      }

      return {
        ...conference,
        parsedDate: conferenceDate,
      }
    })

    // Filter for upcoming conferences and sort by date
    const upcomingConferences = conferencesWithDates
      .filter((conference) => conference.parsedDate >= today)
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())

    // If we don't have enough upcoming conferences, add some past ones
    if (upcomingConferences.length < 3) {
      const pastConferences = conferencesWithDates
        .filter((conference) => conference.parsedDate < today)
        .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime()) // Most recent first

      return [...upcomingConferences, ...pastConferences].slice(0, 3)
    }

    return upcomingConferences.slice(0, 3)
  }

  const displayConferences = getUpcomingConferences()

  return (
    <section id="conferences" className="scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
          Tech Conferences
        </h2>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Attend premier tech conferences in Atlanta and the Southeast region, featuring industry leaders and
          cutting-edge topics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {displayConferences.map((conference) => (
          <ResourceCard key={conference.id} resource={conference} />
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/conferences"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:via-cyan-600 hover:to-green-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          View All Conferences
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Additional info about CFP dates */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-400">CFP = Call for Proposals submission deadline</p>
      </div>
    </section>
  )
}

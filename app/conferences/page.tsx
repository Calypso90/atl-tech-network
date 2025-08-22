"use client"

import { Navigation } from "@/components/navigation"
import { ResourceCard } from "@/components/resource-card"
import { sampleConferences } from "@/lib/sample-data"
import { ArrowLeft, Mic, Trophy, Network } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

export default function ConferencesPage() {
  const sortedConferences = useMemo(() => {
    return [...sampleConferences].sort((a, b) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date("1900-01-01")

        const cleanDate = dateStr.replace(/(\d+)-\d+,/, "$1,")
        return new Date(cleanDate)
      }

      const dateA = parseDate(a.conferenceDate || "")
      const dateB = parseDate(b.conferenceDate || "")

      const isUpcomingA = dateA >= today
      const isUpcomingB = dateB >= today

      if (isUpcomingA && !isUpcomingB) return -1
      if (!isUpcomingA && isUpcomingB) return 1

      if (isUpcomingA && isUpcomingB) {
        return dateA.getTime() - dateB.getTime()
      } else {
        return dateB.getTime() - dateA.getTime()
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
              Tech Conferences
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Discover Atlanta's premier tech conferences and events. From industry-leading speakers to hands-on
              workshops, these conferences offer unparalleled learning and networking opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <Mic className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Industry Speakers</h3>
              <p className="text-slate-400 text-sm">Learn from leading experts and innovators in the tech industry</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <Trophy className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Speaking Opportunities</h3>
              <p className="text-slate-400 text-sm">Submit proposals and share your expertise with the community</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <Network className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Premium Networking</h3>
              <p className="text-slate-400 text-sm">
                Connect with professionals, recruiters, and potential collaborators
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedConferences.map((conference) => (
              <ResourceCard key={conference.id} resource={conference} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

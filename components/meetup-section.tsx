'use client'

import { ResourceCard } from "./resource-card"
import { useResources } from "@/hooks/use-resources"
import Link from "next/link"
import { useMemo } from "react"
import { Loader2 } from "lucide-react"

export function MeetupSection() {
  const { resources: meetups, loading } = useResources({ type: 'meetup' })

  // Get 3 random meetups
  const displayMeetups = useMemo(() => {
    if (meetups.length === 0) return []
    const shuffled = [...meetups].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
  }, [meetups])

  return (
    <section id="meetups" className="scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
          Local Meetup Groups
        </h2>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Connect with Atlanta's vibrant tech community through regular meetups, workshops, and networking events
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayMeetups.map((meetup) => (
            <ResourceCard key={meetup.id} resource={meetup} />
          ))}
        </div>
      )}

      <div className="text-center">
        <Link
          href="/meetups"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:via-cyan-600 hover:to-green-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          View All Meetups
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  )
}

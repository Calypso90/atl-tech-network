import { ResourceCard } from "./resource-card"
import { sampleOnlineResources } from "@/lib/sample-data"
import Link from "next/link"

export function OnlineResourcesSection() {
  const getRandomResources = () => {
    const shuffled = [...sampleOnlineResources].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 3)
  }

  const displayResources = getRandomResources()

  return (
    <section id="resources" className="scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold font-serif mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
          Online Resources
        </h2>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Level up your skills with these excellent online learning platforms, bootcamps, and tech communities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {displayResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/resources"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:via-cyan-600 hover:to-green-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          View All Resources
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Additional helpful info */}
      <div className="mt-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-2 text-green-400">New to Coding?</h3>
        <p className="text-slate-300">
          These resources offer structured learning paths from beginner to advanced levels. Many are completely free and
          provide certificates upon completion.
        </p>
      </div>
    </section>
  )
}

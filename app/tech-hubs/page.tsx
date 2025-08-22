import { Navigation } from "@/components/navigation"
import { ResourceCard } from "@/components/resource-card"
import { sampleTechHubs } from "@/lib/sample-data"
import { ArrowLeft, MapPin, Users, Wifi } from "lucide-react"
import Link from "next/link"

export default function TechHubsPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />

      {/* Hero Section */}
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
              Atlanta Tech Hubs
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Discover Atlanta's premier tech spaces, innovation centers, and coworking hubs where entrepreneurs,
              developers, and tech companies collaborate and thrive.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <MapPin className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Prime Locations</h3>
              <p className="text-slate-400 text-sm">
                Strategically located in Atlanta's tech corridors and innovation districts
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Vibrant Community</h3>
              <p className="text-slate-400 text-sm">
                Connect with startups, established companies, and fellow entrepreneurs
              </p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <Wifi className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Modern Amenities</h3>
              <p className="text-slate-400 text-sm">
                State-of-the-art facilities, high-speed internet, and collaborative spaces
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Hubs Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleTechHubs.map((hub) => (
              <ResourceCard key={hub.id} resource={hub} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { MeetupSection } from "@/components/meetup-section"
import { ConferenceSection } from "@/components/conference-section"
import { OnlineResourcesSection } from "@/components/online-resources-section"
import { TechHubsSection } from "@/components/tech-hubs-section"
import { SubmitResourceSection } from "@/components/submit-resource-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navigation />
      <main>
        <Hero />
        <div className="container mx-auto px-4 py-12 space-y-16">
          <MeetupSection />
          <ConferenceSection />
          <OnlineResourcesSection />
          <TechHubsSection />
          <SubmitResourceSection />
        </div>
      </main>
    </div>
  )
}

import { Navigation } from "@/components/navigation"
import { Hero } from "@/components/hero"
import { CategoryFilter } from "@/components/category-filter"
import { UpcomingEventsSection } from "@/components/upcoming-events-section"
import { MapSection } from "@/components/map-section"
import { PartnersBar } from "@/components/partners-bar"
import { SubmitResourceSection } from "@/components/submit-resource-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <div id="categories">
          <CategoryFilter />
        </div>
        <UpcomingEventsSection />
        <MapSection />
        <PartnersBar />
        <div id="contact">
          <SubmitResourceSection />
        </div>
      </main>
    </div>
  )
}

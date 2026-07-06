import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"

const pinPositions = [
  { name: "Buckhead", top: "18%", left: "28%" },
  { name: "Midtown", top: "42%", left: "52%" },
  { name: "Westside", top: "55%", left: "22%" },
  { name: "Downtown", top: "62%", left: "48%" },
  { name: "Old Fourth Ward", top: "48%", left: "68%" },
]

export function MapSection() {
  return (
    <section className="bg-secondary/50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[280px] bg-[#e8e4df] dark:bg-[#1a1816] lg:min-h-[360px]">
              <svg
                className="absolute inset-0 h-full w-full opacity-30 dark:opacity-20"
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id="map-grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-foreground"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#map-grid)" />
              </svg>
              {pinPositions.map((pin) => (
                <div
                  key={pin.name}
                  className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center"
                  style={{ top: pin.top, left: pin.left }}
                >
                  <div className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-md">
                    <MapPin className="h-3 w-3" />
                    {pin.name}
                  </div>
                  <div className="mt-0.5 h-2 w-2 rotate-45 bg-primary" />
                </div>
              ))}
            </div>

            <div className="relative flex flex-col justify-center p-8 md:p-12">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Events Across Atlanta
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                From Buckhead to the Westside. From ideas to impact.
              </p>
              <Link
                href="/meetups"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Explore Map
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="dot-grid absolute bottom-6 right-6 hidden opacity-60 md:block" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Calendar } from "lucide-react"

const SKYLINE_IMAGE =
  "https://images.unsplash.com/photo-1577725772334-9561c81287c1?w=1400&h=900&fit=crop"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 hidden dark:block">
        <Image
          src={SKYLINE_IMAGE}
          alt="Atlanta skyline at night"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
      </div>

      <div className="dot-grid absolute right-8 top-8 hidden opacity-40 lg:block dark:opacity-30" />

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-10 py-14 md:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="max-w-xl">
            <p className="mb-4 text-xs font-bold tracking-[0.2em] text-primary">
              DISCOVER. CONNECT. GROW.
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-[3.25rem]">
              Everything{" "}
              <span className="text-primary">Atlanta.</span>
              <br />
              All in One Place.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              We aggregate the best meetups, tech events, conferences, and
              community gatherings across Atlanta.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/#events"
                className="inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
              >
                Explore Events
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/20">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/meetups"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Calendar className="h-4 w-4" />
                Add to Calendar
              </Link>
            </div>
          </div>

          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl lg:block dark:hidden">
            <Image
              src={SKYLINE_IMAGE}
              alt="Atlanta skyline at dusk"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 600px"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background/20" />
          </div>
        </div>
      </div>
    </section>
  )
}

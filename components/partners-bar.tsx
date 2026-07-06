import { partnerNames } from "@/lib/events-data"

export function PartnersBar() {
  return (
    <section className="border-t border-border bg-secondary/30 py-10">
      <div className="container mx-auto px-4">
        <p className="mb-6 text-sm font-medium text-muted-foreground">
          Trusted by Atlanta&apos;s best
        </p>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
          {partnerNames.map((name) => (
            <span
              key={name}
              className="text-sm font-semibold tracking-wide text-muted-foreground/70 uppercase"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

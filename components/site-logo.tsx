import Link from "next/link"

export function SiteLogo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-end justify-center gap-0.5 rounded-lg bg-primary/10 px-1.5 pb-1.5">
        <span className="h-2 w-1.5 rounded-sm bg-primary" />
        <span className="h-4 w-1.5 rounded-sm bg-primary" />
        <span className="h-3 w-1.5 rounded-sm bg-primary" />
        <span className="h-5 w-1.5 rounded-sm bg-primary" />
      </span>
      <span className="text-xl font-bold tracking-tight text-foreground">
        ATL<span className="text-primary">Events</span>
      </span>
    </Link>
  )
}

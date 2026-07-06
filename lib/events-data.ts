export type EventCategory =
  | "all"
  | "tech"
  | "business"
  | "design"
  | "community"
  | "health"
  | "education"

export interface FeaturedEvent {
  id: string
  title: string
  category: EventCategory
  categoryLabel: string
  location: string
  time: string
  month: string
  day: number
  image: string
  href: string
}

export const eventCategories: {
  id: EventCategory | "more"
  label: string
}[] = [
  { id: "all", label: "All Events" },
  { id: "tech", label: "Tech" },
  { id: "business", label: "Business" },
  { id: "design", label: "Design" },
  { id: "community", label: "Community" },
  { id: "health", label: "Health" },
  { id: "education", label: "Education" },
  { id: "more", label: "More" },
]

export const featuredEvents: FeaturedEvent[] = [
  {
    id: "1",
    title: "Atlanta AI Builders Meetup",
    category: "tech",
    categoryLabel: "TECH",
    location: "Ponce City Market",
    time: "6:30 PM - 9:00 PM",
    month: "MAY",
    day: 20,
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    href: "/meetups",
  },
  {
    id: "2",
    title: "Women in Tech Networking Night",
    category: "community",
    categoryLabel: "COMMUNITY",
    location: "Atlanta Tech Village",
    time: "5:30 PM - 8:00 PM",
    month: "MAY",
    day: 22,
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop",
    href: "/meetups",
  },
  {
    id: "3",
    title: "Startup Pitch Night ATL",
    category: "business",
    categoryLabel: "BUSINESS",
    location: "Switchyards Downtown",
    time: "6:00 PM - 9:30 PM",
    month: "MAY",
    day: 25,
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&h=400&fit=crop",
    href: "/meetups",
  },
  {
    id: "4",
    title: "Connect.Tech Conference",
    category: "tech",
    categoryLabel: "CONFERENCE",
    location: "Georgia World Congress Center",
    time: "All Day",
    month: "JUN",
    day: 3,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    href: "/conferences",
  },
]

export const partnerNames = [
  "Georgia Tech",
  "Atlanta Tech Village",
  "TAG",
  "Atlanta Startup Village",
  "Creative Mornings",
  "Ponce City Market",
]

export const mapNeighborhoods = [
  "Buckhead",
  "Midtown",
  "Westside",
  "Downtown",
  "Old Fourth Ward",
]

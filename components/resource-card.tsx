import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar } from "lucide-react"
import { ResourceTag } from "./resource-tag"

export interface BaseResource {
  id: string
  name: string
  description: string
  tags: string[]
  link: string
  image?: string
}

export interface Conference extends BaseResource {
  type: "conference"
  cfpDate?: string
  conferenceDate?: string
}

export interface Meetup extends BaseResource {
  type: "meetup"
}

export interface OnlineResource extends BaseResource {
  type: "online"
}

export interface TechHub extends BaseResource {
  type: "tech-hub"
}

export type Resource = Conference | Meetup | OnlineResource | TechHub

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const { name, description, tags, link, image } = resource

  const getButtonText = () => {
    switch (resource.type) {
      case "meetup":
        return "Visit Meetup"
      case "conference":
        return "Visit Conference"
      case "online":
        return "Visit Resource"
      case "tech-hub":
        return "Visit Hub"
      default:
        return "Visit Resource"
    }
  }

  return (
    <Card className="group h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-cyan-400/50 bg-slate-800/50 backdrop-blur-sm border-slate-700">
      {/* Image */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt={`${name} logo`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2 text-white">
            {name}
          </h3>
          {resource.type === "conference" && (resource.conferenceDate || resource.cfpDate) && (
            <div className="flex flex-col gap-1 shrink-0">
              {resource.conferenceDate && (
                <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(resource.conferenceDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Badge>
              )}
              {resource.cfpDate && (
                <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Calendar className="w-3 h-3 mr-1" />
                  CFP:{" "}
                  {new Date(resource.cfpDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 mb-4">{description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <ResourceTag key={index} tag={tag} index={index} />
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          asChild
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium"
        >
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2"
          >
            {getButtonText()}
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

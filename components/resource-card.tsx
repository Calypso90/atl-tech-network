import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar } from "lucide-react";
import { ResourceTag } from "./resource-tag";

export interface BaseResource {
  id: string;
  name: string;
  description: string;
  tags: string[];
  link: string;
  image?: string;
}

export interface Conference extends BaseResource {
  type: "conference";
  cfpDate?: string;
  conferenceDate?: string;
}

export interface Meetup extends BaseResource {
  type: "meetup";
}

export interface OnlineResource extends BaseResource {
  type: "online";
}

export interface TechHub extends BaseResource {
  type: "tech-hub";
}

export type Resource = Conference | Meetup | OnlineResource | TechHub;

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const { name, description, tags, link, image } = resource;

  const getButtonText = () => {
    switch (resource.type) {
      case "meetup":
        return "Visit Meetup";
      case "conference":
        return "Visit Conference";
      case "online":
        return "Visit Resource";
      case "tech-hub":
        return "Visit Hub";
      default:
        return "Visit Resource";
    }
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt={`${name} logo`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
            {name}
          </h3>
          {resource.type === "conference" &&
            (resource.conferenceDate || resource.cfpDate) && (
              <div className="flex shrink-0 flex-col gap-1">
                {resource.conferenceDate && (
                  <Badge
                    variant="secondary"
                    className="border-border bg-accent/80 text-xs text-accent-foreground"
                  >
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(resource.conferenceDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    )}
                  </Badge>
                )}
                {resource.cfpDate && (
                  <Badge
                    variant="secondary"
                    className="border-border bg-accent/80 text-xs text-accent-foreground"
                  >
                    <Calendar className="mr-1 h-3 w-3" />
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
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <ResourceTag key={index} tag={tag} index={index} />
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          asChild
          className="w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2"
          >
            {getButtonText()}
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

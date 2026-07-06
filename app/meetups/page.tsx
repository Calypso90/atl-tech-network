"use client";

import { Navigation } from "@/components/navigation";
import { ResourceCard } from "@/components/resource-card";
import { sampleMeetups } from "@/lib/sample-data";
import { ArrowLeft, Calendar, Users, MapPin, Filter, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function MeetupsPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    sampleMeetups.forEach((meetup) => {
      meetup.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, []);

  const filteredMeetups = useMemo(() => {
    if (selectedTags.length === 0) return sampleMeetups;
    return sampleMeetups.filter((meetup) =>
      selectedTags.some((tag) => meetup.tags.includes(tag)),
    );
  }, [selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        <section className="px-4 py-16 sm:px-6 lg:px-8 md:py-20">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:underline"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>

            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                ATLANTA TECH CALENDAR
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Local Meetup Groups
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                Connect with Atlanta&apos;s vibrant tech community through local
                meetup groups, workshops, and networking events that fit every
                skill level.
              </p>
            </div>

            <div className="mb-8 rounded-3xl border border-border bg-card/80 p-4 shadow-sm sm:p-6">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <Filter className="h-4 w-4" />
                    Filter by Technology
                    <span className="ml-2 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      {allTags.length}
                    </span>
                  </button>

                  {isFilterOpen && (
                    <div className="absolute left-0 top-full z-10 mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-xl">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">
                          Select Technologies
                        </h3>
                        <button
                          type="button"
                          onClick={() => setIsFilterOpen(false)}
                          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {allTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                              selectedTags.includes(tag)
                                ? "bg-primary text-primary-foreground"
                                : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {selectedTags.length > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Clear filters
                    </button>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredMeetups.length} of {sampleMeetups.length}{" "}
                    groups
                  </span>
                </div>
              </div>

              {selectedTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="rounded-full p-0.5 hover:bg-background"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card/80 p-6 text-center shadow-sm">
                <Calendar className="mx-auto mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Regular Events
                </h3>
                <p className="text-sm text-muted-foreground">
                  Weekly and monthly meetups with consistent schedules and
                  topics.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card/80 p-6 text-center shadow-sm">
                <Users className="mx-auto mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  All Skill Levels
                </h3>
                <p className="text-sm text-muted-foreground">
                  From beginners to experts, everyone is welcome to learn and
                  share.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card/80 p-6 text-center shadow-sm">
                <MapPin className="mx-auto mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  Local &amp; Virtual
                </h3>
                <p className="text-sm text-muted-foreground">
                  In-person networking with virtual options for remote
                  participation.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredMeetups.map((meetup) => (
                <ResourceCard key={meetup.id} resource={meetup} />
              ))}
            </div>

            {filteredMeetups.length === 0 && (
              <div className="py-16 text-center">
                <p className="mb-4 text-lg text-muted-foreground">
                  No meetups found for the selected technologies.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-semibold text-primary hover:underline"
                >
                  Clear filters to see all groups
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

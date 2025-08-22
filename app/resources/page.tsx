"use client"

import { Navigation } from "@/components/navigation"
import { ResourceCard } from "@/components/resource-card"
import { sampleOnlineResources } from "@/lib/sample-data"
import { ArrowLeft, BookOpen, Code, Zap, Filter, X } from "lucide-react"
import Link from "next/link"
import { useState, useMemo } from "react"

export default function OnlineResourcesPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    sampleOnlineResources.forEach((resource) => {
      resource.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [])

  const filteredResources = useMemo(() => {
    if (selectedTags.length === 0) return sampleOnlineResources
    return sampleOnlineResources.filter((resource) => selectedTags.some((tag) => resource.tags.includes(tag)))
  }, [selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSelectedTags([])
    setIsFilterOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
              Online Resources
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Level up your tech skills with these carefully curated online learning platforms. From beginner-friendly
              tutorials to advanced courses, start your coding journey or advance your career.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filter by Technology
                  <span className="text-xs bg-cyan-500 text-slate-900 px-2 py-1 rounded-full ml-2">
                    {allTags.length}
                  </span>
                </button>

                {isFilterOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white">Select Technologies</h3>
                        <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {allTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                              selectedTags.includes(tag)
                                ? "bg-cyan-500 text-slate-900 font-medium"
                                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {selectedTags.length > 0 && (
                  <button onClick={clearFilters} className="text-sm text-slate-400 hover:text-white transition-colors">
                    Clear filters
                  </button>
                )}
                <span className="text-sm text-slate-400">
                  Showing {filteredResources.length} of {sampleOnlineResources.length} resources
                </span>
              </div>
            </div>

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-cyan-500 text-slate-900 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button onClick={() => toggleTag(tag)} className="hover:bg-cyan-600 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <BookOpen className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Structured Learning</h3>
              <p className="text-slate-400 text-sm">Complete curricula and learning paths from beginner to job-ready</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <Code className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Hands-On Practice</h3>
              <p className="text-slate-400 text-sm">Interactive coding exercises and real-world project experience</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 text-center">
              <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Self-Paced</h3>
              <p className="text-slate-400 text-sm">
                Learn at your own speed with flexible schedules and lifetime access
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-400 text-lg mb-4">No resources found for the selected technologies.</p>
              <button onClick={clearFilters} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Clear filters to see all resources
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

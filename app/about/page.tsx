"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ExternalLink, Calendar, User, Github, Linkedin } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface BlogPost {
  title: string
  description: string
  url: string
  published_at: string
  cover_image?: string
  reading_time_minutes: number
}

export default function AboutPage() {
  const [latestPost, setLatestPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const response = await fetch("https://dev.to/api/articles?username=calypso_coding&per_page=1")
        const posts = await response.json()
        if (posts && posts.length > 0) {
          setLatestPost(posts[0])
        }
      } catch (error) {
        console.error("Failed to fetch latest blog post:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestPost()
  }, [])

  const socialLinks = [
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/calypso-hernandez/",
      icon: Linkedin,
      color: "hover:text-blue-400",
    },
    {
      name: "GitHub",
      url: "https://github.com/Calypso90",
      icon: Github,
      color: "hover:text-gray-300",
    },
    {
      name: "Dev.to",
      url: "https://dev.to/calypso_coding",
      icon: User,
      color: "hover:text-green-400",
    },
    {
      name: "Medium",
      url: "https://medium.com/@calypso_coding",
      icon: User,
      color: "hover:text-orange-400",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navigation />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="relative w-80 h-96 mx-auto mb-8">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-2xl bg-slate-900 p-2">
                  <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-slate-700/50">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/685eac59-8ddd-412e-805d-429171d6a53b.jpg-F6EO5hKVEQuTqEWQ9DHImF97LEa3la.jpeg"
                      alt="Calypso Hernandez"
                      fill
                      className="object-contain rounded-lg"
                      priority
                    />
                    {/* Corner tech elements */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-cyan-400"></div>
                    <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-cyan-400"></div>
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyan-400"></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyan-400"></div>
                  </div>
                </div>
              </div>
              {/* Floating tech elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-300"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              About Me
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Hi, I'm Calypso Hernandez - the creator of this Atlanta Tech Community resource hub
            </p>
          </div>

          {/* About Content */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">My Background</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  I'm a passionate software developer and tech community advocate based in Atlanta. With years of
                  experience in full-stack development, I've worked with various technologies including React, Node.js,
                  Python, and cloud platforms.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  My journey in tech has been shaped by the incredible communities and resources I've encountered along
                  the way. I believe in the power of knowledge sharing and community building to help others succeed in
                  their tech careers.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">Why I Created This</h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  I noticed that Atlanta's tech community information was scattered across different platforms, making
                  it difficult for people to discover all the amazing resources available in our city.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  This resource hub brings together meetups, conferences, learning platforms, and innovation spaces in
                  one place, making it easier for everyone to find what they're looking for and connect with our vibrant
                  tech community.
                </p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">Connect With Me</h2>
            <div className="flex justify-center gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700/50 transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 ${social.color}`}
                >
                  <social.icon className="w-5 h-5" />
                  <span className="font-medium">{social.name}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Latest Blog Post */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">Latest Blog Post</h2>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
              </div>
            ) : latestPost ? (
              <div className="space-y-4">
                {latestPost.cover_image && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={latestPost.cover_image || "/placeholder.svg"}
                      alt={latestPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white hover:text-cyan-400 transition-colors">
                    <a href={latestPost.url} target="_blank" rel="noopener noreferrer">
                      {latestPost.title}
                    </a>
                  </h3>
                  <p className="text-slate-300 mb-4 leading-relaxed">{latestPost.description}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(latestPost.published_at).toLocaleDateString()}
                    </div>
                    <div>{latestPost.reading_time_minutes} min read</div>
                  </div>
                  <a
                    href={latestPost.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >
                    Read Full Article
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Unable to load latest blog post. Check out my blog directly!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

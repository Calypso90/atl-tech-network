"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Github,
  Linkedin,
  User,
} from "lucide-react";
import { Navigation } from "@/components/navigation";

interface BlogPost {
  title: string;
  description: string;
  url: string;
  published_at: string;
  cover_image?: string;
  reading_time_minutes: number;
}

export default function AboutPage() {
  const [latestPost, setLatestPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const response = await fetch(
          "https://dev.to/api/articles?username=calypso_coding&per_page=1",
        );
        const posts = await response.json();
        if (posts && posts.length > 0) {
          setLatestPost(posts[0]);
        }
      } catch (error) {
        console.error("Failed to fetch latest blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPost();
  }, []);

  const socialLinks = [
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/calypso-hernandez/",
      icon: Linkedin,
      label: "Connect on LinkedIn",
    },
    {
      name: "GitHub",
      url: "https://github.com/Calypso90",
      icon: Github,
      label: "See projects on GitHub",
    },
    {
      name: "Dev.to",
      url: "https://dev.to/calypso_coding",
      icon: User,
      label: "Read on Dev.to",
    },
    {
      name: "Medium",
      url: "https://medium.com/@calypso_coding",
      icon: User,
      label: "Read on Medium",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="px-4 py-16 sm:px-6 lg:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-sm">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  ABOUT THE BUILDER
                </p>
                <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                  Connecting Atlanta&apos;s tech community in one place.
                </h1>
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                  Hi, I&apos;m Calypso Hernandez, and I created this Atlanta
                  Tech Community hub to make it easier for people to discover
                  events, learning resources, and welcoming spaces in the city.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-sm">
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  Why I Created This
                </h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  I noticed that Atlanta&apos;s tech community information was
                  scattered across many platforms, which made it difficult to
                  discover the people, events, and resources that mattered most.
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  This space brings together meetups, conferences, learning
                  resources, and community hubs so people can build connections
                  faster and feel more confident exploring the city&apos;s tech
                  ecosystem.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-sm">
                <div className="relative mx-auto mb-6 overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-sm sm:max-w-md">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/685eac59-8ddd-412e-805d-429171d6a53b.jpg-F6EO5hKVEQuTqEWQ9DHImF97LEa3la.jpeg"
                    alt="Calypso Hernandez"
                    width={800}
                    height={960}
                    className="h-auto w-full rounded-xl object-cover"
                    priority
                  />
                </div>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  My Background
                </h2>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  I came from technical theater, where I specialized in
                  lighting, sound programming, and automation. That experience
                  sharpened my problem-solving instincts and taught me how to
                  bring complex ideas to life.
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  Over time, that creative and systems-minded approach naturally
                  led me into the tech space, where I&apos;ve been building
                  communities and sharing resources ever since.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-sm">
                <h2 className="mb-5 text-2xl font-semibold text-foreground">
                  Connect With Me
                </h2>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <social.icon className="h-4 w-4" />
                      {social.name}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-border bg-card/80 p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold text-foreground">
              Latest Blog Post
            </h2>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            ) : latestPost ? (
              <div className="space-y-4">
                {latestPost.cover_image && (
                  <div className="relative h-48 overflow-hidden rounded-2xl border border-border bg-background">
                    <Image
                      src={latestPost.cover_image || "/placeholder.svg"}
                      alt={latestPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground transition-colors hover:text-primary">
                    <a
                      href={latestPost.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {latestPost.title}
                    </a>
                  </h3>
                  <p className="mb-4 leading-relaxed text-muted-foreground">
                    {latestPost.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {new Date(latestPost.published_at).toLocaleDateString()}
                    </div>
                    <div>{latestPost.reading_time_minutes} min read</div>
                  </div>
                  <a
                    href={latestPost.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 font-semibold text-primary transition-colors hover:underline"
                  >
                    Read Full Article
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Unable to load the latest blog post. Check out my blog directly.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

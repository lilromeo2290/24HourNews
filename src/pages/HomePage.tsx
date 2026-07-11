'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import BreakingNewsTicker from '@/components/public/BreakingNewsTicker'
import NewsCard from '@/components/public/NewsCard'
import AdBanner from '@/components/public/AdBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'

const FEATURED_CATEGORY_SLUGS = ['politics', 'business', 'sports', 'entertainment']

function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <Skeleton className="aspect-[16/9] w-full rounded-lg" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="aspect-video w-full rounded-lg" />
      </div>
    </div>
  )
}

function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const {
    isLoading,
    breakingNews,
    featuredArticles,
    pinnedArticle,
    latestNews,
    trendingNews,
    popularCategories,
    fetchHomeData,
    fetchCategories,
    categories,
    navigate,
    search,
    subscribeNewsletter,
  } = useStore()

  const [nlEmail, setNlEmail] = useState('')
  const [nlLoading, setNlLoading] = useState(false)

  useEffect(() => {
    fetchHomeData()
    fetchCategories()
  }, [fetchHomeData, fetchCategories])

  const handleNewsletter = async () => {
    if (!nlEmail || !nlEmail.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }
    setNlLoading(true)
    try {
      await subscribeNewsletter(nlEmail)
      toast.success('Subscribed! Thank you for joining our newsletter.')
      setNlEmail('')
    } catch {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setNlLoading(false)
    }
  }

  // Get articles by category slug for the "More from" sections
  const getCategoryArticles = (slug: string) => {
    return latestNews.filter((a) => a.category?.slug === slug).slice(0, 3)
  }

  const getCategoryInfo = (slug: string) => {
    return categories.find((c) => c.slug === slug)
  }

  // Loading state
  if (isLoading && latestNews.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
        <HeroSkeleton />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-6 w-48" />
        <CardGridSkeleton />
      </div>
    )
  }

  const heroArticle = featuredArticles[0]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-8">
      {/* Breaking News Ticker */}
      {breakingNews && breakingNews.length > 0 && <BreakingNewsTicker />}

      {/* Hero Section + Trending Sidebar */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Full-width hero */}
          <div className="lg:col-span-2">
            {heroArticle ? (
              <NewsCard article={heroArticle} variant="hero" />
            ) : (
              <Skeleton className="aspect-[16/9] w-full rounded-lg" />
            )}
          </div>

          {/* Trending sidebar */}
          {trendingNews.length > 0 && (
            <aside className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Trending</h3>
              </div>
              <div className="divide-y">
                {trendingNews.slice(0, 6).map((article, i) => (
                  <div key={article.id} className="relative">
                    <span className="absolute -left-1 top-2 text-2xl font-black text-muted-foreground/20">
                      {i + 1}
                    </span>
                    <div className="pl-5">
                      <NewsCard article={article} variant="compact" />
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* Banner Ad */}
      <AdBanner position="banner" />

      {/* Latest News + Sidebar */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content: Latest News */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Latest News</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ type: 'search' })}
              >
                View All
              </Button>
            </div>
            {latestNews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {latestNews.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <CardGridSkeleton count={4} />
            )}
          </div>

          {/* Right sidebar */}
          <aside className="space-y-6">
            {/* Sidebar Ad */}
            <AdBanner position="sidebar" />

            {/* Popular Categories */}
            {popularCategories.length > 0 && (
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-bold mb-3">Popular Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {popularCategories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      style={{ borderColor: cat.color, color: cat.color }}
                      onClick={() =>
                        navigate({
                          type: 'category',
                          slug: cat.slug,
                          categoryName: cat.name,
                        })
                      }
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* More from [Category] sections */}
      {FEATURED_CATEGORY_SLUGS.map((slug) => {
        const articles = getCategoryArticles(slug)
        const catInfo = getCategoryInfo(slug)
        if (articles.length === 0 || !catInfo) return null

        return (
          <section key={slug}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-1 rounded-full"
                  style={{ backgroundColor: catInfo.color }}
                />
                <h2 className="text-xl font-bold">More from {catInfo.name}</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate({
                    type: 'category',
                    slug: catInfo.slug,
                    categoryName: catInfo.name,
                  })
                }
              >
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )
      })}

      {/* Newsletter Section */}
      <section className="rounded-lg p-8 text-white" style={{ backgroundColor: '#003050' }}>
        <div className="mx-auto max-w-xl text-center">
          <img src="/logo.jpg" alt="" className="mx-auto mb-3 h-10 w-10 rounded opacity-80 object-cover" />
          <h2 className="text-2xl font-bold mb-2">Stay Informed</h2>
          <p className="mb-6 text-sm text-white/80">
            Subscribe to our daily newsletter and never miss the most important
            stories from Ghana and around the world.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNewsletter()}
                className="pl-9 bg-white/10 border-white/20 placeholder:text-white/50 text-white focus-visible:ring-white/30"
              />
            </div>
            <Button
              onClick={handleNewsletter}
              disabled={nlLoading}
              className="shrink-0 text-white"
              style={{ backgroundColor: '#f08010' }}
            >
              <Send className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Ad */}
      <AdBanner position="footer" />
    </div>
  )
}
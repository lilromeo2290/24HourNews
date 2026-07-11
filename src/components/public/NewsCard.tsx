'use client'

import { useStore, type Article } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye, User } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface NewsCardProps {
  article: Article
  variant?: 'default' | 'horizontal' | 'compact' | 'hero'
}

export default function NewsCard({ article, variant = 'default' }: NewsCardProps) {
  const { navigate } = useStore()

  const handleClick = () => {
    navigate({ type: 'article', slug: article.slug })
  }

  const dateDisplay = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })

  const absoluteDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'MMM d, yyyy')
    : format(new Date(article.createdAt), 'MMM d, yyyy')

  const categoryBadge = (
    <span
      className="inline-block rounded px-2 py-0.5 text-[11px] font-semibold text-white leading-tight"
      style={{ backgroundColor: article.category?.color ?? '#888' }}
    >
      {article.category?.name ?? 'Uncategorized'}
    </span>
  )

  const metaInfo = (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {article.author?.name && (
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {article.author.name}
        </span>
      )}
      <span title={absoluteDate}>{dateDisplay}</span>
      {article.readingTime > 0 && (
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {article.readingTime} min read
        </span>
      )}
    </div>
  )

  if (variant === 'hero') {
    return (
      <button
        onClick={handleClick}
        className="group relative block w-full overflow-hidden rounded-lg cursor-pointer text-left"
      >
        <div className="aspect-[16/9] w-full">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-4xl font-bold text-muted-foreground/30">N</span>
            </div>
          )}
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <h2 className="mb-2 text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-white line-clamp-2">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="hidden sm:block text-sm text-white/80 line-clamp-2">
              {article.excerpt}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-white/70">
            {article.author?.name && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {article.author.name}
              </span>
            )}
            <span>{absoluteDate}</span>
            {article.readingTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readingTime} min
              </span>
            )}
          </div>
        </div>
      </button>
    )
  }

  if (variant === 'horizontal') {
    return (
      <button
        onClick={handleClick}
        className="group flex gap-4 cursor-pointer text-left w-full"
      >
        <div className="relative shrink-0 w-40 sm:w-48 aspect-video overflow-hidden rounded-lg">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-2xl font-bold text-muted-foreground/30">N</span>
            </div>
          )}
          <div className="absolute top-2 left-2">{categoryBadge}</div>
        </div>
        <div className="flex flex-col justify-center min-w-0 py-1">
          <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2 hidden sm:block">
              {article.excerpt}
            </p>
          )}
          <div className="mt-2">{metaInfo}</div>
        </div>
      </button>
    )
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className="group flex items-start gap-3 cursor-pointer text-left w-full py-2 border-b last:border-b-0"
      >
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[11px] text-muted-foreground mb-1">{absoluteDate}</span>
          <h4 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h4>
        </div>
        {article.viewCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
            <Eye className="h-3 w-3" />
            {article.viewCount >= 1000
              ? `${(article.viewCount / 1000).toFixed(1)}k`
              : article.viewCount}
          </span>
        )}
      </button>
    )
  }

  // Default variant
  return (
    <button
      onClick={handleClick}
      className="group block cursor-pointer text-left w-full overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-4xl font-bold text-muted-foreground/30">N</span>
          </div>
        )}
        <div className="absolute top-2 left-2">{categoryBadge}</div>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
            {article.excerpt}
          </p>
        )}
        <div className="mt-3">{metaInfo}</div>
      </div>
    </button>
  )
}
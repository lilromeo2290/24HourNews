'use client'

import { useStore } from '@/lib/store'
import { Zap } from 'lucide-react'

export default function BreakingNewsTicker() {
  const { breakingNews, navigate } = useStore()

  if (!breakingNews || breakingNews.length === 0) return null

  return (
    <div className="relative overflow-hidden text-white" style={{ backgroundColor: '#003050' }}>
      <div className="flex h-8 items-center">
        {/* BREAKING label */}
        <div
          className="relative z-10 flex shrink-0 items-center gap-1.5 px-4 h-full font-bold text-xs uppercase tracking-wider"
          style={{ backgroundColor: '#f08010' }}
        >
          <Zap className="h-3.5 w-3.5 fill-white text-white" />
          <span>Breaking</span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
        </div>

        {/* Scrolling headlines */}
        <div className="relative flex-1 overflow-hidden ml-4">
          <div className="animate-ticker flex whitespace-nowrap items-center">
            {breakingNews.map((article, i) => (
              <button
                key={article.id}
                onClick={() => navigate({ type: 'article', slug: article.slug })}
                className="inline-flex items-center gap-2 px-6 text-sm hover:underline cursor-pointer"
              >
                <span className="font-semibold">{article.title}</span>
                {i < breakingNews.length - 1 && (
                  <span className="mx-2 opacity-50">●</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
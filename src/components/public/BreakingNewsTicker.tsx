'use client'

import { useStore } from '@/lib/store'
import { Zap } from 'lucide-react'

export default function BreakingNewsTicker() {
  const { breakingNews, navigate } = useStore()

  if (!breakingNews || breakingNews.length === 0) return null

  return (
    <div className="relative overflow-hidden bg-red-700 text-white">
      <div className="flex h-8 items-center">
        {/* BREAKING label */}
        <div className="relative z-10 flex shrink-0 items-center gap-1.5 bg-red-900 px-4 h-full font-bold text-xs uppercase tracking-wider">
          <Zap className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
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
                  <span className="text-red-300 mx-2">●</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
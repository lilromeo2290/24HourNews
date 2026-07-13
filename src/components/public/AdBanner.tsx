'use client'

import { useStore } from '@/lib/store'

interface AdBannerProps {
  position: 'banner' | 'sidebar' | 'footer' | 'in-article' | 'trending'
}

export default function AdBanner({ position }: AdBannerProps) {
  const { advertisements } = useStore()

  const ads = advertisements[position] ?? []
  const ad = ads.find((a) => a.isActive)
  if (!ad) return null

  const sizeClasses: Record<string, string> = {
    banner: 'w-full max-w-7xl mx-auto',
    sidebar: 'w-full',
    footer: 'w-full max-w-2xl mx-auto',
    'in-article': 'w-full my-6',
    trending: 'w-full',
  }

  const inner = (
    <img
      src={ad.imageUrl}
      alt={ad.title}
      className={`h-auto w-full object-contain rounded-lg ${position === 'sidebar' ? 'max-h-[250px]' : position === 'trending' ? 'max-h-[250px]' : position === 'banner' ? 'max-h-[90px]' : 'max-h-[120px]'}`}
    />
  )

  return (
    <div className={`ad-banner ${sizeClasses[position] ?? 'w-full'}`}>
      {ad.linkUrl ? (
        <a
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block"
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  )
}
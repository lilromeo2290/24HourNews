'use client'

import { useState, useRef } from 'react'

interface Clip {
  id: number
  title: string
  thumbnail: string
  duration: string
  videoUrl?: string
}

const sampleClips: Clip[] = [
  {
    id: 1,
    title: 'Market Fire Outbreak in Accra',
    thumbnail: 'https://picsum.photos/seed/clip-fire/400/225',
    duration: '0:45',
  },
  {
    id: 2,
    title: 'Floods Hit Kumasi Streets',
    thumbnail: 'https://picsum.photos/seed/clip-flood/400/225',
    duration: '1:12',
  },
  {
    id: 3,
    title: 'New Highway Inaugurated',
    thumbnail: 'https://picsum.photos/seed/clip-road/400/225',
    duration: '0:58',
  },
  {
    id: 4,
    title: 'Sports Fans Celebrate Victory',
    thumbnail: 'https://picsum.photos/seed/clip-sports/400/225',
    duration: '0:32',
  },
]

export default function ClipsWidget() {
  const [activeClip, setActiveClip] = useState<Clip | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  if (activeClip && activeClip.videoUrl) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Clips</p>
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
          <video
            ref={videoRef}
            src={activeClip.videoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={() => setActiveClip(null)}
          className="text-xs text-primary hover:underline"
        >
          &larr; Back to clips
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Clips</p>
      <div className="grid grid-cols-2 gap-2">
        {sampleClips.map((clip) => (
          <button
            key={clip.id}
            className="relative group rounded-lg overflow-hidden aspect-video bg-muted cursor-pointer"
            onClick={() => setActiveClip(clip)}
          >
            <img
              src={clip.thumbnail}
              alt={clip.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <svg
                  className="w-3.5 h-3.5 text-[#003050] ml-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {/* Duration badge */}
            <span className="absolute bottom-1 right-1 text-[10px] font-medium bg-black/70 text-white px-1.5 py-0.5 rounded">
              {clip.duration}
            </span>
          </button>
        ))}
      </div>
      {/* Clip titles list */}
      <div className="space-y-1.5 mt-1">
        {sampleClips.map((clip) => (
          <button
            key={clip.id}
            onClick={() => setActiveClip(clip)}
            className="block w-full text-left text-xs text-foreground/80 hover:text-foreground transition-colors truncate"
            title={clip.title}
          >
            {clip.title}
          </button>
        ))}
      </div>
    </div>
  )
}
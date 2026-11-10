'use client'

import { useState } from 'react'
import {
  GALLERY_ASPECT_CLASS,
  GALLERY_COLUMNS_CLASS,
  GALLERY_GAP_CLASS,
  GALLERY_ROUNDED_CLASS,
  normalizeGalleryLayout,
  type GalleryLayout,
} from './eventLayout'

interface EventGalleryProps {
  images: string[]
  layout?: GalleryLayout | null
  title?: string
  className?: string
}

export function EventGallery({ images, layout, title = 'Event memory', className = '' }: EventGalleryProps) {
  const config = normalizeGalleryLayout(layout)
  const sources = images.filter(Boolean)
  if (sources.length === 0) return null

  const hasAspect = config.aspect !== 'auto'
  const heroEnabled = config.hero && sources.length > 1
  const fitClass = config.fit === 'cover' ? 'object-cover' : 'object-contain'
  const imageClass = hasAspect
    ? `block h-full w-full ${fitClass}`
    : 'block h-auto w-full object-contain'

  return (
    <div
      className={`grid ${GALLERY_COLUMNS_CLASS[config.columns]} ${GALLERY_GAP_CLASS[config.gap]} ${className}`}
      data-gallery-template={config.template}
    >
      {sources.map((src, index) => {
        const isHero = heroEnabled && index === 0
        const spanClass = isHero
          ? 'sm:col-span-2 lg:col-span-full'
          : config.columns > 2 && index % 5 === 0
            ? 'sm:col-span-2'
            : ''

        return (
          <GalleryImage
            key={`${src}-${index}`}
            src={src}
            alt={`${title} photo ${index + 1}`}
            className={`${spanClass} ${GALLERY_ROUNDED_CLASS[config.rounded]}`}
            imageClassName={imageClass}
            aspectClass={GALLERY_ASPECT_CLASS[config.aspect]}
            hero={isHero && hasAspect}
          />
        )
      })}
    </div>
  )
}

function GalleryImage({
  src,
  alt,
  className,
  imageClassName,
  aspectClass,
  hero,
}: {
  src: string
  alt: string
  className: string
  imageClassName: string
  aspectClass: string
  hero: boolean
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <figure
      className={`relative overflow-hidden border border-zinc-200/70 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {!loaded && <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800" />}
      <div className={aspectClass ? `${aspectClass} w-full ${hero ? 'max-h-[560px]' : ''}` : ''}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`${imageClassName} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
    </figure>
  )
}

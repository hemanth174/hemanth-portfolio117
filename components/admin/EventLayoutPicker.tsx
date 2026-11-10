'use client'

import type { ReactNode } from 'react'
import { Check, Grid2x2, LayoutGrid, Rows3, SlidersHorizontal } from 'lucide-react'
import { EventGallery } from '@/components/Events/EventGallery'
import {
  GALLERY_ASPECTS,
  GALLERY_TEMPLATES,
  presetGalleryLayout,
  type GalleryAspect,
  type GalleryColumns,
  type GalleryFit,
  type GalleryGap,
  type GalleryLayout,
  type GalleryRounded,
} from '@/components/Events/eventLayout'

interface EventLayoutPickerProps {
  images: string[]
  layout: GalleryLayout
  onChange: (layout: GalleryLayout) => void
  title?: string
}

const templateIcons = {
  editorial: LayoutGrid,
  mosaic: Grid2x2,
  stacked: Rows3,
} as const

const columnOptions: GalleryColumns[] = [1, 2, 3, 4]
const gapOptions: { value: GalleryGap; label: string }[] = [
  { value: 'sm', label: 'Tight' },
  { value: 'md', label: 'Normal' },
  { value: 'lg', label: 'Wide' },
]
const roundedOptions: { value: GalleryRounded; label: string }[] = [
  { value: 'md', label: 'Soft' },
  { value: 'xl', label: 'Round' },
  { value: '3xl', label: 'Pill' },
]

export function EventLayoutPicker({ images, layout, onChange, title }: EventLayoutPickerProps) {
  const hasImages = images.length > 0

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 p-2 dark:border-zinc-800 dark:bg-zinc-900/60">
        {hasImages ? (
          <EventGallery images={images} layout={layout} title={title} className="max-h-72 overflow-y-auto" />
        ) : (
          <div className="grid h-28 place-items-center rounded-lg border border-dashed border-zinc-300 bg-white text-center dark:border-zinc-700 dark:bg-zinc-950">
            <div>
              <LayoutGrid size={20} className="mx-auto mb-1.5 text-zinc-400" />
              <p className="font-mono text-[10px] text-zinc-500">Add photos to preview the story layout</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 font-mono text-[10px] font-bold tracking-[.18em] text-zinc-500">LAYOUT TEMPLATES</p>
        <div className="grid grid-cols-3 gap-2">
          {GALLERY_TEMPLATES.map((template) => {
            const Icon = templateIcons[template.id]
            const active = layout.template === template.id
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onChange(presetGalleryLayout(template.id))}
                title={template.description}
                className={`group relative rounded-xl border p-2.5 text-left transition-all ${
                  active
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : 'border-zinc-200 bg-white hover:border-yellow-300 dark:border-zinc-800 dark:bg-zinc-950'
                }`}
              >
                <span className={`mb-1.5 grid h-7 w-7 place-items-center rounded-lg ${active ? 'bg-yellow-400 text-black' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900'}`}>
                  <Icon size={14} />
                </span>
                <span className="block font-mono text-[10px] font-bold text-zinc-800 dark:text-zinc-100">{template.name}</span>
                {active && <Check size={12} className="absolute right-2 top-2 text-yellow-500" />}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...layout, template: 'custom' })}
          className={`mt-2 flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 transition-all ${
            layout.template === 'custom'
              ? 'border-yellow-400 bg-yellow-400/10'
              : 'border-zinc-200 bg-white hover:border-yellow-300 dark:border-zinc-800 dark:bg-zinc-950'
          }`}
        >
          <span className="flex items-center gap-2 font-mono text-[10px] font-bold text-zinc-800 dark:text-zinc-100">
            <span className={`grid h-7 w-7 place-items-center rounded-lg ${layout.template === 'custom' ? 'bg-yellow-400 text-black' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900'}`}>
              <SlidersHorizontal size={14} />
            </span>
            CUSTOM LAYOUT
          </span>
          <span className="font-mono text-[9px] text-zinc-400">{layout.template === 'custom' ? 'ACTIVE' : 'FINE-TUNE'}</span>
        </button>
      </div>

      {layout.template === 'custom' && (
        <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <ControlRow label="Columns">
            {columnOptions.map((value) => (
              <Pill key={value} active={layout.columns === value} onClick={() => onChange({ ...layout, columns: value })}>
                {value}
              </Pill>
            ))}
          </ControlRow>

          <ControlRow label="Image fit">
            {(['contain', 'cover'] as GalleryFit[]).map((value) => (
              <Pill key={value} active={layout.fit === value} onClick={() => onChange({ ...layout, fit: value })}>
                {value === 'contain' ? 'No crop' : 'Fill'}
              </Pill>
            ))}
          </ControlRow>

          <ControlRow label="Shape">
            {GALLERY_ASPECTS.map((option) => (
              <Pill key={option.value} active={layout.aspect === option.value} onClick={() => onChange({ ...layout, aspect: option.value as GalleryAspect })}>
                {option.label}
              </Pill>
            ))}
          </ControlRow>

          <ControlRow label="Spacing">
            {gapOptions.map((option) => (
              <Pill key={option.value} active={layout.gap === option.value} onClick={() => onChange({ ...layout, gap: option.value })}>
                {option.label}
              </Pill>
            ))}
          </ControlRow>

          <ControlRow label="Corners">
            {roundedOptions.map((option) => (
              <Pill key={option.value} active={layout.rounded === option.value} onClick={() => onChange({ ...layout, rounded: option.value })}>
                {option.label}
              </Pill>
            ))}
          </ControlRow>

          <ControlRow label="Hero image">
            <Pill active={layout.hero} onClick={() => onChange({ ...layout, hero: true })}>On</Pill>
            <Pill active={!layout.hero} onClick={() => onChange({ ...layout, hero: false })}>Off</Pill>
          </ControlRow>
        </div>
      )}
    </div>
  )
}

function ControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-16 shrink-0 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 font-mono text-[9px] font-bold transition-all ${
        active
          ? 'border-yellow-400 bg-yellow-400 text-black'
          : 'border-zinc-200 text-zinc-500 hover:border-yellow-300 dark:border-zinc-700 dark:text-zinc-400'
      }`}
    >
      {children}
    </button>
  )
}

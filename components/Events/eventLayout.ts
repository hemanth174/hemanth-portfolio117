export type GalleryLayoutTemplate = 'editorial' | 'mosaic' | 'stacked' | 'custom'
export type GalleryFit = 'contain' | 'cover'
export type GalleryAspect = 'auto' | 'square' | 'video' | 'portrait' | 'wide'
export type GalleryGap = 'sm' | 'md' | 'lg'
export type GalleryRounded = 'md' | 'xl' | '3xl'
export type GalleryColumns = 1 | 2 | 3 | 4

export interface GalleryLayout {
  template: GalleryLayoutTemplate
  fit: GalleryFit
  aspect: GalleryAspect
  columns: GalleryColumns
  gap: GalleryGap
  rounded: GalleryRounded
  hero: boolean
}

export const DEFAULT_GALLERY_LAYOUT: GalleryLayout = {
  template: 'editorial',
  fit: 'contain',
  aspect: 'auto',
  columns: 2,
  gap: 'md',
  rounded: 'xl',
  hero: true,
}

const PRESETS: Record<Exclude<GalleryLayoutTemplate, 'custom'>, GalleryLayout> = {
  editorial: { template: 'editorial', fit: 'contain', aspect: 'auto', columns: 2, gap: 'md', rounded: 'xl', hero: true },
  mosaic: { template: 'mosaic', fit: 'contain', aspect: 'square', columns: 3, gap: 'sm', rounded: 'xl', hero: true },
  stacked: { template: 'stacked', fit: 'contain', aspect: 'auto', columns: 1, gap: 'lg', rounded: '3xl', hero: false },
}

export const GALLERY_TEMPLATES: { id: Exclude<GalleryLayoutTemplate, 'custom'>; name: string; description: string; style: GalleryLayout }[] = [
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Full-width hero followed by a two-column grid. Images keep their natural shape.',
    style: PRESETS.editorial,
  },
  {
    id: 'mosaic',
    name: 'Mosaic',
    description: 'Hero plus three compact square tiles. Full image visible, no cropping.',
    style: PRESETS.mosaic,
  },
  {
    id: 'stacked',
    name: 'Stacked',
    description: 'One image per row at full width. Best for tall photos and detailed shots.',
    style: PRESETS.stacked,
  },
]

export const GALLERY_ASPECTS: { value: GalleryAspect; label: string }[] = [
  { value: 'auto', label: 'Natural' },
  { value: 'square', label: 'Square' },
  { value: 'video', label: '16:9' },
  { value: 'portrait', label: '3:4' },
  { value: 'wide', label: '21:9' },
]

const templateIds = new Set<GalleryLayoutTemplate>(['editorial', 'mosaic', 'stacked', 'custom'])
const fitIds = new Set<GalleryFit>(['contain', 'cover'])
const aspectIds = new Set<GalleryAspect>(['auto', 'square', 'video', 'portrait', 'wide'])
const gapIds = new Set<GalleryGap>(['sm', 'md', 'lg'])
const roundedIds = new Set<GalleryRounded>(['md', 'xl', '3xl'])
const columnIds = new Set<GalleryColumns>([1, 2, 3, 4])

const pick = <T extends string>(value: unknown, allowed: Set<T>, fallback: T): T =>
  typeof value === 'string' && allowed.has(value as T) ? (value as T) : fallback

export function normalizeGalleryLayout(value: unknown): GalleryLayout {
  if (!value || typeof value !== 'object') return { ...DEFAULT_GALLERY_LAYOUT }
  const raw = value as Record<string, unknown>

  const template = pick(raw.template, templateIds, DEFAULT_GALLERY_LAYOUT.template)
  const base = template !== 'custom' ? PRESETS[template] : DEFAULT_GALLERY_LAYOUT

  const columns = typeof raw.columns === 'number' && columnIds.has(raw.columns as GalleryColumns)
    ? (raw.columns as GalleryColumns)
    : base.columns

  return {
    template,
    fit: pick(raw.fit, fitIds, base.fit),
    aspect: pick(raw.aspect, aspectIds, base.aspect),
    columns,
    gap: pick(raw.gap, gapIds, base.gap),
    rounded: pick(raw.rounded, roundedIds, base.rounded),
    hero: typeof raw.hero === 'boolean' ? raw.hero : base.hero,
  }
}

export function presetGalleryLayout(template: Exclude<GalleryLayoutTemplate, 'custom'>): GalleryLayout {
  return { ...PRESETS[template] }
}

export function isGalleryLayout(value: unknown): value is GalleryLayout {
  return Boolean(value && typeof value === 'object' && templateIds.has((value as { template?: GalleryLayoutTemplate }).template as GalleryLayoutTemplate))
}

export const GALLERY_GAP_CLASS: Record<GalleryGap, string> = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-5',
}

export const GALLERY_ROUNDED_CLASS: Record<GalleryRounded, string> = {
  md: 'rounded-xl',
  xl: 'rounded-2xl',
  '3xl': 'rounded-[2rem]',
}

export const GALLERY_COLUMNS_CLASS: Record<GalleryColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
}

export const GALLERY_ASPECT_CLASS: Record<GalleryAspect, string> = {
  auto: '',
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  wide: 'aspect-[21/9]',
}

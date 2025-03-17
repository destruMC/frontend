import type { File } from '@/types/file'
import type { User, UserPreview } from '@/types/user'

export type StructurePreview = {
  id: string
  name: string
  image: string
  creator: string
}

export type Structure = {
  id: string
  name: string
  summary: string
  description: string
  files: File[]
  images: File[]
  creators: UserPreview[]
  created: Date
}

export type UserRole = 'user' | 'member' | 'admin'

export type JalurCategory = 'essay_only' | 'prestasi_only' | 'hybrid'

export type PackageTier = 'review' | 'dokumen' | 'menyeluruh'

export type RegistrationStatus = 'pending' | 'confirmed' | 'rejected' | 'expired'

export type ContentType = 'video' | 'text' | 'pdf' | 'template'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  school: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Package {
  id: string
  name: string
  category: JalurCategory
  tier: PackageTier
  price: number
  addon_price: number
  description: string | null
  features: string[] | null
  is_active: boolean
  created_at: string
}

export interface Jalur {
  id: string
  name: string
  ptn: string
  category: JalurCategory
  description: string | null
  is_active: boolean
  created_at: string
}

export interface Registration {
  id: string
  user_id: string
  package_id: string
  jalur_utama_id: string
  addon_jalur_ids: string[] | null
  total_price: number
  status: RegistrationStatus
  payment_proof: string | null
  payment_method: string
  confirmed_at: string | null
  confirmed_by: string | null
  notes: string | null
  wa_group_link: string | null
  created_at: string
  updated_at: string
  // joined
  profiles?: Profile
  packages?: Package
  jalur?: Jalur
}

export interface Module {
  id: string
  title: string
  description: string | null
  category: JalurCategory | 'general'
  order_index: number
  is_active: boolean
  created_at: string
  thumbnail_url?: string | null
  file_url?: string | null
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  description?: string | null
  content_type: ContentType
  content_url: string | null
  content_body: string | null
  file_url?: string | null
  thumbnail_url?: string | null
  order_index: number
  is_active: boolean
  created_at: string
}

// Form types
export interface RegistrationFormData {
  category: JalurCategory
  package_id: string
  tier: PackageTier
  jalur_utama_id: string
  addon_jalur_ids: string[]
  total_price: number
  full_name: string
  email: string
  phone: string
  school: string
  payment_proof_url: string
}

// Static data types
export interface JalurStatic {
  id: string
  name: string
  ptn: string
  category: JalurCategory
  closed?: boolean
}

export interface PricingMap {
  review: number
  dokumen: number
  menyeluruh: number
}

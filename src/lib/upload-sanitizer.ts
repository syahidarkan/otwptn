/**
 * upload-sanitizer.ts
 * Enterprise-grade validation and sanitization for student essay uploads & documents.
 * Checks MIME types, magic numbers (byte signatures), and size limits.
 */

export interface ValidationResult {
  valid: boolean
  error?: string
  sanitizedName?: string
  detectedType?: string
}

// Magic byte signatures for file headers
const MAGIC_SIGNATURES: Record<string, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  png: [0x89, 0x50, 0x4e, 0x47], // PNG
  jpg: [0xff, 0xd8, 0xff],       // JPEG
  docx: [0x50, 0x4b, 0x03, 0x04], // ZIP / DOCX
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg',
  'image/png',
  'image/webp',
])

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10 MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024     // 5 MB

/**
 * Sanitize filename to prevent directory traversal & dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  // Strip path traversal attempts and keep alphanumeric, dashes, dots, and underscores
  const clean = filename.replace(/^.*[\\\/]/, '').replace(/[^a-zA-Z0-9._-]/g, '_')
  return clean.length > 80 ? clean.slice(0, 80) : clean
}

/**
 * Validate file against size, MIME, extension, and binary magic bytes
 */
export async function validateUploadedFile(file: File): Promise<ValidationResult> {
  const sanitizedName = sanitizeFilename(file.name)
  const ext = sanitizedName.split('.').pop()?.toLowerCase() || ''

  // 1. Check size
  const isImage = file.type.startsWith('image/')
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE
  if (file.size > maxSize) {
    const maxMb = maxSize / (1024 * 1024)
    return {
      valid: false,
      error: `Ukuran file melebihi batas maksimal ${maxMb}MB. Silakan kompres berkas Anda terlebih dahulu.`,
    }
  }

  // 2. Check extension
  const allowedExts = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp']
  if (!allowedExts.includes(ext)) {
    return {
      valid: false,
      error: `Format .${ext} tidak diizinkan. Harap unggah format PDF, DOCX, atau Foto (JPG/PNG).`,
    }
  }

  // 3. Check declared MIME type
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      error: `Tipe file (${file.type}) tidak valid untuk keamanan sistem.`,
    }
  }

  // 4. Magic number inspection via first bytes
  try {
    const buffer = await file.slice(0, 8).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    if (ext === 'pdf') {
      const match = MAGIC_SIGNATURES.pdf.every((b, i) => bytes[i] === b)
      if (!match) return { valid: false, error: 'File PDF rusak atau dimodifikasi secara mencurigakan.' }
    } else if (ext === 'docx') {
      const match = MAGIC_SIGNATURES.docx.every((b, i) => bytes[i] === b)
      if (!match) return { valid: false, error: 'File Word DOCX tidak valid.' }
    } else if (ext === 'png') {
      const match = MAGIC_SIGNATURES.png.every((b, i) => bytes[i] === b)
      if (!match) return { valid: false, error: 'File gambar PNG tidak valid.' }
    } else if (ext === 'jpg' || ext === 'jpeg') {
      const match = MAGIC_SIGNATURES.jpg.every((b, i) => bytes[i] === b)
      if (!match) return { valid: false, error: 'File gambar JPEG tidak valid.' }
    }
  } catch (err: any) {
    console.warn('Magic byte inspection skipped:', err)
  }

  return {
    valid: true,
    sanitizedName,
    detectedType: file.type || ext,
  }
}

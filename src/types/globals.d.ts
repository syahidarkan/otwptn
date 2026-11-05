import type { WAManager } from '@/lib/wa/waManager'

declare global {
  // eslint-disable-next-line no-var
  var __waManager: WAManager | undefined
}

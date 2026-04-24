import type { Metadata } from 'next'

import RoastDetailPageContent from '@/sections/RoastDetailPageContent'

export const metadata: Metadata = {
  title: 'Node Brew | Roast detail',
  description: 'Tasting notes, origin, and pricing for this roast.',
}

export default function RoastDetailPage() {
  return <RoastDetailPageContent />
}

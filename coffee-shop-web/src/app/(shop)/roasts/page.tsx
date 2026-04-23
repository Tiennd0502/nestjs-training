import type { Metadata } from 'next'

import RoastsPageContent from '@/sections/RoastsPageContent'

export const metadata: Metadata = {
  title: 'Node Brew | Roast Collections',
  description:
    'Explore curated roast profiles with flexible filters for price, roast level, and collection style.',
}

export default function RoastsPage() {
  return <RoastsPageContent />
}

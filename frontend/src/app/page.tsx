'use client'

import { DateTemplateBuilder } from '@/components/DateTemplateBuilder'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <DateTemplateBuilder />
      </div>
    </div>
  )
}

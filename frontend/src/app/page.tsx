'use client'

import { useState } from 'react'
import type { ScreeningCriteria as ScreeningCriteriaType } from '@/types'
import { DateTemplateBuilder } from '@/components/DateTemplateBuilder'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [criteria, setCriteria] = useState<ScreeningCriteriaType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <DateTemplateBuilder
          loading={isLoading}
          onGenerate={async ({ prompt: builtPrompt, criteria: builtCriteria }) => {
            setIsLoading(true)
            try {
              setPrompt(builtPrompt)
              setCriteria(builtCriteria)
            } finally {
              setIsLoading(false)
            }
          }}
        />

        {/* Generated Output Section */}
        {prompt && (
          <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">✅ 最终结果</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(prompt)
                    // Better feedback
                    const button = document.activeElement as HTMLButtonElement
                    const originalText = button.textContent
                    button.textContent = '✅ 已复制!'
                    button.style.backgroundColor = '#10b981'
                    setTimeout(() => {
                      button.textContent = originalText
                      button.style.backgroundColor = ''
                    }, 2000)
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  📋 复制
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([prompt], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `股票筛选-${new Date().toISOString().split('T')[0]}.txt`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
                >
                  💾 下载
                </button>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm font-medium text-green-800 mb-2 flex items-center justify-between">
                <span>📋 筛选条件 ({prompt.length} 字符)</span>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200 max-h-60 overflow-y-auto">
                <div className="text-lg leading-relaxed text-gray-900 font-semibold whitespace-pre-wrap">
                  {prompt}
                </div>
              </div>
            </div>

            <div className="mt-3 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="font-medium">💡 复制上方文本到股票软件的"条件选股"功能中使用</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

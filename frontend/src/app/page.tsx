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
              <div className="relative">
                <textarea
                  value={prompt}
                  readOnly
                  className="w-full min-h-40 max-h-96 bg-white border border-green-300 rounded-lg p-4 resize-y focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base leading-loose tracking-wide font-mono"
                  style={{ 
                    height: '200px',
                    lineHeight: '1.8',
                    letterSpacing: '0.025em'
                  }}
                />
                <div className="absolute bottom-1 right-1 text-gray-400 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M16 16V10h-2v4h-4v2h6zM10 16v-2H6v2h4zM16 6V2h-4v2h2v2h2zM6 4V2H2v4h2V4h2z"/>
                    <path d="M9 9l2-2 2 2-2 2-2-2z"/>
                  </svg>
                </div>
              </div>
              <div className="flex justify-between text-sm text-green-600 mt-2">
                <span>可直接复制到股票软件使用 • 拖拽右下角调整高度</span>
                <span>{prompt.length} 字符</span>
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

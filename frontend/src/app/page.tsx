'use client'

import { useState } from 'react'
import type { ScreeningCriteria as ScreeningCriteriaType } from '@/types'
import { PromptBuilder } from '@/components/PromptBuilder'

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [criteria, setCriteria] = useState<ScreeningCriteriaType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleHistoryAdd = (prompt: string, criteria: ScreeningCriteriaType) => {
    // This will be passed down to TemplateManager to handle history
    console.log('Adding to history:', prompt.substring(0, 50) + '...')
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      <header className="pt-4 pb-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">股票筛选条件生成器</h1>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            构建、优化并生成高精度的中文股票筛选条件，支持复制到任何股票软件使用。
          </p>
        </div>
      </header>
      <main className="flex-1 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Left column: Prompt Builder (dominant) */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="lg:sticky lg:top-2 space-y-4">
                <PromptBuilder
                  parsedCriteria={criteria}
                  loading={isLoading}
                  onHistoryAdd={handleHistoryAdd}
                  onGenerate={async ({ prompt: builtPrompt, criteria: builtCriteria }) => {
                    setIsLoading(true)
                    try {
                      setPrompt(builtPrompt)
                      setCriteria(builtCriteria)
                      // No API call - just generate the prompt for copy/paste usage
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                />
              </div>
            </div>
            {/* Right column: Prompt Output & Tools */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              {/* Generated Prompt Output */}
              <section className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">生成的筛选条件</h2>
                  {prompt && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(prompt)
                        alert('已复制到剪贴板！')
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      复制文本
                    </button>
                  )}
                </div>
                {prompt ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-5 border-2 border-green-200 shadow-sm">
                      <div className="text-base font-bold text-green-800 mb-3 flex items-center gap-2">
                        📋 筛选条件文本
                      </div>
                      <div className="text-base leading-relaxed text-gray-900 max-h-60 overflow-y-auto font-medium">
                        {prompt}
                      </div>
                    </div>
                    <div className="text-sm text-blue-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="font-bold mb-2">💡 使用方法：</div>
                      <div>复制上方文本，粘贴到股票软件的筛选条件输入框中。</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="text-base font-medium">点击"生成筛选条件"按钮</div>
                    <div className="text-sm mt-2 text-gray-400">将根据您的参数生成完整的筛选文本</div>
                  </div>
                )}
              </section>

              {/* Quick Actions */}
              {prompt && (
                <section className="card">
                  <h3 className="text-base font-bold text-gray-900 mb-4">快捷操作</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        const blob = new Blob([prompt], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `stock-filter-${new Date().toISOString().split('T')[0]}.txt`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      下载为文本文件
                    </button>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: '股票筛选条件',
                            text: prompt
                          })
                        } else {
                          alert('您的浏览器不支持分享功能')
                        }
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      分享筛选条件
                    </button>
                  </div>
                </section>
              )}

              {/* Usage Guide */}
              <section className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <h3 className="text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  使用指南
                </h3>
                <div className="text-sm text-blue-800 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">1</span>
                    <span className="font-medium">选择或创建筛选模板</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">2</span>
                    <span className="font-medium">调整时间范围和数值参数</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">3</span>
                    <span className="font-medium">点击"生成筛选条件"按钮</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">4</span>
                    <span className="font-medium">复制生成的文本到股票软件</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

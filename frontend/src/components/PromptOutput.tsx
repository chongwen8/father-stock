'use client'

import React from 'react'

interface PromptOutputProps {
  selectedTemplate: any
  generatedPrompt: string
  isEditable: boolean
  editablePrompt: string
  lockedPrompt: string
  hasUserEdits: boolean
  showDateFormatWarning: boolean
  onToggleEdit: () => void
  onEditablePromptChange: (value: string) => void
  onSave: () => void
  onRestore: () => void
  onCopy: () => void
  onDownload: () => void
  onAIAnalysis: () => void
  onSyntaxCheck: () => void
}

export function PromptOutput({
  selectedTemplate,
  generatedPrompt,
  isEditable,
  editablePrompt,
  lockedPrompt,
  hasUserEdits,
  showDateFormatWarning,
  onToggleEdit,
  onEditablePromptChange,
  onSave,
  onRestore,
  onCopy,
  onDownload,
  onAIAnalysis,
  onSyntaxCheck
}: PromptOutputProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">生成的筛选条件</h2>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-600">
            当前模板: <span className="font-medium text-blue-600">{selectedTemplate?.name || '未选择'}</span>
          </div>
          {generatedPrompt && (
            <button
              onClick={onToggleEdit}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                isEditable 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {isEditable ? '❌ 取消编辑' : '✏️ 编辑'}
            </button>
          )}
        </div>
        
        {/* Date Format Warning */}
        {showDateFormatWarning && hasUserEdits && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600 text-sm">⚠️</span>
              <div className="text-sm text-yellow-800">
                <div className="font-medium mb-1">日期格式提示</div>
                <div className="text-xs leading-relaxed">
                  在已保存的编辑内容中未找到可识别的日期格式，日期更改未自动应用。
                  <br />建议在编辑内容中使用标准格式：<code className="bg-yellow-100 px-1 rounded">2025年9月8日</code>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="relative">
          <textarea
            value={isEditable ? editablePrompt : (lockedPrompt || generatedPrompt)}
            onChange={(e) => {
              if (isEditable) {
                onEditablePromptChange(e.target.value)
              }
            }}
            readOnly={!isEditable}
            className={`w-full min-h-40 max-h-96 border border-gray-300 rounded-lg p-4 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base leading-loose tracking-wide font-mono ${
              isEditable ? 'bg-white' : 'bg-gray-50'
            }`}
            style={{ 
              height: '200px',
              lineHeight: '1.8',
              letterSpacing: '0.025em'
            }}
            placeholder="选择日期和模板后，筛选条件将在此显示..."
          />
          <div className="absolute bottom-1 right-1 text-gray-400 pointer-events-none">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M16 16V10h-2v4h-4v2h6zM10 16v-2H6v2h4zM16 6V2h-4v2h2v2h2zM6 4V2H2v4h2V4h2z"/>
              <path d="M9 9l2-2 2 2-2 2-2-2z"/>
            </svg>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>
            {isEditable ? '可编辑模式 • ' : ''}可直接复制到股票软件使用 • 拖拽右下角调整高度
          </span>
          <span>{(isEditable ? editablePrompt : (lockedPrompt || generatedPrompt)).length} 字符</span>
        </div>
      </div>

      <div className="flex gap-3">
        {isEditable ? (
          // When in edit mode, show only save, restore to default, and syntax check
          <>
            <button
              onClick={onSave}
              disabled={!editablePrompt}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              💾 保存
            </button>
            <button
              onClick={onRestore}
              disabled={!generatedPrompt}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              🔄 恢复默认
            </button>
            <button
              onClick={onSyntaxCheck}
              disabled={!editablePrompt}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              🔍 语法检查
            </button>
          </>
        ) : (
          // When not in edit mode, show analysis and action buttons
          <>
            <button
              onClick={onCopy}
              disabled={!(lockedPrompt || generatedPrompt)}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              📋 复制
            </button>
            <button
              onClick={onDownload}
              disabled={!(lockedPrompt || generatedPrompt)}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              💾 下载
            </button>
            <button
              onClick={onAIAnalysis}
              disabled={!(lockedPrompt || generatedPrompt)}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              🤖 AI分析
            </button>
            <button
              onClick={onSyntaxCheck}
              disabled={!(lockedPrompt || generatedPrompt)}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              🔍 语法检查
            </button>
          </>
        )}
      </div>
    </div>
  )
}

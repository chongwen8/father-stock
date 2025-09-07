'use client'

import { useState } from 'react'
import { ScreeningTemplate } from '@/types'
import { CodeBracketIcon, EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface TemplateEditorProps {
  template: ScreeningTemplate
  onSave: (updatedTemplate: ScreeningTemplate) => void
  onCancel: () => void
}

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [editForm, setEditForm] = useState({
    name: template.name,
    description: template.description || '',
    template: template.template,
    tags: template.tags?.join(', ') || ''
  })
  const [showPreview, setShowPreview] = useState(false)

  const handleSave = () => {
    const updatedTemplate: ScreeningTemplate = {
      ...template,
      name: editForm.name,
      description: editForm.description,
      template: editForm.template,
      tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()) : [],
      updated_at: new Date().toISOString()
    }
    onSave(updatedTemplate)
  }

  // Extract variables from template for preview
  const extractVariables = (template: string) => {
    const matches = template.match(/\{([^}]+)\}/g) || []
    return matches.map(match => match.slice(1, -1))
  }

  const variables = extractVariables(editForm.template)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <CodeBracketIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">编辑模板</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`text-sm px-3 py-1.5 rounded flex items-center gap-1 ${
                showPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <EyeIcon className="w-4 h-4" />
              {showPreview ? '编辑' : '预览'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {showPreview ? (
            // Preview Mode
            <div className="p-6 h-full overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{editForm.name}</h4>
                  {editForm.description && (
                    <p className="text-sm text-gray-600 mt-1">{editForm.description}</p>
                  )}
                  {editForm.tags && (
                    <div className="flex gap-1 mt-2">
                      {editForm.tags.split(',').map((tag, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">模板内容</h5>
                  <div className="bg-gray-50 rounded p-3 text-sm leading-relaxed">
                    {editForm.template}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    变量列表 ({variables.length} 个)
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {variables.map((variable, i) => (
                      <div key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-mono">
                        {variable}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="p-6 h-full overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">模板名称</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field w-full"
                    placeholder="输入模板名称..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="input-field w-full"
                    placeholder="用逗号分隔，如：激进,早盘"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field w-full h-20"
                  placeholder="输入模板描述..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  模板内容
                  <span className="text-xs text-gray-500 ml-2">
                    使用 {'{变量名}'} 格式定义变量
                  </span>
                </label>
                <textarea
                  value={editForm.template}
                  onChange={(e) => setEditForm(prev => ({ ...prev, template: e.target.value }))}
                  className="input-field w-full h-48 font-mono text-sm"
                  placeholder="输入模板内容，使用 {变量名} 格式..."
                />
              </div>

              {variables.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    检测到的变量 ({variables.length} 个)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {variables.map((variable, i) => (
                      <div key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-mono">
                        {variable}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleSave}
            disabled={!editForm.name.trim() || !editForm.template.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <CheckIcon className="w-4 h-4" />
            保存模板
          </button>
          <button
            onClick={onCancel}
            className="btn-secondary flex items-center gap-2"
          >
            <XMarkIcon className="w-4 h-4" />
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

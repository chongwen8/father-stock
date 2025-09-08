'use client'

import React from 'react'

interface TemplateCardProps {
  template: any
  showFavorite?: boolean
  showTags?: boolean
  selectedTemplate: any
  isTemplateInAnyFavoriteList: (templateId: string) => boolean
  templateTags: any
  customTemplates: any[]
  onTemplateSelect: (template: any) => void
  onToggleFavorite: (templateId: string, e?: React.MouseEvent) => void
  onShowTagDialog: (templateId: string) => void
  onShowAddToCollectionDialog: (templateId: string) => void
  onDeleteTemplate: (templateId: string) => void
  onRemoveTag: (templateId: string, tag: string) => void
}

export function TemplateCard({
  template,
  showFavorite = true,
  showTags = true,
  selectedTemplate,
  isTemplateInAnyFavoriteList,
  templateTags,
  customTemplates,
  onTemplateSelect,
  onToggleFavorite,
  onShowTagDialog,
  onShowAddToCollectionDialog,
  onDeleteTemplate,
  onRemoveTag
}: TemplateCardProps) {
  const isFavorite = isTemplateInAnyFavoriteList(template.id)
  const isSelected = selectedTemplate?.id === template.id
  const templateTagsList = templateTags[template.id] || []

  return (
    <div
      className={`relative p-4 border-2 rounded-lg transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
      }`}
      onClick={() => onTemplateSelect(template)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-2">
          <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
          <div className="text-sm text-gray-600 mb-2">{template.description}</div>
        </div>
        
        <div className="flex gap-1">
          {showFavorite && (
            <button
              onClick={(e) => onToggleFavorite(template.id, e)}
              className={`group relative p-1 rounded-lg transition-all duration-200 ${
                isFavorite 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-md transform scale-105' 
                  : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              <span className="text-sm">⭐</span>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {isFavorite ? '取消收藏' : '添加收藏'}
                </div>
              </div>
            </button>
          )}
          
          {showTags && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onShowTagDialog(template.id)
              }}
              className="group relative p-1 rounded-lg bg-blue-100 hover:bg-blue-200 transition-all duration-200 hover:scale-105"
              title="添加标签"
            >
              <span className="text-sm">🏷️</span>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  添加标签
                </div>
              </div>
            </button>
          )}
          
          {/* Add to Collection/Category button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onShowAddToCollectionDialog(template.id)
            }}
            className="group relative p-1 rounded-lg bg-green-100 hover:bg-green-200 transition-all duration-200 hover:scale-105"
            title="添加到收藏夹"
          >
            <span className="text-sm">📚</span>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                添加到收藏夹
              </div>
            </div>
          </button>

          {/* Delete Template button - only for custom templates */}
          {customTemplates.some(ct => ct.id === template.id) && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteTemplate(template.id)
              }}
              className="group relative p-1 rounded-lg bg-red-100 hover:bg-red-200 transition-all duration-200 hover:scale-105"
              title="删除模板"
            >
              <span className="text-sm">🗑️</span>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  删除模板
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
      
      {showTags && templateTagsList.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {templateTagsList.map((tag: string, index: number) => {
            const tagColors = [
              'bg-gradient-to-r from-blue-500 to-cyan-500',
              'bg-gradient-to-r from-purple-500 to-pink-500',
              'bg-gradient-to-r from-green-500 to-teal-500',
              'bg-gradient-to-r from-orange-500 to-red-500',
              'bg-gradient-to-r from-indigo-500 to-purple-500'
            ];
            const currentColor = tagColors[index % tagColors.length];
            
            return (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 px-2 py-0.5 ${currentColor} text-white text-xs rounded-full shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105`}
              >
                <span className="font-medium">{tag}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveTag(template.id, tag)
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full w-3 h-3 flex items-center justify-center transition-colors text-xs"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
      
      {isSelected && (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-sm">
            <span className="text-sm">✨</span>
            已选择
          </div>
        </div>
      )}
    </div>
  )
}

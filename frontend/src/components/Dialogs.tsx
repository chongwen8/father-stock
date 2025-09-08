'use client'

import React from 'react'

interface DialogsProps {
  // Save Template Dialog
  showSaveDialog: boolean
  templateName: string
  templateDescription: string
  customTemplateText: string
  onTemplateNameChange: (value: string) => void
  onTemplateDescriptionChange: (value: string) => void
  onCustomTemplateTextChange: (value: string) => void
  onSaveCustomTemplate: () => void
  onCloseSaveDialog: () => void
  
  // Tag Dialog
  showTagDialog: boolean
  newTagName: string
  onNewTagNameChange: (value: string) => void
  onAddTag: () => void
  onCloseTagDialog: () => void
  
  // Favorite List Dialog
  showFavoriteListDialog: boolean
  newFavoriteListName: string
  onNewFavoriteListNameChange: (value: string) => void
  onAddFavoriteList: () => void
  onCloseFavoriteListDialog: () => void
  
  // Add to Collection Dialog
  showAddToCollectionDialog: boolean
  selectedTemplateForTag: string | null
  namedFavoriteLists: any[]
  onAddTemplateToFavoriteList: (templateId: string, listId: string) => void
  onCloseAddToCollectionDialog: () => void
  
  // Template List Dialog
  showTemplateListDialog: boolean
  selectedListForViewing: any
  getTemplatesInFavoriteList: (listId: string) => any[]
  onRemoveTemplateFromFavoriteList: (templateId: string, listId: string) => void
  onCloseTemplateListDialog: () => void
  // TemplateCard props for list dialog
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

export function Dialogs({
  showSaveDialog,
  templateName,
  templateDescription,
  customTemplateText,
  onTemplateNameChange,
  onTemplateDescriptionChange,
  onCustomTemplateTextChange,
  onSaveCustomTemplate,
  onCloseSaveDialog,
  showTagDialog,
  newTagName,
  onNewTagNameChange,
  onAddTag,
  onCloseTagDialog,
  showFavoriteListDialog,
  newFavoriteListName,
  onNewFavoriteListNameChange,
  onAddFavoriteList,
  onCloseFavoriteListDialog,
  showAddToCollectionDialog,
  selectedTemplateForTag,
  namedFavoriteLists,
  onAddTemplateToFavoriteList,
  onCloseAddToCollectionDialog,
  showTemplateListDialog,
  selectedListForViewing,
  getTemplatesInFavoriteList,
  onRemoveTemplateFromFavoriteList,
  onCloseTemplateListDialog,
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
}: DialogsProps) {
  return (
    <>
      {/* Save Custom Template Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">保存自定义模板</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">模板名称</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => onTemplateNameChange(e.target.value)}
                  placeholder="例如: 我的早盘策略"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">模板描述</label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => onTemplateDescriptionChange(e.target.value)}
                  placeholder="例如: 适用于早盘9:30-9:35的激进策略"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">模板内容</label>
                <div className="text-sm text-gray-600 mb-2">
                  💡 直接输入包含日期的模板，系统会自动替换日期部分
                </div>
                <textarea
                  value={customTemplateText}
                  onChange={(e) => onCustomTemplateTextChange(e.target.value)}
                  placeholder="例如: 2025年9月8日09:30至09:35特大单净额排名行业前15..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={onSaveCustomTemplate}
                disabled={!templateName.trim() || !customTemplateText.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                保存模板
              </button>
              <button
                onClick={onCloseSaveDialog}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tag Dialog */}
      {showTagDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">添加标签</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签名称</label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => onNewTagNameChange(e.target.value)}
                  placeholder="例如: 早盘, 激进, 稳健"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={onAddTag}
                disabled={!newTagName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                添加标签
              </button>
              <button
                onClick={onCloseTagDialog}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Favorite List Dialog */}
      {showFavoriteListDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">新建收藏夹</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">收藏夹名称</label>
                <input
                  type="text"
                  value={newFavoriteListName}
                  onChange={(e) => onNewFavoriteListNameChange(e.target.value)}
                  placeholder="例如: 我的早盘策略, 稳健投资"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={onAddFavoriteList}
                disabled={!newFavoriteListName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                创建收藏夹
              </button>
              <button
                onClick={onCloseFavoriteListDialog}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Collection/Category Dialog */}
      {showAddToCollectionDialog && selectedTemplateForTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">添加到收藏夹或分类</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择收藏夹</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {namedFavoriteLists.map((list: any) => (
                    <label key={list.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={list.templateIds.includes(selectedTemplateForTag)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onAddTemplateToFavoriteList(selectedTemplateForTag, list.id)
                          } else {
                            onRemoveTemplateFromFavoriteList(selectedTemplateForTag, list.id)
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{list.name} ({list.templateIds.length})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={onCloseAddToCollectionDialog}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template List Dialog */}
      {showTemplateListDialog && selectedListForViewing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedListForViewing.name}</h3>
                  <p className="text-sm text-gray-600">{selectedListForViewing.templateIds.length} 个模板</p>
                </div>
              </div>
              <button
                onClick={onCloseTemplateListDialog}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedListForViewing.templateIds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getTemplatesInFavoriteList(selectedListForViewing.id).map((template: any) => (
                    <div key={template.id} className="relative">
                      {/* Remove from list button */}
                      <button
                        onClick={() => onRemoveTemplateFromFavoriteList(template.id, selectedListForViewing.id)}
                        className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center"
                        title="从收藏夹中移除"
                      >
                        ×
                      </button>
                      <div className="pr-8">
                        {/* Use TemplateCard but import it first */}
                        <div className="p-4 border-2 rounded-lg border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                          <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
                          <div className="text-sm text-gray-600">{template.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl mb-4 block">📋</span>
                  <p className="text-sm">此收藏夹暂无模板</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={onCloseTemplateListDialog}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

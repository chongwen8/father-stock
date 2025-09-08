'use client'

import React from 'react'
import { DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline'
import { TemplateCard } from './TemplateCard'

interface TemplateTabsProps {
  activeTab: 'recent' | 'custom' | 'tags' | 'lists'
  onTabChange: (tab: 'recent' | 'custom' | 'tags' | 'lists') => void
  onShowSaveDialog: () => void
  // Data
  recent: string[]
  customTemplates: any[]
  namedFavoriteLists: any[]
  templateTags: any
  // Template operations
  getRecentTemplates: () => any[]
  getAllUniqueTags: () => string[]
  getTemplatesByTag: (tag: string) => any[]
  getTemplatesInFavoriteList: (listId: string) => any[]
  // TemplateCard props
  selectedTemplate: any
  isTemplateInAnyFavoriteList: (templateId: string) => boolean
  onTemplateSelect: (template: any) => void
  onToggleFavorite: (templateId: string, e?: React.MouseEvent) => void
  onShowTagDialog: (templateId: string) => void
  onShowAddToCollectionDialog: (templateId: string) => void
  onDeleteTemplate: (templateId: string) => void
  onRemoveTag: (templateId: string, tag: string) => void
  onShowFavoriteListDialog: () => void
  onShowTemplateListDialog: (list: any) => void
  onDeleteFavoriteList: (listId: string) => void
}

export function TemplateTabs({
  activeTab,
  onTabChange,
  onShowSaveDialog,
  recent,
  customTemplates,
  namedFavoriteLists,
  templateTags,
  getRecentTemplates,
  getAllUniqueTags,
  getTemplatesByTag,
  getTemplatesInFavoriteList,
  selectedTemplate,
  isTemplateInAnyFavoriteList,
  onTemplateSelect,
  onToggleFavorite,
  onShowTagDialog,
  onShowAddToCollectionDialog,
  onDeleteTemplate,
  onRemoveTag,
  onShowFavoriteListDialog,
  onShowTemplateListDialog,
  onDeleteFavoriteList
}: TemplateTabsProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <DocumentTextIcon className="w-6 h-6 text-green-600" />
          <h2 className="text-lg font-bold text-gray-900">选择筛选模板</h2>
        </div>
        <button
          onClick={onShowSaveDialog}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + 保存模板
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg flex-wrap">
        <button
          onClick={() => onTabChange('recent')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'recent'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🕒 最近 ({recent.length})
        </button>
        <button
          onClick={() => onTabChange('tags')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tags'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🏷️ 标签 ({getAllUniqueTags().length})
        </button>
        <button
          onClick={() => onTabChange('lists')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'lists'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📋 收藏夹 ({namedFavoriteLists.length})
        </button>
        <button
          onClick={() => onTabChange('custom')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'custom'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          ⚙️ 自定义 ({customTemplates.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'recent' && (
          <div>
            {getRecentTemplates().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getRecentTemplates().map((template) => (
                  <TemplateCard 
                    key={template.id} 
                    template={template}
                    selectedTemplate={selectedTemplate}
                    isTemplateInAnyFavoriteList={isTemplateInAnyFavoriteList}
                    templateTags={templateTags}
                    customTemplates={customTemplates}
                    onTemplateSelect={onTemplateSelect}
                    onToggleFavorite={onToggleFavorite}
                    onShowTagDialog={onShowTagDialog}
                    onShowAddToCollectionDialog={onShowAddToCollectionDialog}
                    onDeleteTemplate={onDeleteTemplate}
                    onRemoveTag={onRemoveTag}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">暂无最近使用的模板</p>
                <p className="text-sm">点击右上角"保存模板"按钮创建</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'custom' && (
          <div>
            {customTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customTemplates.map((template) => (
                  <TemplateCard 
                    key={template.id} 
                    template={template}
                    selectedTemplate={selectedTemplate}
                    isTemplateInAnyFavoriteList={isTemplateInAnyFavoriteList}
                    templateTags={templateTags}
                    customTemplates={customTemplates}
                    onTemplateSelect={onTemplateSelect}
                    onToggleFavorite={onToggleFavorite}
                    onShowTagDialog={onShowTagDialog}
                    onShowAddToCollectionDialog={onShowAddToCollectionDialog}
                    onDeleteTemplate={onDeleteTemplate}
                    onRemoveTag={onRemoveTag}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">暂无自定义模板</p>
                <p className="text-sm">点击右上角"保存模板"按钮创建</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tags' && (
          <div>
            {getAllUniqueTags().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {getAllUniqueTags().map((tag, index) => {
                  const tagColors = [
                    'bg-gradient-to-r from-blue-500 to-cyan-500',
                    'bg-gradient-to-r from-purple-500 to-pink-500',
                    'bg-gradient-to-r from-green-500 to-teal-500',
                    'bg-gradient-to-r from-orange-500 to-red-500',
                    'bg-gradient-to-r from-indigo-500 to-purple-500'
                  ];
                  const currentColor = tagColors[index % tagColors.length];
                  const templatesWithTag = getTemplatesByTag(tag);
                  
                  return (
                    <div
                      key={tag}
                      className={`${currentColor} text-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 cursor-pointer`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">🏷️</span>
                        <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                          {templatesWithTag.length}
                        </span>
                      </div>
                      <div className="font-medium mb-1">{tag}</div>
                      <div className="text-sm text-white/80">
                        {templatesWithTag.length} 个模板
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl mb-4 block">🏷️</span>
                <p className="text-sm">暂无标签</p>
                <p className="text-sm">点击模板上的标签按钮添加</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'lists' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">我的收藏夹</h3>
              <button
                onClick={onShowFavoriteListDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                + 新建收藏夹
              </button>
            </div>
            
            {namedFavoriteLists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {namedFavoriteLists.map((list: any, index: number) => {
                  const listColors = [
                    'bg-gradient-to-br from-blue-500 to-blue-600',
                    'bg-gradient-to-br from-purple-500 to-purple-600',
                    'bg-gradient-to-br from-green-500 to-green-600',
                    'bg-gradient-to-br from-orange-500 to-orange-600',
                    'bg-gradient-to-br from-pink-500 to-pink-600',
                    'bg-gradient-to-br from-indigo-500 to-indigo-600'
                  ];
                  const currentColor = listColors[index % listColors.length];
                  const templateCount = list.templateIds.length;
                  
                  return (
                    <div
                      key={list.id}
                      className={`${currentColor} text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer relative group`}
                      onClick={() => onShowTemplateListDialog(list)}
                    >
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteFavoriteList(list.id)
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                        title="删除收藏夹"
                      >
                        ×
                      </button>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">📋</span>
                        <span className="text-sm bg-white/20 px-2 py-1 rounded-full font-medium">
                          {templateCount}
                        </span>
                      </div>
                      <div className="font-bold text-lg mb-1 pr-6">{list.name}</div>
                      <div className="text-sm text-white/80">
                        {templateCount} 个模板
                      </div>
                      <div className="text-xs text-white/60 mt-2">
                        点击查看详情
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl mb-4 block">📋</span>
                <p className="text-sm">暂无收藏夹</p>
                <p className="text-sm">点击"新建收藏夹"开始组织您的模板</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

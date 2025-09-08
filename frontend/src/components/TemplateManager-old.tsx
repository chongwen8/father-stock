'use client'

import { useState } from 'react'

interface Template {
  id: string
  name: string
  content: string
  createdAt: string
}

interface TemplateManagerProps {
  templates: Template[]
  onLoadTemplate: (template: Template) => void
  onDeleteTemplate: (id: string) => void
}

export function TemplateManager({ templates, onLoadTemplate, onDeleteTemplate }: TemplateManagerProps) {
  const [showTemplates, setShowTemplates] = useState(false)

  if (templates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">已保存的模板</h3>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <div className="text-base font-medium">暂无保存的模板</div>
          <div className="text-sm mt-2 text-gray-400">创建筛选条件后点击"保存模板"来保存您的工作</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">已保存的模板</h3>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="text-blue-600 hover:text-blue-700 font-medium text-base flex items-center gap-2"
        >
          {showTemplates ? '收起' : '展开'}
          <svg 
            className={`w-5 h-5 transition-transform ${showTemplates ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showTemplates && (
        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-base">{template.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    创建于: {new Date(template.createdAt).toLocaleDateString('zh-CN')} {new Date(template.createdAt).toLocaleTimeString('zh-CN')}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onLoadTemplate(template)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    加载
                  </button>
                  <button
                    onClick={() => onDeleteTemplate(template.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-700 bg-gray-100 p-3 rounded mt-2 max-h-20 overflow-y-auto font-mono">
                {template.content.length > 200 
                  ? template.content.substring(0, 200) + '...' 
                  : template.content
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
      volume_ratio_min: 5,
      volume_ratio_change_min: 0.02,
      volume_ratio_change_max: 0.5,
      turnover_ratio_max: 0.8,
      avg_turnover_ratio_max: 10,
      current_turnover_min: 0.01,
      current_turnover_max: 0.08,
      avg_price_ratio_10_20_min: 1.0,
      amplitude_max: 25,
      market_cap_max: 10000000000,
      exclude_st: true,
      include_main_board: true
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_favorite: false,
    usage_count: 0,
    tags: ['激进', '大量比']
  },
  {
    id: 'conservative',
    name: '稳健筛选',
    description: '低风险、稳定增长的保守策略',
    template: `今日{start_time}至{end_time}特大单净额排名行业前{large_order_ranking}；今日竞价分时涨跌幅大于{bid_amp_min}小于{bid_amp_max}；今日{start_time}至{end_time}均价/开盘价大于{avg_price_ratio_min}；今日{end_time}量比大于{volume_ratio_min}；今日{end_time}换手率大于{current_turnover_min_pct}%小于{current_turnover_max_pct}%；主板非ST且市值大于50亿小于{market_cap_limit}亿`,
    criteria: {
      start_time: '09:30',
      end_time: '09:40',
      large_order_net_amount_min: 2000000,
      large_order_ranking: 20,
      bid_amplitude_min: 0.5,
      bid_amplitude_max: 3,
      avg_price_ratio_min: 1.001,
      low_avg_ratio_min: 0.99,
      close_high_ratio_min: 0.99,
      volume_ratio_min: 2,
      volume_ratio_change_min: 0.005,
      volume_ratio_change_max: 0.2,
      turnover_ratio_max: 0.5,
      avg_turnover_ratio_max: 5,
      current_turnover_min: 0.002,
      current_turnover_max: 0.03,
      avg_price_ratio_10_20_min: 0.985,
      amplitude_max: 15,
      market_cap_max: 50000000000,
      exclude_st: true,
      include_main_board: true
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_favorite: false,
    usage_count: 0,
    tags: ['稳健', '大盘股']
  }
]

export function TemplateManager({
  currentTemplate,
  currentCriteria,
  onTemplateSelect,
  onTemplateSave,
  onTemplateDelete,
  onHistoryAdd
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<ScreeningTemplate[]>(DEFAULT_TEMPLATES)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ScreeningTemplate | null>(null)
  const [filterTag, setFilterTag] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    tags: ''
  })
  const [history, setHistory] = useState<TemplateHistory[]>([])

  // Filter templates based on search and tag filter
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTag = filterTag === '' || 
      template.tags?.some(tag => tag.includes(filterTag))
    
    return matchesSearch && matchesTag
  })

  // Get all unique tags for filter dropdown
  const allTags = Array.from(new Set(templates.flatMap(t => t.tags || [])))

  // Sort templates: favorites first, then by usage count, then by name
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (a.is_favorite !== b.is_favorite) {
      return a.is_favorite ? -1 : 1
    }
    if (a.usage_count !== b.usage_count) {
      return b.usage_count - a.usage_count
    }
    return a.name.localeCompare(b.name)
  })

  // Load templates from localStorage on mount
  useEffect(() => {
    const savedTemplates = localStorage.getItem('screening-templates')
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates)
        setTemplates([...DEFAULT_TEMPLATES, ...parsed])
      } catch (e) {
        console.warn('Failed to load saved templates:', e)
      }
    }

    const savedHistory = localStorage.getItem('screening-history')
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.warn('Failed to load history:', e)
      }
    }
  }, [])

  // Save templates to localStorage when templates change
  useEffect(() => {
    const customTemplates = templates.filter(t => !DEFAULT_TEMPLATES.find(dt => dt.id === t.id))
    localStorage.setItem('screening-templates', JSON.stringify(customTemplates))
  }, [templates])

  const handleTemplateSelect = (template: ScreeningTemplate) => {
    setSelectedTemplateId(template.id)
    // Update usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, usage_count: t.usage_count + 1 } : t
    ))
    onTemplateSelect(template)
  }

  const handleSaveTemplate = () => {
    if (!saveForm.name.trim()) {
      alert('请输入模板名称')
      return
    }

    const newTemplate: ScreeningTemplate = {
      id: Date.now().toString(),
      name: saveForm.name,
      description: saveForm.description,
      template: currentTemplate,
      criteria: currentCriteria,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_favorite: false,
      usage_count: 0,
      tags: saveForm.tags ? saveForm.tags.split(',').map(t => t.trim()) : []
    }

    setTemplates(prev => [...prev, newTemplate])
    onTemplateSave(newTemplate)
    setShowSaveDialog(false)
    setSaveForm({ name: '', description: '', tags: '' })
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (DEFAULT_TEMPLATES.find(t => t.id === templateId)) {
      alert('无法删除默认模板')
      return
    }
    
    if (confirm('确定要删除这个模板吗？')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId))
      onTemplateDelete(templateId)
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId('default')
      }
    }
  }

  const toggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, is_favorite: !t.is_favorite } : t
    ))
  }

  const duplicateTemplate = (template: ScreeningTemplate) => {
    const newTemplate: ScreeningTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (副本)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0,
      is_favorite: false
    }
    setTemplates(prev => [...prev, newTemplate])
  }

  const addToHistory = (prompt: string, criteria: any) => {
    const historyEntry: TemplateHistory = {
      id: Date.now().toString(),
      template_id: selectedTemplateId,
      prompt,
      criteria,
      created_at: new Date().toISOString()
    }
    
    const newHistory = [historyEntry, ...history].slice(0, 50) // Keep last 50 entries
    setHistory(newHistory)
    localStorage.setItem('screening-history', JSON.stringify(newHistory))
  }

  const handleEditTemplate = (template: ScreeningTemplate) => {
    setEditingTemplate(template)
    setShowEditor(true)
  }

  const handleTemplateEditorSave = (updatedTemplate: ScreeningTemplate) => {
    setTemplates(prev => prev.map(t => 
      t.id === updatedTemplate.id ? updatedTemplate : t
    ))
    setShowEditor(false)
    setEditingTemplate(null)
  }

  const handleTemplateEditorCancel = () => {
    setShowEditor(false)
    setEditingTemplate(null)
  }

  const exportTemplates = () => {
    const customTemplates = templates.filter(t => !DEFAULT_TEMPLATES.find(dt => dt.id === t.id))
    const exportData = {
      templates: customTemplates,
      history: history,
      exported_at: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `father-stock-templates-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string)
        if (importData.templates && Array.isArray(importData.templates)) {
          // Add imported templates with new IDs to avoid conflicts
          const importedTemplates = importData.templates.map((t: ScreeningTemplate) => ({
            ...t,
            id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
          setTemplates(prev => [...prev, ...importedTemplates])
          
          if (importData.history && Array.isArray(importData.history)) {
            setHistory(prev => [...importData.history, ...prev].slice(0, 50))
          }
          
          alert(`成功导入 ${importedTemplates.length} 个模板`)
        }
      } catch (e) {
        alert('导入失败：文件格式不正确')
      }
    }
    reader.readAsText(file)
    // Reset the input
    event.target.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Template Management Header */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <FolderIcon className="w-5 h-5" />
            筛选模板
          </h3>
          <div className="flex gap-3 text-sm">
            <input
              type="file"
              accept=".json"
              onChange={importTemplates}
              className="hidden"
              id="import-templates"
            />
            <label
              htmlFor="import-templates"
              className="text-blue-600 hover:underline cursor-pointer flex items-center gap-2 text-base font-semibold"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              导入
            </label>
            <button
              onClick={exportTemplates}
              className="text-blue-600 hover:underline flex items-center gap-2 text-base font-semibold"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              导出
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-blue-600 hover:underline flex items-center gap-2 text-base font-semibold"
            >
              <ClockIcon className="w-4 h-4" />
              {showHistory ? '隐藏历史' : '查看历史'}
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="text-blue-600 hover:underline flex items-center gap-2 text-base font-semibold"
            >
              <PlusIcon className="w-4 h-4" />
              保存当前
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索模板..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">所有标签</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-wrap gap-2 -mb-px">
          {sortedTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`
                px-4 py-3 text-sm font-semibold border-b-3 transition-colors relative rounded-t-lg
                ${selectedTemplateId === template.id
                  ? 'border-blue-500 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {template.is_favorite && (
                  <StarSolidIcon className="w-4 h-4 text-yellow-500" />
                )}
                {template.name}
                {template.usage_count > 0 && (
                  <span className="text-sm bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-medium">
                    {template.usage_count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Template Actions */}
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-4">
          {templates.find(t => t.id === selectedTemplateId)?.description && (
            <span className="text-gray-600 font-medium">
              {templates.find(t => t.id === selectedTemplateId)?.description}
            </span>
          )}
          {templates.find(t => t.id === selectedTemplateId)?.tags && (
            <div className="flex items-center gap-2">
              <TagIcon className="w-4 h-4 text-gray-500" />
              {templates.find(t => t.id === selectedTemplateId)?.tags?.map(tag => (
                <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => toggleFavorite(selectedTemplateId)}
            className="text-gray-500 hover:text-yellow-600 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
            title="收藏/取消收藏"
          >
            {templates.find(t => t.id === selectedTemplateId)?.is_favorite ? (
              <StarSolidIcon className="w-5 h-5" />
            ) : (
              <StarIcon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => handleEditTemplate(templates.find(t => t.id === selectedTemplateId)!)}
            className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            title="编辑模板"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => duplicateTemplate(templates.find(t => t.id === selectedTemplateId)!)}
            className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            title="复制模板"
          >
            <DocumentDuplicateIcon className="w-5 h-5" />
          </button>
          {!DEFAULT_TEMPLATES.find(t => t.id === selectedTemplateId) && (
            <button
              onClick={() => handleDeleteTemplate(selectedTemplateId)}
              className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="删除模板"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <h4 className="text-base font-bold text-gray-800">执行历史</h4>
          {history.length === 0 ? (
            <p className="text-sm text-gray-600">暂无历史记录</p>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {history.slice(0, 10).map((entry) => (
                <div key={entry.id} className="text-sm bg-white rounded-lg p-3 border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {templates.find(t => t.id === entry.template_id)?.name || '未知模板'}
                      </div>
                      <div className="text-gray-600 mt-1 truncate">
                        {entry.prompt.substring(0, 80)}...
                      </div>
                    </div>
                    <div className="text-right text-gray-500 ml-3">
                      <div className="text-sm">{new Date(entry.created_at).toLocaleDateString()}</div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(entry.prompt)
                          alert('已复制到剪贴板！')
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
                      >
                        复制
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save Template Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">保存模板</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">模板名称</label>
                <input
                  type="text"
                  value={saveForm.name}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field w-full"
                  placeholder="输入模板名称..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述 (可选)</label>
                <textarea
                  value={saveForm.description}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field w-full h-20"
                  placeholder="输入模板描述..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签 (可选)</label>
                <input
                  type="text"
                  value={saveForm.tags}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="input-field w-full"
                  placeholder="用逗号分隔，如：激进,早盘"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveTemplate}
                className="btn-primary flex-1"
              >
                保存
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Editor */}
      {showEditor && editingTemplate && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleTemplateEditorSave}
          onCancel={handleTemplateEditorCancel}
        />
      )}
    </div>
  )
}

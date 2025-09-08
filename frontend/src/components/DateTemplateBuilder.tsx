'use client'

import { useState, useEffect, useMemo } from 'react'
import { ExtendedScreeningCriteria, ScreeningCriteria, ScreeningTemplate } from '@/types'
import { CalendarIcon, DocumentTextIcon, ClockIcon, StarIcon, HeartIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid, HeartIcon as HeartSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid'

interface DateTemplateBuilderProps {
  onGenerate: (payload: { prompt: string; criteria: ScreeningCriteria }) => void
  loading?: boolean
}

// Organized template categories
const PRESET_TEMPLATES = {
  categories: {
    morning: {
      name: '早盘策略',
      description: '09:30-11:30 早盘交易时段',
      icon: '🌅',
      templates: [
        {
          id: 'morning_aggressive',
          name: '早盘激进',
          description: '09:30-09:35 特大单筛选',
          template: `2025年9月8日09:30至09:35特大单净额排名行业前15或2025年9月8日09:30至09:35特大单净额排名行业前20%；2025年9月8日竞价分时涨跌幅大于0小于4；2025年9月8日09:30至09:35均价/开盘价大于1.003；2025年9月8日09:34至09:35最低价/2025年9月8日09:34至09:35均价大于0.985；2025年9月8日09:31收盘价/2025年9月8日09:30至09:31最高价大于0.985；2025年9月8日09:35量比大于3；（2025年9月8日09:35量比/2025年9月8日09:34量比）-（2025年9月8日09:34量比/2025年9月8日09:31量比）*0.95＞0.01＜0.33；2025年9月8日前1个交易日换手率/2025年9月8日前3个交易日换手率＜0.7且2025年9月8日前3个交易日换手率/2025年9月8日前120个交易日日均换手率＜8；2025年9月8日09:35换手率大于0.4%小于5%；2025年9月8日09:30至09:35特大单净额大于100万；（2025年9月8日09:34至09:35特大单净额-2025年9月8日09:30至09:34特大单净额）＞-1000万；2025年9月8日前10个交易日成交均价/2025年9月8日前20个交易日成交均价大于0.98；2025年9月8日前2个交易日振幅小于18.6；2025年9月8日前3个交易日非一字线非T字线；主板非ST且市值小于200亿`,
        },
        {
          id: 'morning_conservative',
          name: '早盘稳健',
          description: '09:45-10:00 稳健策略',
          template: `2025年9月8日09:45至10:00特大单净额排名行业前25；2025年9月8日竞价分时涨跌幅大于-1小于3；2025年9月8日10:00量比大于2；2025年9月8日10:00换手率大于0.3%小于3%；主板非ST且市值小于300亿`,
        }
      ]
    },
    midday: {
      name: '中盘策略',
      description: '10:00-13:00 中盘交易时段',
      icon: '☀️',
      templates: [
        {
          id: 'midday_momentum',
          name: '中盘动量',
          description: '10:30-11:00 动量追踪',
          template: `2025年9月8日10:30至11:00特大单净额排名行业前10；2025年9月8日竞价分时涨跌幅大于2小于7；2025年9月8日11:00量比大于4；2025年9月8日11:00换手率大于1%小于6%；主板非ST且市值小于150亿`,
        }
      ]
    },
    afternoon: {
      name: '午盘策略', 
      description: '13:00-15:00 午盘交易时段',
      icon: '🌇',
      templates: [
        {
          id: 'afternoon_chase',
          name: '午后追涨',
          description: '13:30-14:00 追涨策略',
          template: `2025年9月8日13:30至14:00特大单净额排名行业前8；2025年9月8日竞价分时涨跌幅大于3小于8；2025年9月8日14:00量比大于6；2025年9月8日14:00换手率大于1.5%小于8%；主板非ST且市值小于100亿`,
        },
        {
          id: 'end_day_grab',
          name: '尾盘抢筹',
          description: '14:30-15:00 尾盘策略',
          template: `2025年9月8日14:30至15:00特大单净额排名行业前12；2025年9月8日竞价分时涨跌幅大于1小于5；2025年9月8日15:00量比大于4；2025年9月8日15:00换手率大于0.8%小于4%；主板非ST且市值小于200亿`,
        }
      ]
    }
  }
}

// Template storage and management functions
const getStoredData = () => {
  if (typeof window === 'undefined') return { 
    templates: [], 
    favorites: [], 
    recent: [], 
    customCategories: [],
    namedFavoriteLists: [],
    templateTags: {}
  }
  try {
    const stored = localStorage.getItem('stock-template-data')
    const data = stored ? JSON.parse(stored) : { 
      templates: [], 
      favorites: [], 
      recent: [],
      customCategories: [],
      namedFavoriteLists: [],
      templateTags: {}
    }
    
    // Ensure all new fields exist for backward compatibility
    return {
      templates: data.templates || [],
      favorites: data.favorites || [],
      recent: data.recent || [],
      customCategories: data.customCategories || [],
      namedFavoriteLists: data.namedFavoriteLists || [],
      templateTags: data.templateTags || {}
    }
  } catch {
    return { 
      templates: [], 
      favorites: [], 
      recent: [],
      customCategories: [],
      namedFavoriteLists: [],
      templateTags: {}
    }
  }
}

const saveStoredData = (data: any) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('stock-template-data', JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save data:', e)
  }
}

const addToRecent = (templateId: string) => {
  const data = getStoredData()
  const recent = data.recent || []
  const filtered = recent.filter((id: string) => id !== templateId)
  const newRecent = [templateId, ...filtered].slice(0, 5) // Keep only 5 recent
  
  saveStoredData({ ...data, recent: newRecent })
  return newRecent
}

const toggleFavorite = (templateId: string) => {
  const data = getStoredData()
  const favorites = data.favorites || []
  const isFavorite = favorites.includes(templateId)
  
  const newFavorites = isFavorite 
    ? favorites.filter((id: string) => id !== templateId)
    : [...favorites, templateId]
  
  saveStoredData({ ...data, favorites: newFavorites })
  return newFavorites
}

const saveCustomTemplate = (template: any) => {
  const data = getStoredData()
  const templates = data.templates || []
  const newTemplate = {
    ...template,
    id: 'custom_' + Date.now().toString(),
    created_at: new Date().toISOString(),
    tags: template.tags || []
  }
  
  const newTemplates = [...templates, newTemplate]
  saveStoredData({ ...data, templates: newTemplates })
  return newTemplate
}

// Custom category management
const addCustomCategory = (categoryName: string) => {
  const data = getStoredData()
  const customCategories = data.customCategories || []
  
  if (!customCategories.find((cat: any) => cat.name === categoryName)) {
    const newCategory = {
      id: 'category_' + Date.now().toString(),
      name: categoryName,
      created_at: new Date().toISOString()
    }
    const newCategories = [...customCategories, newCategory]
    saveStoredData({ ...data, customCategories: newCategories })
    return newCategories
  }
  return customCategories
}

// Named favorite list management
const addNamedFavoriteList = (listName: string) => {
  const data = getStoredData()
  const namedFavoriteLists = data.namedFavoriteLists || []
  
  if (!namedFavoriteLists.find((list: any) => list.name === listName)) {
    const newList = {
      id: 'favlist_' + Date.now().toString(),
      name: listName,
      templateIds: [],
      created_at: new Date().toISOString()
    }
    const newLists = [...namedFavoriteLists, newList]
    saveStoredData({ ...data, namedFavoriteLists: newLists })
    return newLists
  }
  return namedFavoriteLists
}

const addTemplateToFavoriteList = (templateId: string, listId: string) => {
  const data = getStoredData()
  const namedFavoriteLists = data.namedFavoriteLists || []
  
  const updatedLists = namedFavoriteLists.map((list: any) => {
    if (list.id === listId && !list.templateIds.includes(templateId)) {
      return { ...list, templateIds: [...list.templateIds, templateId] }
    }
    return list
  })
  
  saveStoredData({ ...data, namedFavoriteLists: updatedLists })
  return updatedLists
}

const removeTemplateFromFavoriteList = (templateId: string, listId: string) => {
  const data = getStoredData()
  const namedFavoriteLists = data.namedFavoriteLists || []
  
  const updatedLists = namedFavoriteLists.map((list: any) => {
    if (list.id === listId) {
      return { ...list, templateIds: list.templateIds.filter((id: string) => id !== templateId) }
    }
    return list
  })
  
  saveStoredData({ ...data, namedFavoriteLists: updatedLists })
  return updatedLists
}

// Template tags management
const addTagToTemplate = (templateId: string, tag: string) => {
  const data = getStoredData()
  const templateTags = data.templateTags || {}
  
  const currentTags = templateTags[templateId] || []
  if (!currentTags.includes(tag)) {
    const newTags = { ...templateTags, [templateId]: [...currentTags, tag] }
    saveStoredData({ ...data, templateTags: newTags })
    return newTags
  }
  return templateTags
}

const removeTagFromTemplate = (templateId: string, tag: string) => {
  const data = getStoredData()
  const templateTags = data.templateTags || {}
  
  const currentTags = templateTags[templateId] || []
  const newTags = { ...templateTags, [templateId]: currentTags.filter((t: any) => t !== tag) }
  saveStoredData({ ...data, templateTags: newTags })
  return newTags
}

// Helper function to find template by ID across all categories
const findTemplateById = (id: string, customTemplates: any[]) => {
  // Search in preset categories
  for (const category of Object.values(PRESET_TEMPLATES.categories)) {
    const found = category.templates.find((t: any) => t.id === id)
    if (found) return found
  }
  
  // Search in custom templates
  return customTemplates.find(t => t.id === id)
}

const buildPrompt = (template: string, targetDate: string) => {
  // Replace any existing date patterns (e.g., "2024年9月7日" -> new date)
  const datePattern = /\d{4}年\d{1,2}月\d{1,2}日/g
  return template.replace(datePattern, targetDate)
}

// Function to update saved content with new date while preserving user's format preferences
const updateSavedContentWithNewDate = (savedContent: string, newTargetDate: string) => {
  // Find all possible date patterns that users might use
  const datePatterns = [
    { pattern: /(\d{4})年(\d{1,2})月(\d{1,2})日/g, suffix: '日' }
  ]
  
  let updatedContent = savedContent
  let hasMatch = false
  
  // Extract new date parts safely
  const newDateMatch = newTargetDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
  if (!newDateMatch) {
    return { updatedContent, hasMatch: false }
  }
  
  const [, year, month, day] = newDateMatch
  
  for (const { pattern, suffix } of datePatterns) {
    // Reset pattern before testing
    pattern.lastIndex = 0
    
    if (pattern.test(savedContent)) {
      const replacement = `${year}年${month}月${day}${suffix}`
      
      // Reset pattern again before replacing
      pattern.lastIndex = 0
      updatedContent = updatedContent.replace(pattern, replacement)
      hasMatch = true
      break // Only replace the first matching pattern type
    }
  }
  
  return { updatedContent, hasMatch }
}

export function DateTemplateBuilder({ onGenerate, loading }: DateTemplateBuilderProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [customTemplates, setCustomTemplates] = useState<any[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [customCategories, setCustomCategories] = useState<any[]>([])
  const [namedFavoriteLists, setNamedFavoriteLists] = useState<any[]>([])
  const [templateTags, setTemplateTags] = useState<any>({})
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showFavoriteListDialog, setShowFavoriteListDialog] = useState(false)
  const [showTagDialog, setShowTagDialog] = useState(false)
  const [selectedTemplateForTag, setSelectedTemplateForTag] = useState<string | null>(null)
  const [customTemplateText, setCustomTemplateText] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newFavoriteListName, setNewFavoriteListName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [showAddToCollectionDialog, setShowAddToCollectionDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites' | 'custom' | 'tags' | 'lists'>('recent')
  const [isEditable, setIsEditable] = useState(false)
  const [editablePrompt, setEditablePrompt] = useState('')
  const [hasGenerated, setHasGenerated] = useState(false)
  const [lockedPrompt, setLockedPrompt] = useState('')
  const [hasUserEdits, setHasUserEdits] = useState(false)
  const [showDateFormatWarning, setShowDateFormatWarning] = useState(false)

  // Initialize with today's date
  useEffect(() => {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0]
    setSelectedDate(dateStr)
  }, [])

  // Load stored data
  useEffect(() => {
    const data = getStoredData()
    setCustomTemplates(data.templates || [])
    setFavorites(data.favorites || [])
    setRecent(data.recent || [])
    setCustomCategories(data.customCategories || [])
    setNamedFavoriteLists(data.namedFavoriteLists || [])
    setTemplateTags(data.templateTags || {})
    
    // Auto-select first recent or favorite template
    const recentTemplates = data.recent || []
    if (recentTemplates.length > 0) {
      const template = findTemplateById(recentTemplates[0], data.templates || [])
      if (template) {
        setSelectedTemplate(template)
        setActiveTab('recent')
      }
    } else {
      // Default to first morning template if available
      const morningTemplates = PRESET_TEMPLATES.categories.morning.templates
      if (morningTemplates.length > 0) {
        setSelectedTemplate(morningTemplates[0])
        setActiveTab('recent')
      }
    }
  }, [])

  // Generate the final prompt with date substitution
  const generatedPrompt = useMemo(() => {
    if (!selectedDate || !selectedTemplate?.template) return ''
    
    const [year, month, day] = selectedDate.split('-').map(Number)
    const targetDate = `${year}年${month}月${day}日`
    
    return buildPrompt(selectedTemplate.template, targetDate)
  }, [selectedTemplate?.template, selectedDate])

  // Update editable prompt when generated prompt changes
  useEffect(() => {
    if (generatedPrompt && !isEditable) {
      // If user hasn't made any edits, update normally
      if (!hasUserEdits) {
        setEditablePrompt(generatedPrompt)
        setShowDateFormatWarning(false) // Clear any previous warnings
      } else if (lockedPrompt) {
        // If user has saved edits, update the saved content with new date
        const [year, month, day] = selectedDate.split('-').map(Number)
        const targetDate = `${year}年${month}月${day}日`
        const { updatedContent, hasMatch } = updateSavedContentWithNewDate(lockedPrompt, targetDate)
        
        if (hasMatch) {
          setLockedPrompt(updatedContent)
          setShowDateFormatWarning(false) // Clear warning on successful update
        } else {
          // Warn user that no date patterns were found
          setShowDateFormatWarning(true)
          console.warn('⚠️ 日期格式警告: 在已保存的编辑内容中未找到标准日期格式，日期更改未生效。')
        }
      }
    }
  }, [generatedPrompt, isEditable, hasUserEdits, lockedPrompt, selectedDate])

  const handleGenerate = () => {
    const finalPrompt = isEditable ? editablePrompt : (lockedPrompt || generatedPrompt)
    if (finalPrompt && selectedTemplate) {
      // Add to recent
      const newRecent = addToRecent(selectedTemplate.id)
      setRecent(newRecent)
      
      setHasGenerated(true)
      
      onGenerate({ 
        prompt: finalPrompt, 
        criteria: {
          target_year: parseInt(selectedDate.split('-')[0]),
          target_month: parseInt(selectedDate.split('-')[1]),
          target_day: parseInt(selectedDate.split('-')[2]),
        } as any
      })
    }
  }

  const handleTemplateSelect = (template: any) => {
    // If we're switching templates while in edit mode, save current edits first
    if (isEditable && editablePrompt && selectedTemplate) {
      setLockedPrompt(editablePrompt)
      setHasUserEdits(true)
    }
    
    setSelectedTemplate(template)
    const newRecent = addToRecent(template.id)
    setRecent(newRecent)
    
    // Reset editable state when selecting a new template
    setIsEditable(false)
    setHasGenerated(false)
    setLockedPrompt('')
    setHasUserEdits(false)
  }

  const handleToggleFavorite = (templateId: string) => {
    const data = getStoredData()
    const currentFavorites = data.favorites || []
    const currentNamedLists = data.namedFavoriteLists || []
    
    // Check if template is in main favorites
    const isInMainFavorites = currentFavorites.includes(templateId)
    
    // Check if template is in any named favorite list
    const isInNamedLists = currentNamedLists.some((list: any) => list.templateIds.includes(templateId))
    
    if (isInMainFavorites) {
      // Remove from main favorites
      const newFavorites = currentFavorites.filter((id: string) => id !== templateId)
      saveStoredData({ ...data, favorites: newFavorites })
      setFavorites(newFavorites)
    } else if (isInNamedLists) {
      // Remove from all named favorite lists
      const updatedLists = currentNamedLists.map((list: any) => ({
        ...list,
        templateIds: list.templateIds.filter((id: string) => id !== templateId)
      }))
      saveStoredData({ ...data, namedFavoriteLists: updatedLists })
      setNamedFavoriteLists(updatedLists)
    } else {
      // Add to main favorites
      const newFavorites = [...currentFavorites, templateId]
      saveStoredData({ ...data, favorites: newFavorites })
      setFavorites(newFavorites)
    }
  }

  const handleSaveCustomTemplate = () => {
    if (!templateName.trim() || !customTemplateText.trim()) return
    
    const newTemplate = saveCustomTemplate({
      name: templateName,
      description: templateDescription || '自定义模板',
      template: customTemplateText,
      tags: []
    })
    
    if (newTemplate) {
      setCustomTemplates(prev => [...prev, newTemplate])
      setTemplateName('')
      setTemplateDescription('')
      setCustomTemplateText('')
      setShowSaveDialog(false)
      
      // Auto-focus the new template
      setActiveTab('custom')
      handleTemplateSelect(newTemplate)
    }
  }

  const handleAddCustomCategory = () => {
    if (!newCategoryName.trim()) return
    const newCategories = addCustomCategory(newCategoryName)
    setCustomCategories(newCategories)
    setNewCategoryName('')
    setShowCategoryDialog(false)
  }

  const handleAddFavoriteList = () => {
    if (!newFavoriteListName.trim()) return
    const newLists = addNamedFavoriteList(newFavoriteListName)
    setNamedFavoriteLists(newLists)
    setNewFavoriteListName('')
    setShowFavoriteListDialog(false)
  }

  const handleAddTag = () => {
    if (!newTagName.trim() || !selectedTemplateForTag) return
    const newTags = addTagToTemplate(selectedTemplateForTag, newTagName)
    setTemplateTags(newTags)
    setNewTagName('')
    setSelectedTemplateForTag(null)
    setShowTagDialog(false)
  }

  const handleRemoveTag = (templateId: string, tag: string) => {
    const newTags = removeTagFromTemplate(templateId, tag)
    setTemplateTags(newTags)
  }

  const setToToday = () => {
    const today = new Date()
    setSelectedDate(today.toISOString().split('T')[0])
  }

  const setToYesterday = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    setSelectedDate(yesterday.toISOString().split('T')[0])
  }

  const setToTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSelectedDate(tomorrow.toISOString().split('T')[0])
  }

  // Get templates for each tab
  const getRecentTemplates = () => {
    return recent.map(id => findTemplateById(id, customTemplates)).filter(Boolean)
  }

  const getFavoriteTemplates = () => {
    return favorites.map(id => findTemplateById(id, customTemplates)).filter(Boolean)
  }

  const getTemplatesByTag = (tag: string) => {
    const templateIds = Object.keys(templateTags).filter(id => 
      templateTags[id] && templateTags[id].includes(tag)
    )
    return templateIds.map(id => findTemplateById(id, customTemplates)).filter(Boolean)
  }

  const getTemplatesByCategory = (categoryId: string) => {
    // Get all templates (both custom and preset) that belong to this category
    const allTemplates = [
      ...customTemplates,
      ...Object.values(PRESET_TEMPLATES.categories).flatMap((cat: any) => cat.templates)
    ]
    
    // For now, we'll use a simple approach - check if template has the category in its metadata
    // In a more sophisticated system, you'd have a separate mapping
    return allTemplates.filter((template: any) => {
      // Check if template has category metadata or if it's assigned to this category
      return template.categoryId === categoryId || (template.categories && template.categories.includes(categoryId))
    })
  }

  const getTemplatesInFavoriteList = (listId: string) => {
    const list = namedFavoriteLists.find((l: any) => l.id === listId)
    if (!list) return []
    return list.templateIds.map((id: string) => findTemplateById(id, customTemplates)).filter(Boolean)
  }

  const getAllUniqueTags = () => {
    const allTags = Object.values(templateTags).flat() as string[]
    return [...new Set(allTags)]
  }

  const isTemplateInAnyFavoriteList = (templateId: string) => {
    // Check if in main favorites
    if (favorites.includes(templateId)) return true
    
    // Check if in any named favorite list
    return namedFavoriteLists.some((list: any) => list.templateIds.includes(templateId))
  }

  const TemplateCard = ({ template, showFavorite = true, showTags = true }: { template: any, showFavorite?: boolean, showTags?: boolean }) => {
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
        onClick={() => handleTemplateSelect(template)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-2">
            <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
            <div className="text-sm text-gray-600 mb-2">{template.description}</div>
          </div>
          
          <div className="flex gap-1">
            {showFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleFavorite(template.id)
                }}
                className={`group relative p-1 rounded-lg transition-all duration-200 ${
                  isFavorite 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-md transform scale-105' 
                    : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                }`}
              >
                <span className={`text-sm transition-all duration-200 ${
                  isFavorite ? 'animate-pulse' : ''
                }`}>
                  {isFavorite ? '⭐' : '☆'}
                </span>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <span className="text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                    {isFavorite ? '取消收藏' : '添加收藏'}
                  </span>
                </div>
              </button>
            )}
            
            {showTags && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedTemplateForTag(template.id)
                  setShowTagDialog(true)
                }}
                className="group relative p-1 rounded-lg bg-blue-100 hover:bg-blue-200 transition-all duration-200 hover:scale-105"
                title="添加标签"
              >
                <span className="text-sm">🏷️</span>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <span className="text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                    添加标签
                  </span>
                </div>
              </button>
            )}
            
            {/* Add to Collection/Category button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedTemplateForTag(template.id)
                setShowAddToCollectionDialog(true)
              }}
              className="group relative p-1 rounded-lg bg-green-100 hover:bg-green-200 transition-all duration-200 hover:scale-105"
              title="添加到收藏夹"
            >
              <span className="text-sm">📚</span>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <span className="text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                  添加到收藏夹
                </span>
              </div>
            </button>
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
                      handleRemoveTag(template.id, tag)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-2">📈 股票筛选生成器</h1>
        <p className="text-blue-100">选择日期和模板，快速生成筛选条件</p>
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CalendarIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">选择目标日期</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <div className="flex gap-2">
            <button
              onClick={setToYesterday}
              className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              昨天
            </button>
            <button
              onClick={setToToday}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              今天
            </button>
            <button
              onClick={setToTomorrow}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
            >
              明天
            </button>
          </div>
          
          <div className="ml-auto text-blue-700 font-medium">
            📅 {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            }) : '请选择日期'}
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-bold text-gray-900">选择筛选模板</h2>
          </div>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + 保存模板
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg flex-wrap">
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'recent'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🕒 最近 ({recent.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            ⭐ 收藏 ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tags'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🏷️ 标签 ({getAllUniqueTags().length})
          </button>
          <button
            onClick={() => setActiveTab('lists')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'lists'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📋 收藏夹 ({namedFavoriteLists.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
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
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无最近使用的模板</p>
                  <p className="text-sm">选择其他模板后会显示在这里</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              {getFavoriteTemplates().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getFavoriteTemplates().map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <StarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无收藏的模板</p>
                  <p className="text-sm">点击模板右上角的星号即可收藏</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'custom' && (
            <div>
              {customTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customTemplates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无自定义模板</p>
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
                      'from-blue-500 to-cyan-500',
                      'from-purple-500 to-pink-500',
                      'from-green-500 to-teal-500',
                      'from-orange-500 to-red-500',
                      'from-indigo-500 to-purple-500',
                      'from-teal-500 to-green-500'
                    ];
                    const tagEmojis = ['🏷️', '📌', '🔖', '🎯', '⚡', '🌟'];
                    const currentGradient = tagColors[index % tagColors.length];
                    const currentEmoji = tagEmojis[index % tagEmojis.length];
                    const templateCount = getTemplatesByTag(tag).length;
                    
                    return (
                      <div 
                        key={tag}
                        className={`relative bg-gradient-to-br ${currentGradient} rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group`}
                        onClick={() => {
                          // You can add functionality to filter by this tag or expand templates
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{currentEmoji}</span>
                          <div>
                            <h4 className="font-semibold text-sm truncate">{tag}</h4>
                            <p className="text-white/80 text-xs">{templateCount} 个模板</p>
                          </div>
                        </div>
                        
                        {templateCount > 0 && (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {getTemplatesByTag(tag).slice(0, 2).map((template: any) => (
                                <div 
                                  key={template.id}
                                  className="bg-white/20 backdrop-blur-sm rounded-md px-2 py-1 text-xs hover:bg-white/30 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTemplateSelect(template);
                                  }}
                                >
                                  <div className="font-medium truncate max-w-20">{template.name}</div>
                                </div>
                              ))}
                              {templateCount > 2 && (
                                <div className="bg-white/20 backdrop-blur-sm rounded-md px-2 py-1 text-xs">
                                  +{templateCount - 2}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="mb-4">
                    <span className="text-6xl">🏷️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">还没有标签</h3>
                  <p className="text-gray-500 mb-4">为模板添加标签来更好地分类管理</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lists' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  我的收藏夹
                </h3>
                <button
                  onClick={() => setShowFavoriteListDialog(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                >
                  <span className="text-lg">✨</span>
                  新建收藏夹
                </button>
              </div>
              
              {namedFavoriteLists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {namedFavoriteLists.map((list: any, index: number) => {
                    const gradientColors = [
                      'from-blue-500 to-indigo-600',
                      'from-purple-500 to-pink-600', 
                      'from-green-500 to-teal-600',
                      'from-orange-500 to-red-600',
                      'from-cyan-500 to-blue-600',
                      'from-violet-500 to-purple-600'
                    ];
                    const iconEmojis = ['💫', '🌟', '⭐', '🎯', '🔥', '💎', '🚀', '🌈', '✨', '🎨'];
                    const currentGradient = gradientColors[index % gradientColors.length];
                    const currentIcon = iconEmojis[index % iconEmojis.length];
                    
                    return (
                      <div 
                        key={list.id}
                        className={`relative bg-gradient-to-br ${currentGradient} rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{currentIcon}</span>
                            <div>
                              <h4 className="font-semibold text-sm">{list.name}</h4>
                              <p className="text-white/80 text-xs">{list.templateIds.length} 个模板</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete list
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white/20 rounded-full p-1"
                          >
                            <span className="text-white text-sm">🗑️</span>
                          </button>
                        </div>
                        
                        {list.templateIds.length > 0 && (
                          <div className="space-y-1">
                            <h5 className="text-xs font-medium text-white/90 mb-1">包含模板:</h5>
                            <div className="space-y-1 max-h-20 overflow-y-auto">
                              {list.templateIds.slice(0, 2).map((templateId: string) => {
                                const template = findTemplateById(templateId, customTemplates);
                                return template ? (
                                  <div 
                                    key={templateId}
                                    className="bg-white/20 backdrop-blur-sm rounded-md p-2 text-xs hover:bg-white/30 transition-colors cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTemplateSelect(template);
                                    }}
                                  >
                                    <div className="font-medium truncate">{template.name}</div>
                                  </div>
                                ) : null;
                              })}
                              {list.templateIds.length > 2 && (
                                <div className="text-center text-white/70 text-xs py-1">
                                  还有 {list.templateIds.length - 2} 个...
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="mb-4">
                    <span className="text-6xl">📚</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">还没有收藏夹</h3>
                  <p className="text-gray-500 mb-4">创建收藏夹来整理你的模板</p>
                  <button
                    onClick={() => setShowFavoriteListDialog(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    <span className="text-lg">✨</span>
                    创建第一个收藏夹
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Generated Output */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">生成的筛选条件</h2>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-600">
              当前模板: <span className="font-medium text-blue-600">{selectedTemplate?.name || '未选择'}</span>
            </div>
            {generatedPrompt && (
              <button
                onClick={() => {
                  if (isEditable) {
                    // When canceling edit, restore to last saved state (or generated if no saves)
                    setEditablePrompt(lockedPrompt || generatedPrompt)
                    setIsEditable(false)
                  } else {
                    // When starting edit, prepare for editing with current content
                    setEditablePrompt(lockedPrompt || generatedPrompt)
                    setIsEditable(true)
                    setShowDateFormatWarning(false) // Clear warning when entering edit mode
                  }
                }}
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
                <span className="text-yellow-600 text-lg">⚠️</span>
                <div className="text-sm">
                  <div className="font-medium text-yellow-800 mb-1">日期格式警告</div>
                  <div className="text-yellow-700">
                    在已保存的编辑内容中未找到可识别的日期格式，日期更改未自动应用。
                    <br />
                    建议使用标准格式：<code className="bg-yellow-100 px-1 rounded">2025年9月8日</code>
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
                  setEditablePrompt(e.target.value)
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
          <button
            onClick={handleGenerate}
            disabled={loading || (!isEditable && !(lockedPrompt || generatedPrompt)) || (isEditable && !editablePrompt)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {loading ? '生成中...' : hasGenerated ? '🚀 重新生成' : '🚀 生成筛选条件'}
          </button>
          
          {isEditable ? (
            // When in edit mode, show save, restore and copy buttons
            <>
              <button
                onClick={() => {
                  setLockedPrompt(editablePrompt)
                  setHasUserEdits(true)
                  setIsEditable(false)
                  alert('已保存编辑内容！')
                }}
                disabled={!editablePrompt}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                💾 保存编辑
              </button>
              <button
                onClick={() => {
                  if (generatedPrompt) {
                    setEditablePrompt(generatedPrompt)
                    setLockedPrompt('')
                    setHasUserEdits(false)
                    setIsEditable(false) // Switch back to locked state
                    alert('已恢复到默认内容！')
                  }
                }}
                disabled={!generatedPrompt}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                🔄 恢复默认
              </button>
              <button
                onClick={() => {
                  if (editablePrompt) {
                    navigator.clipboard.writeText(editablePrompt)
                    alert('已复制到剪贴板！')
                  }
                }}
                disabled={!editablePrompt}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                📋 复制
              </button>
            </>
          ) : (
            // When not in edit mode, show only copy button
            <button
              onClick={() => {
                const contentToCopy = lockedPrompt || generatedPrompt
                if (contentToCopy) {
                  navigator.clipboard.writeText(contentToCopy)
                  alert('已复制到剪贴板！')
                }
              }}
              disabled={!(lockedPrompt || generatedPrompt)}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              📋 复制
            </button>
          )}
        </div>
      </div>

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
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="例如: 我的早盘策略"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">模板描述</label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
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
                  onChange={(e) => setCustomTemplateText(e.target.value)}
                  placeholder="例如: 2025年9月8日09:30至09:35特大单净额排名行业前15..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveCustomTemplate}
                disabled={!templateName.trim() || !customTemplateText.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                保存模板
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
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
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="例如: 早盘, 激进, 稳健"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddTag}
                disabled={!newTagName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                添加标签
              </button>
              <button
                onClick={() => {
                  setShowTagDialog(false)
                  setSelectedTemplateForTag(null)
                  setNewTagName('')
                }}
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
                  onChange={(e) => setNewFavoriteListName(e.target.value)}
                  placeholder="例如: 我的早盘策略, 稳健投资"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddFavoriteList}
                disabled={!newFavoriteListName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                创建收藏夹
              </button>
              <button
                onClick={() => setShowFavoriteListDialog(false)}
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
              {/* Add to Named Favorite Lists */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">收藏夹</h4>
                {namedFavoriteLists.length > 0 ? (
                  <div className="space-y-2">
                    {namedFavoriteLists.map((list: any) => (
                      <label key={list.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={list.templateIds.includes(selectedTemplateForTag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const updatedLists = addTemplateToFavoriteList(selectedTemplateForTag, list.id)
                              setNamedFavoriteLists(updatedLists)
                            } else {
                              const updatedLists = removeTemplateFromFavoriteList(selectedTemplateForTag, list.id)
                              setNamedFavoriteLists(updatedLists)
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{list.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">暂无收藏夹，请先创建收藏夹</p>
                )}
              </div>


            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddToCollectionDialog(false)
                  setSelectedTemplateForTag(null)
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Provide default export for compatibility with both default and named import usages
export default DateTemplateBuilder

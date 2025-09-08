'use client'

import { useState, useEffect, useMemo } from 'react'
import type { ScreeningCriteria } from '@/types'
import { DateSelector } from './DateSelector'
import { TemplateTabs } from './TemplateTabs'
import { PromptOutput } from './PromptOutput'
import { Dialogs } from './Dialogs'

interface DateTemplateBuilderProps {
  onGenerate?: (payload: { prompt: string; criteria: ScreeningCriteria }) => void
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

// Helper functions
const addToRecent = (templateId: string) => {
  const data = getStoredData()
  const recent = data.recent || []
  const filtered = recent.filter((id: string) => id !== templateId)
  const newRecent = [templateId, ...filtered].slice(0, 5)
  
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

const deleteFavoriteList = (listId: string) => {
  const data = getStoredData()
  const namedFavoriteLists = data.namedFavoriteLists || []
  
  const updatedLists = namedFavoriteLists.filter((list: any) => list.id !== listId)
  
  saveStoredData({ ...data, namedFavoriteLists: updatedLists })
  return updatedLists
}

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

const deleteTemplate = (templateId: string) => {
  const data = getStoredData()
  
  const updatedTemplates = data.templates.filter((t: any) => t.id !== templateId)
  const updatedFavorites = data.favorites.filter((id: string) => id !== templateId)
  const updatedRecent = data.recent.filter((id: string) => id !== templateId)
  const updatedNamedLists = data.namedFavoriteLists.map((list: any) => ({
    ...list,
    templateIds: list.templateIds.filter((id: string) => id !== templateId)
  }))
  
  const updatedTemplateTags = { ...data.templateTags }
  delete updatedTemplateTags[templateId]
  
  const updatedData = {
    ...data,
    templates: updatedTemplates,
    favorites: updatedFavorites,
    recent: updatedRecent,
    namedFavoriteLists: updatedNamedLists,
    templateTags: updatedTemplateTags
  }
  
  saveStoredData(updatedData)
  return updatedData
}

const findTemplateById = (id: string, customTemplates: any[]) => {
  for (const category of Object.values(PRESET_TEMPLATES.categories)) {
    const found = category.templates.find((t: any) => t.id === id)
    if (found) return found
  }
  
  return customTemplates.find(t => t.id === id)
}

const buildPrompt = (template: string, targetDate: string) => {
  const datePattern = /\d{4}年\d{1,2}月\d{1,2}日/g
  return template.replace(datePattern, targetDate)
}

const updateSavedContentWithNewDate = (savedContent: string, newTargetDate: string) => {
  const datePatterns = [
    { pattern: /(\d{4})年(\d{1,2})月(\d{1,2})日/g, suffix: '日' }
  ]
  
  let updatedContent = savedContent
  let hasMatch = false
  
  const newDateMatch = newTargetDate.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
  if (!newDateMatch) {
    return { updatedContent, hasMatch: false }
  }
  
  const [, year, month, day] = newDateMatch
  
  for (const { pattern, suffix } of datePatterns) {
    pattern.lastIndex = 0
    
    if (pattern.test(savedContent)) {
      const replacement = `${year}年${month}月${day}${suffix}`
      pattern.lastIndex = 0
      updatedContent = updatedContent.replace(pattern, replacement)
      hasMatch = true
      break
    }
  }
  
  return { updatedContent, hasMatch }
}

export function DateTemplateBuilder({ onGenerate }: DateTemplateBuilderProps) {
  // State management
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [customTemplates, setCustomTemplates] = useState<any[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [namedFavoriteLists, setNamedFavoriteLists] = useState<any[]>([])
  const [templateTags, setTemplateTags] = useState<any>({})
  const [activeTab, setActiveTab] = useState<'recent' | 'custom' | 'tags' | 'lists'>('recent')
  
  // Dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showTagDialog, setShowTagDialog] = useState(false)
  const [showFavoriteListDialog, setShowFavoriteListDialog] = useState(false)
  const [showAddToCollectionDialog, setShowAddToCollectionDialog] = useState(false)
  const [showTemplateListDialog, setShowTemplateListDialog] = useState(false)
  const [selectedListForViewing, setSelectedListForViewing] = useState<any>(null)
  const [selectedTemplateForTag, setSelectedTemplateForTag] = useState<string | null>(null)
  
  // Form states
  const [customTemplateText, setCustomTemplateText] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [newFavoriteListName, setNewFavoriteListName] = useState('')
  
  // Editor states
  const [isEditable, setIsEditable] = useState(false)
  const [editablePrompt, setEditablePrompt] = useState('')
  const [lockedPrompt, setLockedPrompt] = useState('')
  const [hasUserEdits, setHasUserEdits] = useState(false)
  const [showDateFormatWarning, setShowDateFormatWarning] = useState(false)
  const [templateEdits, setTemplateEdits] = useState<Record<string, string>>({})

  // Computed value: check if current template has edits
  const currentTemplateHasEdits = selectedTemplate?.id ? Boolean(templateEdits[selectedTemplate.id]) : false

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
    setNamedFavoriteLists(data.namedFavoriteLists || [])
    setTemplateTags(data.templateTags || {})
    
    const recentTemplates = data.recent || []
    if (recentTemplates.length > 0) {
      const template = findTemplateById(recentTemplates[0], data.templates || [])
      if (template) {
        setSelectedTemplate(template)
        setActiveTab('recent')
      }
    } else {
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
    if (generatedPrompt && !isEditable && selectedTemplate?.id) {
      // Check if this template has stored edits
      const storedEdit = templateEdits[selectedTemplate.id]
      
      if (!storedEdit) {
        // No stored edits, use fresh generated prompt
        setEditablePrompt(generatedPrompt)
        setShowDateFormatWarning(false)
      } else {
        // Has stored edits, update dates in the stored content
        const [year, month, day] = selectedDate.split('-').map(Number)
        const targetDate = `${year}年${month}月${day}日`
        const { updatedContent, hasMatch } = updateSavedContentWithNewDate(storedEdit, targetDate)
        
        if (hasMatch) {
          setLockedPrompt(updatedContent)
          setShowDateFormatWarning(false)
          // Also update the stored edit with new date
          setTemplateEdits(prev => ({
            ...prev,
            [selectedTemplate.id]: updatedContent
          }))
        } else {
          setShowDateFormatWarning(true)
          console.warn('⚠️ 日期格式警告: 在已保存的编辑内容中未找到标准日期格式，日期更改未生效。')
        }
      }
    }
  }, [generatedPrompt, isEditable, selectedTemplate?.id, templateEdits, selectedDate])

  // Helper functions
  const getRecentTemplates = () => {
    return recent.map(id => findTemplateById(id, customTemplates)).filter(Boolean)
  }

  const getTemplatesByTag = (tag: string) => {
    const templateIds = Object.keys(templateTags).filter(id => 
      templateTags[id] && templateTags[id].includes(tag)
    )
    return templateIds.map(id => findTemplateById(id, customTemplates)).filter(Boolean)
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
    if (favorites.includes(templateId)) return true
    return namedFavoriteLists.some((list: any) => list.templateIds.includes(templateId))
  }

  // Event handlers
  const handleTemplateSelect = (template: any) => {
    // Save current edits to templateEdits if we're currently editing
    if (isEditable && editablePrompt && selectedTemplate?.id) {
      setTemplateEdits(prev => ({
        ...prev,
        [selectedTemplate.id]: editablePrompt
      }))
    }
    
    setSelectedTemplate(template)
    const newRecent = addToRecent(template.id)
    setRecent(newRecent)
    
    // Exit edit mode
    setIsEditable(false)
    
    // Check if this template has stored edits
    const storedEdit = templateEdits[template.id]
    if (storedEdit) {
      // Restore stored edits for this template
      setLockedPrompt(storedEdit)
    } else {
      // No stored edits, generate fresh prompt
      setLockedPrompt('')
    }
    setShowDateFormatWarning(false)
  }

  const handleToggleFavorite = (templateId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    
    const data = getStoredData()
    const currentFavorites = data.favorites || []
    const currentNamedLists = data.namedFavoriteLists || []
    
    const isInMainFavorites = currentFavorites.includes(templateId)
    const listsContainingTemplate = currentNamedLists.filter((list: any) => 
      list.templateIds.includes(templateId)
    )
    
    if (isInMainFavorites || listsContainingTemplate.length > 0) {
      let message = `⭐ 此模板已收藏\n\n`
      
      if (isInMainFavorites) {
        message += `• 在主收藏夹中\n`
      }
      
      if (listsContainingTemplate.length > 0) {
        message += `• 在收藏夹中: ${listsContainingTemplate.map((l: any) => l.name).join('、')}\n`
      }
      
      message += `\n选择操作:\n`
      message += `• 点击"确定"：从所有收藏夹中移除\n`
      message += `• 点击"取消"：保持收藏状态`
      
      const shouldRemove = confirm(message)
      
      if (shouldRemove) {
        const newFavorites = currentFavorites.filter((id: string) => id !== templateId)
        const updatedLists = currentNamedLists.map((list: any) => ({
          ...list,
          templateIds: list.templateIds.filter((id: string) => id !== templateId)
        }))
        
        saveStoredData({ ...data, favorites: newFavorites, namedFavoriteLists: updatedLists })
        setFavorites(newFavorites)
        setNamedFavoriteLists(updatedLists)
      }
    } else {
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
      
      setActiveTab('custom')
      handleTemplateSelect(newTemplate)
    }
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

  const handleDeleteTemplate = (templateId: string) => {
    const isPresetTemplate = Object.values(PRESET_TEMPLATES.categories).some((cat: any) => 
      cat.templates.some((t: any) => t.id === templateId)
    )
    
    if (isPresetTemplate) {
      alert('⚠️ 预设模板无法删除')
      return
    }

    const template = findTemplateById(templateId, customTemplates)
    const templateName = template?.name || '模板'

    const isConfirmed = confirm(
      `⚠️ 删除确认\n\n您确定要删除"${templateName}"吗？\n\n此操作将：\n• 从所有收藏夹中移除\n• 删除所有相关标签\n• 清空使用记录\n\n⚠️ 删除后无法恢复！\n\n点击"确定"继续删除，点击"取消"保留模板。`
    )

    if (isConfirmed) {
      const updatedData = deleteTemplate(templateId)
      
      setCustomTemplates(updatedData.templates)
      setFavorites(updatedData.favorites)
      setRecent(updatedData.recent)
      setNamedFavoriteLists(updatedData.namedFavoriteLists)
      setTemplateTags(updatedData.templateTags)
      
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null)
      }

      setTimeout(() => {
        alert(`✅ "${templateName}" 已成功删除`)
      }, 100)
    }
  }

  const handleDeleteFavoriteList = (listId: string) => {
    const list = namedFavoriteLists.find((l: any) => l.id === listId)
    const listName = list?.name || '收藏夹'
    const templateCount = list?.templateIds?.length || 0

    const isConfirmed = confirm(
      `⚠️ 删除收藏夹确认\n\n您确定要删除"${listName}"收藏夹吗？\n\n此收藏夹包含 ${templateCount} 个模板\n\n注意：\n• 删除收藏夹不会删除模板本身\n• 模板将保留在其他位置\n• 此操作无法撤销\n\n点击"确定"删除收藏夹，点击"取消"保留。`
    )

    if (isConfirmed) {
      const updatedLists = deleteFavoriteList(listId)
      setNamedFavoriteLists(updatedLists)
      
      setTimeout(() => {
        alert(`✅ 收藏夹"${listName}"已删除`)
      }, 100)
    }
  }

  const handleAddTemplateToFavoriteList = (templateId: string, listId: string) => {
    const updatedLists = addTemplateToFavoriteList(templateId, listId)
    setNamedFavoriteLists(updatedLists)
  }

  const handleRemoveTemplateFromFavoriteList = (templateId: string, listId: string) => {
    const updatedLists = removeTemplateFromFavoriteList(templateId, listId)
    setNamedFavoriteLists(updatedLists)
  }

  // Date handlers
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

  // Prompt handlers
  const handleToggleEdit = () => {
    if (isEditable) {
      setIsEditable(false)
    } else {
      setEditablePrompt(lockedPrompt || generatedPrompt)
      setIsEditable(true)
    }
  }

  const handleSave = () => {
    setLockedPrompt(editablePrompt)
    setIsEditable(false)
    
    // Save to per-template storage
    if (selectedTemplate?.id) {
      setTemplateEdits(prev => ({
        ...prev,
        [selectedTemplate.id]: editablePrompt
      }))
    }
    
    alert('已保存编辑内容！')
  }

  const handleRestore = () => {
    if (generatedPrompt) {
      setEditablePrompt(generatedPrompt)
      setLockedPrompt('')
      setIsEditable(false)
      
      // Clear template-specific edits
      if (selectedTemplate?.id) {
        setTemplateEdits(prev => {
          const newEdits = { ...prev }
          delete newEdits[selectedTemplate.id]
          return newEdits
        })
      }
      
      alert('已恢复到默认内容！')
    }
  }

  const handleCopy = () => {
    const contentToCopy = lockedPrompt || generatedPrompt
    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy)
      alert('已复制到剪贴板！')
    }
  }

  const handleDownload = () => {
    const contentToDownload = lockedPrompt || generatedPrompt
    if (contentToDownload) {
      const blob = new Blob([contentToDownload], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `股票筛选-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      alert('文件已下载！')
    }
  }

  const handleAIAnalysis = () => {
    const contentToAnalyze = isEditable ? editablePrompt : (lockedPrompt || generatedPrompt)
    if (contentToAnalyze) {
      alert('🤖 AI分析功能开发中...\n\n将发送筛选条件到AI进行：\n• 策略分析\n• 风险评估\n• 优化建议\n• 历史回测')
    }
  }

  const handleSyntaxCheck = () => {
    const contentToValidate = isEditable ? editablePrompt : (lockedPrompt || generatedPrompt)
    if (contentToValidate) {
      const hasDate = /\d{4}年\d{1,2}月\d{1,2}日/.test(contentToValidate)
      const hasConditions = contentToValidate.includes('；') || contentToValidate.includes('且') || contentToValidate.includes('或')
      const hasNumbers = /\d/.test(contentToValidate)
      
      let validationMsg = '🔍 语法检查结果：\n\n'
      
      if (hasDate) validationMsg += '✅ 包含日期格式\n'
      else validationMsg += '⚠️ 缺少日期格式\n'
      
      if (hasConditions) validationMsg += '✅ 包含筛选条件\n'
      else validationMsg += '⚠️ 缺少筛选条件连接符\n'
      
      if (hasNumbers) validationMsg += '✅ 包含数值条件\n'
      else validationMsg += '⚠️ 缺少数值条件\n'
      
      validationMsg += `\n字符长度: ${contentToValidate.length} 字符`
      
      alert(validationMsg)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-2">📈 股票筛选生成器</h1>
        <p className="text-blue-100">选择日期和模板，快速生成筛选条件</p>
      </div>

      {/* Date Selection */}
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onSetToday={setToToday}
        onSetYesterday={setToYesterday}
        onSetTomorrow={setToTomorrow}
      />

      {/* Template Selection */}
      <TemplateTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onShowSaveDialog={() => setShowSaveDialog(true)}
        recent={recent}
        customTemplates={customTemplates}
        namedFavoriteLists={namedFavoriteLists}
        templateTags={templateTags}
        getRecentTemplates={getRecentTemplates}
        getAllUniqueTags={getAllUniqueTags}
        getTemplatesByTag={getTemplatesByTag}
        getTemplatesInFavoriteList={getTemplatesInFavoriteList}
        selectedTemplate={selectedTemplate}
        isTemplateInAnyFavoriteList={isTemplateInAnyFavoriteList}
        onTemplateSelect={handleTemplateSelect}
        onToggleFavorite={handleToggleFavorite}
        onShowTagDialog={(templateId) => {
          setSelectedTemplateForTag(templateId)
          setShowTagDialog(true)
        }}
        onShowAddToCollectionDialog={(templateId) => {
          setSelectedTemplateForTag(templateId)
          setShowAddToCollectionDialog(true)
        }}
        onDeleteTemplate={handleDeleteTemplate}
        onRemoveTag={handleRemoveTag}
        onShowFavoriteListDialog={() => setShowFavoriteListDialog(true)}
        onShowTemplateListDialog={(list) => {
          setSelectedListForViewing(list)
          setShowTemplateListDialog(true)
        }}
        onDeleteFavoriteList={handleDeleteFavoriteList}
      />

      {/* Generated Output */}
      <PromptOutput
        selectedTemplate={selectedTemplate}
        generatedPrompt={generatedPrompt}
        isEditable={isEditable}
        editablePrompt={editablePrompt}
        lockedPrompt={lockedPrompt}
        hasUserEdits={currentTemplateHasEdits}
        showDateFormatWarning={showDateFormatWarning}
        onToggleEdit={handleToggleEdit}
        onEditablePromptChange={setEditablePrompt}
        onSave={handleSave}
        onRestore={handleRestore}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onAIAnalysis={handleAIAnalysis}
        onSyntaxCheck={handleSyntaxCheck}
      />

      {/* Dialogs */}
      <Dialogs
        showSaveDialog={showSaveDialog}
        templateName={templateName}
        templateDescription={templateDescription}
        customTemplateText={customTemplateText}
        onTemplateNameChange={setTemplateName}
        onTemplateDescriptionChange={setTemplateDescription}
        onCustomTemplateTextChange={setCustomTemplateText}
        onSaveCustomTemplate={handleSaveCustomTemplate}
        onCloseSaveDialog={() => setShowSaveDialog(false)}
        showTagDialog={showTagDialog}
        newTagName={newTagName}
        onNewTagNameChange={setNewTagName}
        onAddTag={handleAddTag}
        onCloseTagDialog={() => {
          setShowTagDialog(false)
          setSelectedTemplateForTag(null)
          setNewTagName('')
        }}
        showFavoriteListDialog={showFavoriteListDialog}
        newFavoriteListName={newFavoriteListName}
        onNewFavoriteListNameChange={setNewFavoriteListName}
        onAddFavoriteList={handleAddFavoriteList}
        onCloseFavoriteListDialog={() => setShowFavoriteListDialog(false)}
        showAddToCollectionDialog={showAddToCollectionDialog}
        selectedTemplateForTag={selectedTemplateForTag}
        namedFavoriteLists={namedFavoriteLists}
        onAddTemplateToFavoriteList={handleAddTemplateToFavoriteList}
        onCloseAddToCollectionDialog={() => {
          setShowAddToCollectionDialog(false)
          setSelectedTemplateForTag(null)
        }}
        showTemplateListDialog={showTemplateListDialog}
        selectedListForViewing={selectedListForViewing}
        getTemplatesInFavoriteList={getTemplatesInFavoriteList}
        onRemoveTemplateFromFavoriteList={handleRemoveTemplateFromFavoriteList}
        onCloseTemplateListDialog={() => {
          setShowTemplateListDialog(false)
          setSelectedListForViewing(null)
        }}
        selectedTemplate={selectedTemplate}
        isTemplateInAnyFavoriteList={isTemplateInAnyFavoriteList}
        templateTags={templateTags}
        customTemplates={customTemplates}
        onTemplateSelect={handleTemplateSelect}
        onToggleFavorite={handleToggleFavorite}
        onShowTagDialog={(templateId) => {
          setSelectedTemplateForTag(templateId)
          setShowTagDialog(true)
        }}
        onShowAddToCollectionDialog={(templateId) => {
          setSelectedTemplateForTag(templateId)
          setShowAddToCollectionDialog(true)
        }}
        onDeleteTemplate={handleDeleteTemplate}
        onRemoveTag={handleRemoveTag}
      />
    </div>
  )
}

export default DateTemplateBuilder

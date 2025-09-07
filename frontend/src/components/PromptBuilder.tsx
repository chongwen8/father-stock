'use client'

import { useState, useEffect, useMemo } from 'react'
import { ExtendedScreeningCriteria, ScreeningCriteria, ScreeningTemplate } from '@/types'
import { ClockIcon } from '@heroicons/react/24/outline'
import { TemplateManager } from './TemplateManager'

interface PromptBuilderProps {
  initialPrompt?: string
  parsedCriteria?: ScreeningCriteria | null
  onGenerate: (payload: { prompt: string; criteria: ScreeningCriteria }) => void
  loading?: boolean
  onHistoryAdd?: (prompt: string, criteria: ScreeningCriteria) => void
}

interface TimeRangeFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
}

const TimeInput = ({ label, value, onChange }: TimeRangeFieldProps) => {
  return (
    <div className="min-w-0">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field !py-2 w-full min-w-[90px] text-gray-900 font-medium text-base"
        step={60}
      />
    </div>
  )
}

// Default template extracted from the long Chinese prompt
const DEFAULT_TEMPLATE = `{target_date}{start_time}至{end_time}特大单净额排名行业前{large_order_ranking}或{target_date}{start_time}至{end_time}特大单净额排名行业前{large_order_alt_ranking}%；{target_date}竞价分时涨跌幅大于{bid_amp_min}小于{bid_amp_max}；{target_date}{start_time}至{end_time}均价/开盘价大于{avg_price_ratio_min}；{target_date}{end_time_minus_1}至{end_time}最低价/{target_date}{end_time_minus_1}至{end_time}均价大于{low_avg_ratio_min}；{target_date}{mid_time}收盘价/{target_date}{start_time}至{mid_time}最高价大于{close_high_ratio_min}；{target_date}{end_time}量比大于{volume_ratio_min}；（{target_date}{end_time}量比/{target_date}{end_time_minus_1}量比）-（{target_date}{end_time_minus_1}量比/{target_date}{mid_time}量比）*0.95＞{volume_ratio_change_min}＜{volume_ratio_change_max}；{target_date}前1个交易日换手率/{target_date}前3个交易日换手率＜{turnover_prev_1_over_prev_3_max}且{target_date}前3个交易日换手率/{target_date}前120个交易日日均换手率＜{turnover_prev_3_over_prev_120_max}；{target_date}{end_time}换手率大于{current_turnover_min_pct}%小于{current_turnover_max_pct}%；{target_date}{start_time}至{end_time}特大单净额大于{large_order_net_min}万；（{target_date}{end_time_minus_1}至{end_time}特大单净额-{target_date}{start_time}至{end_time_minus_1}特大单净额）＞{large_order_net_delta_min}万；{target_date}前10个交易日成交均价/{target_date}前20个交易日成交均价大于{avg_price_10_over_20_min}；{target_date}前2个交易日振幅小于{prev_2_days_amplitude_max}；{target_date}前3个交易日非一字线非T字线；主板非ST且市值小于{market_cap_limit}亿`;

const defaultCriteria: ExtendedScreeningCriteria = {
  start_time: '09:30',
  end_time: '09:33',
  target_year: new Date().getFullYear(),
  target_month: new Date().getMonth() + 1,
  target_day: new Date().getDate(),
  large_order_net_amount_min: 1000000,
  large_order_ranking: 15,
  bid_amplitude_min: 0,
  bid_amplitude_max: 4,
  avg_price_ratio_min: 1.003,
  low_avg_ratio_min: 0.985,
  close_high_ratio_min: 0.985,
  volume_ratio_min: 3,
  volume_ratio_change_min: 0.01,
  volume_ratio_change_max: 0.33,
  turnover_ratio_max: 0.7,
  avg_turnover_ratio_max: 8,
  current_turnover_min: 0.004,
  current_turnover_max: 0.05,
  avg_price_ratio_10_20_min: 0.98,
  amplitude_max: 18.6,
  market_cap_max: 20000000000,
  exclude_st: true,
  include_main_board: true,
  // extended
  large_order_net_amount_delta_min: -10000000,
  avg_price_10_over_20_min: 0.98,
  prev_2_days_amplitude_max: 18.6,
  prev_3_days_pattern_filter: true,
  turnover_prev_1_over_prev_3_max: 0.7,
  turnover_prev_3_over_prev_120_max: 8,
  large_order_net_amount_compare_window: '09:30-09:32 vs 09:32-09:33'
}

type TemplateVariableMap = Record<string, string | number>

const buildPrompt = (tpl: string, vars: TemplateVariableMap) => {
  return tpl.replace(/\{(.*?)\}/g, (_, key) => {
    const v = vars[key]
    return (v ?? '').toString()
  })
}

export function PromptBuilder({ initialPrompt, parsedCriteria, onGenerate, loading, onHistoryAdd }: PromptBuilderProps) {
  const [criteria, setCriteria] = useState<ExtendedScreeningCriteria>(defaultCriteria)
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [altRanking, setAltRanking] = useState<number>(20)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [rawPrompt, setRawPrompt] = useState(initialPrompt || '')
  const [extractStatus, setExtractStatus] = useState<string>('')

  // Sync with parsed criteria if provided
  useEffect(() => {
    if (parsedCriteria) {
      setCriteria(c => ({ ...c, ...parsedCriteria }))
    }
  }, [parsedCriteria])

  const derivedTimes = useMemo(() => {
    const [h, m] = criteria.end_time.split(':').map(Number)
    // naive minus 1 minute for display
    const date = new Date(2000,1,1,h,m)
    date.setMinutes(date.getMinutes() - 1)
    const endMinus1 = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
    const [mh, mm] = criteria.start_time.split(':').map(Number)
    const mid = `${String(mh).padStart(2,'0')}:${String(mm+1).padStart(2,'0')}`
    return { end_time_minus_1: endMinus1, mid_time: mid }
  }, [criteria.end_time, criteria.start_time])

  // Local input states to allow clearing & retyping without immediate fallback
  const [yearInput, setYearInput] = useState(() => String(defaultCriteria.target_year))
  const [monthInput, setMonthInput] = useState(() => String(defaultCriteria.target_month))
  const [dayInput, setDayInput] = useState(() => String(defaultCriteria.target_day))

  // Sync local inputs if criteria changed externally (e.g., template selection)
  useEffect(() => {
    if (criteria.target_year && yearInput !== String(criteria.target_year)) setYearInput(String(criteria.target_year))
    if (criteria.target_month && monthInput !== String(criteria.target_month)) setMonthInput(String(criteria.target_month))
    if (criteria.target_day && dayInput !== String(criteria.target_day)) setDayInput(String(criteria.target_day))
  }, [criteria.target_year, criteria.target_month, criteria.target_day])

  const vars: TemplateVariableMap = useMemo(() => {
    const y = parseInt(yearInput)
    const m = parseInt(monthInput)
    const d = parseInt(dayInput)
    const safeYear = !isNaN(y) ? y : new Date().getFullYear()
    const safeMonth = !isNaN(m) ? m : (new Date().getMonth() + 1)
    const safeDay = !isNaN(d) ? d : new Date().getDate()
    const targetDate = `${safeYear}年${safeMonth}月${safeDay}日`
    return {
      target_date: targetDate,
      start_time: criteria.start_time,
      end_time: criteria.end_time,
      large_order_ranking: criteria.large_order_ranking || 15,
      large_order_alt_ranking: altRanking,
      bid_amp_min: criteria.bid_amplitude_min,
      bid_amp_max: criteria.bid_amplitude_max,
      avg_price_ratio_min: criteria.avg_price_ratio_min,
      low_avg_ratio_min: criteria.low_avg_ratio_min,
      close_high_ratio_min: criteria.close_high_ratio_min,
      volume_ratio_min: criteria.volume_ratio_min,
      volume_ratio_change_min: criteria.volume_ratio_change_min,
      volume_ratio_change_max: criteria.volume_ratio_change_max,
      turnover_prev_1_over_prev_3_max: criteria.turnover_ratio_max,
      turnover_prev_3_over_prev_120_max: criteria.avg_turnover_ratio_max,
      current_turnover_min_pct: (criteria.current_turnover_min * 100).toFixed(1),
      current_turnover_max_pct: (criteria.current_turnover_max * 100).toFixed(0),
      large_order_net_min: (criteria.large_order_net_amount_min / 10000).toFixed(0),
      large_order_net_delta_min: ((criteria as any).large_order_net_amount_delta_min || -10000000) / 10000,
      avg_price_10_over_20_min: criteria.avg_price_ratio_10_20_min,
      prev_2_days_amplitude_max: criteria.amplitude_max,
      market_cap_limit: (criteria.market_cap_max / 1e8).toFixed(0),
      ...derivedTimes
    }
  }, [criteria, altRanking, derivedTimes, yearInput, monthInput, dayInput])

  useEffect(() => {
    setGeneratedPrompt(buildPrompt(template, vars))
  }, [template, vars])

  const update = <K extends keyof ExtendedScreeningCriteria>(k: K, v: ExtendedScreeningCriteria[K]) => {
    setCriteria(c => ({ ...c, [k]: v }))
  }

  const handleGenerate = () => {
    // Cast back to base criteria for API
    const base: ScreeningCriteria = { ...criteria }
    onGenerate({ prompt: generatedPrompt, criteria: base })
    
    // Add to history if callback provided
    if (onHistoryAdd) {
      onHistoryAdd(generatedPrompt, base)
    }
  }

  const handleTemplateSelect = (template: ScreeningTemplate) => {
    setTemplate(template.template)
    setCriteria(template.criteria)
    // Update alt ranking if it exists in template
    if ((template.criteria as any).large_order_alt_ranking) {
      setAltRanking((template.criteria as any).large_order_alt_ranking)
    }
  }

  const handleTemplateSave = (template: Omit<ScreeningTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    // Template saved successfully
    console.log('Template saved:', template.name)
  }

  const handleTemplateDelete = (templateId: string) => {
    // Template deleted successfully
    console.log('Template deleted:', templateId)
  }

  // Client-side variable extraction (mirrors backend logic, no API dependency yet)
  const extractVariablesFromRawPrompt = () => {
    if (!rawPrompt.trim()) {
      setExtractStatus('请输入原始 Prompt')
      return
    }

    try {
      const p = rawPrompt
      const updated: Partial<ExtendedScreeningCriteria> = {}

      // 时间匹配
      const timeMatches = [...p.matchAll(/(\d+)点(\d+)分/g)]
      if (timeMatches.length >= 2) {
        const fmt = (h: string, m: string) => `${h.padStart(2,'0')}:${m.padStart(2,'0')}`
        updated.start_time = fmt(timeMatches[0][1], timeMatches[0][2])
        updated.end_time = fmt(timeMatches[1][1], timeMatches[1][2])
      }

      // 行业前排名
      const rankMatch = p.match(/行业前(\d+)/)
      if (rankMatch) updated.large_order_ranking = parseInt(rankMatch[1])

      // 涨跌幅大于A小于B
      const ampMatch = p.match(/涨跌幅大于(\d+(?:\.\d+)?)小于(\d+(?:\.\d+)?)/)
      if (ampMatch) {
        updated.bid_amplitude_min = parseFloat(ampMatch[1])
        updated.bid_amplitude_max = parseFloat(ampMatch[2])
      }

      // 均价/开盘价大于X
      const avgOpen = p.match(/均价\/开盘价大于(\d+(?:\.\d+)?)/)
      if (avgOpen) updated.avg_price_ratio_min = parseFloat(avgOpen[1])

      // 量比大于X
      const volRatio = p.match(/量比大于(\d+(?:\.\d+)?)/)
      if (volRatio) updated.volume_ratio_min = parseFloat(volRatio[1])

      // 量比变化 （pattern （t3量比/t2量比）-（t2量比/t1量比）*0.95＞X＜Y）
      const volChange = p.match(/＞(\d+(?:\.\d+)?)＜(\d+(?:\.\d+)?)/)
      if (volChange) {
        updated.volume_ratio_change_min = parseFloat(volChange[1])
        updated.volume_ratio_change_max = parseFloat(volChange[2])
      }

      // 换手率大于A小于B%
      const turnover = p.match(/换手率大于(\d+(?:\.\d+)?)小于(\d+(?:\.\d+)?)%/)
      if (turnover) {
        updated.current_turnover_min = parseFloat(turnover[1]) / 100
        updated.current_turnover_max = parseFloat(turnover[2]) / 100
      }

      // 特大单净额大于X万
      const largeOrder = p.match(/特大单净额大于(\-?\d+)万/)
      if (largeOrder) updated.large_order_net_amount_min = parseInt(largeOrder[1]) * 10000

      // （…特大单净额-…特大单净额）＞X万  delta
      const delta = p.match(/净额）＞(\-?\d+)万/)
      if (delta) (updated as any).large_order_net_amount_delta_min = parseInt(delta[1]) * 10000

      // 市值小于X亿
      const mcap = p.match(/市值小于(\d+)亿/)
      if (mcap) updated.market_cap_max = parseInt(mcap[1]) * 1e8

      // 10日 / 20日 均价 > X
      const avg10over20 = p.match(/前10个交易日成交均价\/前20个交易日成交均价大于(\d+(?:\.\d+)?)/)
      if (avg10over20) updated.avg_price_ratio_10_20_min = parseFloat(avg10over20[1])

      // 前2个交易日振幅小于X
      const amp2 = p.match(/前2个交易日振幅小于(\d+(?:\.\d+)?)/)
      if (amp2) updated.amplitude_max = parseFloat(amp2[1])

      // Flags
      updated.exclude_st = p.includes('非ST') ? true : criteria.exclude_st
      updated.include_main_board = p.includes('主板') ? true : criteria.include_main_board

      setCriteria(c => ({ ...c, ...updated }))
      setExtractStatus('变量提取成功 ✅')
    } catch (e) {
      setExtractStatus('提取失败，请检查 Prompt 格式')
    }
  }

  return (
    <div className="card space-y-4">
      {/* Template Management */}
      <TemplateManager
        currentTemplate={template}
        currentCriteria={criteria}
        onTemplateSelect={handleTemplateSelect}
        onTemplateSave={handleTemplateSave}
        onTemplateDelete={handleTemplateDelete}
      />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">提示词构建器</h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowImport(s => !s)}
            className="text-base font-semibold text-blue-600 hover:underline hover:text-blue-800"
          >{showImport ? '关闭导入' : '导入原始提示词'}</button>
          <button
            type="button"
            onClick={() => setShowAdvanced(s => !s)}
            className="text-base font-semibold text-blue-600 hover:underline hover:text-blue-800"
          >
            {showAdvanced ? '隐藏高级参数' : '显示高级参数'}
          </button>
        </div>
      </div>

      {showImport && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600">粘贴已有的长提示词（不会立即覆盖模板）</label>
            <textarea
              className="input-field text-xs h-32"
              value={rawPrompt}
              placeholder="粘贴原始中文筛选描述..."
              onChange={(e)=> setRawPrompt(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={extractVariablesFromRawPrompt}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-base transition-colors"
              >提取变量并填入表单</button>
              {extractStatus && <span className="text-sm text-gray-600 font-medium">{extractStatus}</span>}
            </div>
            <p className="text-[11px] text-gray-400 leading-snug">提取逻辑在前端执行，可离线使用；生成区仍使用标准模板以保持一致性。稍后可接入后端增强语义解析。</p>
        </div>
      )}

      {/* Time Range */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-base font-bold text-gray-800">
          <ClockIcon className="w-5 h-5" /> 时间区间
        </div>
        
        {/* Date Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-700">目标日期</div>
            <button
              onClick={() => {
                const today = new Date();
                const y = today.getFullYear();
                const m = today.getMonth() + 1;
                const d = today.getDate();
                setYearInput(String(y));
                setMonthInput(String(m));
                setDayInput(String(d));
                update('target_year', y);
                update('target_month', m);
                update('target_day', d);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
            >设为今日</button>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-md">
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-2">年份</label>
              <input
                type="text"
                value={yearInput}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d*$/.test(v)) setYearInput(v);
                }}
                onBlur={() => {
                  const num = parseInt(yearInput);
                  if (!yearInput) {
                    const y = new Date().getFullYear();
                    setYearInput(String(y));
                    update('target_year', y);
                  } else if (!isNaN(num)) {
                    update('target_year', num);
                  }
                }}
                className="input-field !py-2 w-full text-gray-900 font-medium text-base"
                placeholder="年"
                maxLength={4}
              />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-2">月份</label>
              <input
                type="text"
                value={monthInput}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d*$/.test(v) && v.length <= 2) setMonthInput(v);
                }}
                onBlur={() => {
                  const num = parseInt(monthInput);
                  let finalVal: number;
                  if (!monthInput || isNaN(num) || num < 1) finalVal = 1; else if (num > 12) finalVal = 12; else finalVal = num;
                  setMonthInput(String(finalVal));
                  update('target_month', finalVal);
                }}
                className="input-field !py-2 w-full text-gray-900 font-medium text-base"
                placeholder="月"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-2">日期</label>
              <input
                type="text"
                value={dayInput}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^\d*$/.test(v) && v.length <= 2) setDayInput(v);
                }}
                onBlur={() => {
                  const num = parseInt(dayInput);
                  let finalVal: number;
                  if (!dayInput || isNaN(num) || num < 1) finalVal = 1; else if (num > 31) finalVal = 31; else finalVal = num;
                  setDayInput(String(finalVal));
                  update('target_day', finalVal);
                }}
                className="input-field !py-2 w-full text-gray-900 font-medium text-base"
                placeholder="日"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <TimeInput label="开始时间" value={criteria.start_time} onChange={(v) => update('start_time', v)} />
          <TimeInput label="结束时间" value={criteria.end_time} onChange={(v) => update('end_time', v)} />
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">备选排名</label>
            <input
              type="number"
              value={altRanking}
              onChange={(e) => setAltRanking(parseInt(e.target.value || '0'))}
              className="input-field !py-2 w-full text-gray-900 font-medium text-base"
            />
          </div>
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">排名(前)</label>
            <input
              type="number"
              value={criteria.large_order_ranking || ''}
              onChange={(e) => update('large_order_ranking', parseInt(e.target.value || '0'))}
              className="input-field !py-2 w-full text-gray-900 font-medium text-base"
            />
          </div>
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">均价/开盘 ≥</label>
            <input type="number" step="0.001" value={criteria.avg_price_ratio_min} onChange={(e)=>update('avg_price_ratio_min', parseFloat(e.target.value))} className="input-field !py-2 w-full text-gray-900 font-medium text-base" />
          </div>
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">量比 ≥</label>
            <input type="number" step="0.1" value={criteria.volume_ratio_min} onChange={(e)=>update('volume_ratio_min', parseFloat(e.target.value))} className="input-field !py-2 w-full text-gray-900 font-medium text-base" />
          </div>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-base text-blue-900 leading-relaxed shadow-sm">
          <div className="font-bold text-blue-800 mb-2 text-base">📊 实时预览</div>
          <div className="font-semibold text-lg">
            {(yearInput || '????')}年{(monthInput || '?')}月{(dayInput || '?')}日 {criteria.start_time} - {criteria.end_time} 行业前 {criteria.large_order_ranking} / 量比 ≥ {criteria.volume_ratio_min} / 均价开盘≥ {criteria.avg_price_ratio_min}
          </div>
        </div>
      </div>
      {/* Core numeric thresholds (second row) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="min-w-0">
          <label className="block text-sm font-semibold text-gray-700 mb-2">涨跌幅Min</label>
          <input type="number" step="0.1" value={criteria.bid_amplitude_min} onChange={(e)=>update('bid_amplitude_min', parseFloat(e.target.value))} className="input-field !py-2 w-full text-base" />
        </div>
        <div className="min-w-0">
          <label className="block text-sm font-semibold text-gray-700 mb-2">涨跌幅Max</label>
          <input type="number" step="0.1" value={criteria.bid_amplitude_max} onChange={(e)=>update('bid_amplitude_max', parseFloat(e.target.value))} className="input-field !py-2 w-full text-base" />
        </div>
        <div className="min-w-0">
          <label className="block text-sm font-semibold text-gray-700 mb-2">量比变化Min</label>
          <input type="number" step="0.01" value={criteria.volume_ratio_change_min} onChange={(e)=>update('volume_ratio_change_min', parseFloat(e.target.value))} className="input-field !py-2 w-full text-base" />
        </div>
        <div className="min-w-0">
          <label className="block text-sm font-semibold text-gray-700 mb-2">量比变化Max</label>
          <input type="number" step="0.01" value={criteria.volume_ratio_change_max} onChange={(e)=>update('volume_ratio_change_max', parseFloat(e.target.value))} className="input-field !py-2 w-full text-base" />
        </div>
        <div className="min-w-0">
          <label className="block text-sm font-semibold text-gray-700 mb-2">换手率Min(%)</label>
          <input type="number" step="0.01" value={criteria.current_turnover_min*100} onChange={(e)=>update('current_turnover_min', parseFloat(e.target.value)/100)} className="input-field !py-2 w-full text-base" />
        </div>
        <div className="min-w-0">
          <label className="block text-sm font-semibold text-gray-700 mb-2">换手率Max(%)</label>
          <input type="number" step="0.01" value={criteria.current_turnover_max*100} onChange={(e)=>update('current_turnover_max', parseFloat(e.target.value)/100)} className="input-field !py-2 w-full text-base" />
        </div>
      </div>

      {showAdvanced && (
        <div className="space-y-3 border-t pt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-2">特大单净额 ≥ (万)</label>
              <input type="number" value={criteria.large_order_net_amount_min/10000} onChange={(e)=>update('large_order_net_amount_min', parseFloat(e.target.value)*10000)} className="input-field !py-2 w-full text-base" />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-2">市值上限 (亿)</label>
              <input type="number" value={criteria.market_cap_max/1e8} onChange={(e)=>update('market_cap_max', parseFloat(e.target.value)*1e8)} className="input-field !py-2 w-full text-base" />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-2">10/20均价 ≥</label>
              <input type="number" step="0.001" value={criteria.avg_price_ratio_10_20_min} onChange={(e)=>update('avg_price_ratio_10_20_min', parseFloat(e.target.value))} className="input-field !py-2 w-full text-base" />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-2">振幅上限</label>
              <input type="number" step="0.1" value={criteria.amplitude_max} onChange={(e)=>update('amplitude_max', parseFloat(e.target.value))} className="input-field !py-2 w-full text-base" />
            </div>
            <div className="flex items-center space-x-2 mt-5">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <input type="checkbox" checked={criteria.exclude_st} onChange={(e)=>update('exclude_st', e.target.checked)} className="w-4 h-4" />
                <span>排除ST</span>
              </label>
            </div>
            <div className="flex items-center space-x-2 mt-5">
              <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <input type="checkbox" checked={criteria.include_main_board} onChange={(e)=>update('include_main_board', e.target.checked)} className="w-4 h-4" />
                <span>主板</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Generated Prompt Preview */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-600">生成的筛选提示词</label>
        <textarea className="input-field text-sm leading-relaxed h-40" value={generatedPrompt} readOnly />
        <div className="flex justify-between text-[11px] text-gray-500">
          <span>自动生成，可复制</span>
          <span>{generatedPrompt.length} 字符</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          disabled={loading}
          onClick={handleGenerate}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '🔄 生成中...' : '🚀 生成筛选条件'}
        </button>
        <button
          type="button"
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-lg font-semibold text-base transition-colors"
          onClick={() => { setCriteria(defaultCriteria); setAltRanking(20); setTemplate(DEFAULT_TEMPLATE) }}
        >🔄 重置</button>
      </div>
    </div>
  )
}

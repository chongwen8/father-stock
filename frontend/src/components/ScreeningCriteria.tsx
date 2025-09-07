'use client'

import { type ScreeningCriteria } from '@/types'

interface ScreeningCriteriaProps {
  criteria: ScreeningCriteria
  onUpdate: (criteria: ScreeningCriteria) => void
}

export function ScreeningCriteria({ criteria, onUpdate }: ScreeningCriteriaProps) {
  const handleChange = (field: keyof ScreeningCriteria, value: any) => {
    onUpdate({
      ...criteria,
      [field]: value
    })
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        解析后的筛选条件
      </h2>
      
      <div className="space-y-4">
        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              开始时间
            </label>
            <input
              type="text"
              value={criteria.start_time}
              onChange={(e) => handleChange('start_time', e.target.value)}
              className="input-field"
              placeholder="09:30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              结束时间
            </label>
            <input
              type="text"
              value={criteria.end_time}
              onChange={(e) => handleChange('end_time', e.target.value)}
              className="input-field"
              placeholder="09:33"
            />
          </div>
        </div>

        {/* Large Order Criteria */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              大单排名
            </label>
            <input
              type="number"
              value={criteria.large_order_ranking || ''}
              onChange={(e) => handleChange('large_order_ranking', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field"
              placeholder="15"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              大单百分比 (0-1)
            </label>
            <input
              type="number"
              step="0.01"
              value={criteria.large_order_percentage || ''}
              onChange={(e) => handleChange('large_order_percentage', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="input-field"
              placeholder="0.20"
            />
          </div>
        </div>

        {/* Amplitude Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最小振幅 (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={criteria.bid_amplitude_min}
              onChange={(e) => handleChange('bid_amplitude_min', parseFloat(e.target.value))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最大振幅 (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={criteria.bid_amplitude_max}
              onChange={(e) => handleChange('bid_amplitude_max', parseFloat(e.target.value))}
              className="input-field"
            />
          </div>
        </div>

        {/* Volume Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            最小量比
          </label>
          <input
            type="number"
            step="0.1"
            value={criteria.volume_ratio_min}
            onChange={(e) => handleChange('volume_ratio_min', parseFloat(e.target.value))}
            className="input-field"
          />
        </div>

        {/* Market Cap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            最大市值 (人民币)
          </label>
          <input
            type="number"
            value={criteria.market_cap_max}
            onChange={(e) => handleChange('market_cap_max', parseFloat(e.target.value))}
            className="input-field"
            placeholder="20000000000"
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={criteria.exclude_st}
              onChange={(e) => handleChange('exclude_st', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">排除ST股票</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={criteria.include_main_board}
              onChange={(e) => handleChange('include_main_board', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">仅主板股票</span>
          </label>
        </div>
      </div>
    </div>
  )
}

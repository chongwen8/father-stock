'use client'

import React from 'react'
import { CalendarIcon } from '@heroicons/react/24/outline'

interface DateSelectorProps {
  selectedDate: string
  onDateChange: (date: string) => void
  onSetToday: () => void
  onSetYesterday: () => void
  onSetTomorrow: () => void
}

export function DateSelector({
  selectedDate,
  onDateChange,
  onSetToday,
  onSetYesterday,
  onSetTomorrow
}: DateSelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <CalendarIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-900">选择目标日期</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        
        <div className="flex gap-2">
          <button
            onClick={onSetYesterday}
            className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            昨天
          </button>
          <button
            onClick={onSetToday}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            今天
          </button>
          <button
            onClick={onSetTomorrow}
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
  )
}

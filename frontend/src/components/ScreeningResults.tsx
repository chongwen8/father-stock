'use client'

import { Stock, ScreeningResponse } from '@/types'

interface ScreeningResultsProps {
  results: ScreeningResponse
  prompt: string
}

export function ScreeningResults({ results, prompt }: ScreeningResultsProps) {
  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A'
    if (marketCap >= 1000000000) {
      return `${(marketCap / 1000000000).toFixed(1)}B`
    }
    if (marketCap >= 1000000) {
      return `${(marketCap / 1000000).toFixed(1)}M`
    }
    return marketCap.toLocaleString()
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          筛选结果
        </h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>找到股票数量:</strong> {results.total_count}</p>
          <p><strong>执行时间:</strong> {results.execution_time.toFixed(2)}秒</p>
        </div>
      </div>

      {results.results.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>没有股票符合您的筛选条件</p>
          <p className="text-sm mt-2">请尝试调整筛选条件</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    代码
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    名称
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    市场
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    市值
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.results.map((stock: Stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stock.symbol}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {stock.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {stock.market}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatMarketCap(stock.market_cap)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {stock.is_st ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          ST
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          正常
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

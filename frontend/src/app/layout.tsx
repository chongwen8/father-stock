import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Father Stock - 股票筛选条件生成器',
  description: '专业的股票筛选条件生成工具，支持模板管理和一键复制',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    Father Stock
                  </h1>
                </div>
                  <div className="flex space-x-4">
                    <a href="/" className="text-gray-700 hover:text-blue-600">
                      生成器
                    </a>
                    <a href="/templates" className="text-gray-700 hover:text-blue-600">
                      模板库
                    </a>
                    <a href="/history" className="text-gray-700 hover:text-blue-600">
                      历史记录
                    </a>
                  </div>
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
      </body>
    </html>
  )
}

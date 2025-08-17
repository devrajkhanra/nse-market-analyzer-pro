"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { TrendingUp, TrendingDown, CheckCircle, XCircle } from "lucide-react"

interface StockData {
  symbol: string
  series: string
  openPrice: number
  highPrice: number
  lowPrice: number
  closePrice: number
  lastPrice: number
  prevClosePrice: number
  ttlTrdQnty: number
  ttlTrdVal: number
  timestamp: string
  isinCode: string
  date: string
}

interface StockAnalysisResult {
  symbol: string
  companyName: string
  data: StockData[]
  passed: boolean
  reason: string
}

interface StockResultsProps {
  results: StockAnalysisResult[]
  selectedDate: Date
}

export function StockResults({ results, selectedDate }: StockResultsProps) {
  const passedStocks = results.filter((result) => result.passed)
  const failedStocks = results.filter((result) => !result.passed)

  const formatNumber = (num: number) => {
    if (num === undefined || num === null || isNaN(num)) return '0'
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatPrice = (price: number) => {
    if (price === undefined || price === null || isNaN(price)) return '₹0.00'
    return `₹${price.toFixed(2)}`
  }

  const getCandleType = (data: StockData) => {
    return data.closePrice > data.openPrice ? "bullish" : "bearish"
  }

  const renderStockCard = (result: StockAnalysisResult) => (
    <Card
      key={result.symbol}
      className={`border-2 shadow-lg transition-all duration-200 hover:shadow-xl ${
        result.passed
          ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
          : "border-red-200 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-primary">{result.symbol}</CardTitle>
            <p className="text-sm text-muted-foreground">{result.companyName}</p>
          </div>
          <div className="flex items-center gap-2">
            {result.passed ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <Badge
              variant={result.passed ? "default" : "destructive"}
              className={
                result.passed
                  ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-100"
                  : ""
              }
            >
              {result.passed ? "PASSED" : "FAILED"}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{result.reason}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {result.data.map((data, index) => {
            const candleType = getCandleType(data)
            const isLatest = index === 0

            return (
              <div
                key={data.timestamp}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  isLatest ? "border-primary/30 bg-primary/5 shadow-sm" : "border-muted bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{format(new Date(data.timestamp), "MMM dd, yyyy")}</span>
                    {isLatest && (
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        Latest
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {candleType === "bullish" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <Badge
                      variant="outline"
                      className={
                        candleType === "bullish"
                          ? "text-green-700 border-green-300 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-950/30"
                          : "text-red-700 border-red-300 bg-red-50 dark:text-red-400 dark:border-red-700 dark:bg-red-950/30"
                      }
                    >
                      {candleType.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Open</p>
                    <p className="font-medium">{formatPrice(data.openPrice)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Close</p>
                    <p className="font-medium">{formatPrice(data.closePrice)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">High</p>
                    <p className="font-medium">{formatPrice(data.highPrice)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Low</p>
                    <p className="font-medium">{formatPrice(data.lowPrice)}</p>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-muted">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-muted-foreground text-xs">Volume</p>
                      <p className="font-medium text-sm">{formatNumber(data.ttlTrdQnty)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs">Value</p>
                      <p className="font-medium text-sm">{formatNumber(data.ttlTrdVal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Stock Analysis Results</h2>
        <p className="text-muted-foreground">
          Analysis for {format(selectedDate, "EEEE, MMMM do, yyyy")} and 2 previous business days
        </p>
        <div className="flex justify-center gap-4 mt-3">
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            {passedStocks.length} Passed
          </Badge>
          <Badge variant="destructive">{failedStocks.length} Failed</Badge>
        </div>
      </div>

      {passedStocks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Stocks Meeting Criteria ({passedStocks.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">{passedStocks.map(renderStockCard)}</div>
        </div>
      )}

      {failedStocks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Stocks Not Meeting Criteria ({failedStocks.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">{failedStocks.map(renderStockCard)}</div>
        </div>
      )}

      {results.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">No stock data available for the selected criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

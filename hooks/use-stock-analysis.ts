"use client"

import { useState } from "react"
import { format, subDays } from "date-fns"

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

const getPreviousBusinessDay = (date: Date, daysBack: number): Date => {
  let currentDate = new Date(date)
  let businessDaysFound = 0

  while (businessDaysFound < daysBack) {
    currentDate = subDays(currentDate, 1)
    const dayOfWeek = currentDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysFound++
    }
  }

  return currentDate
}

const formatDateForAPI = (date: Date): string => {
  return format(date, "ddMMyyyy")
}

export function useStockAnalysis() {
  const [results, setResults] = useState<StockAnalysisResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeStocks = async (selectedDate: Date, selectedStocks: string[]) => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      // Get the three business days
      const date3 = selectedDate
      const date2 = getPreviousBusinessDay(selectedDate, 1)
      const date1 = getPreviousBusinessDay(selectedDate, 2)

      const dates = [formatDateForAPI(date3), formatDateForAPI(date2), formatDateForAPI(date1)].join(",")

      // Fetch Nifty 50 data for company names
      const nifty50Response = await fetch("http://localhost:3000/api/nifty50")
      if (!nifty50Response.ok) throw new Error("Failed to fetch Nifty 50 data")
      const nifty50Data = await nifty50Response.json()

      const analysisResults: StockAnalysisResult[] = []

      // Analyze each selected stock
      for (const symbol of selectedStocks) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/stock/by-dates-and-symbol?dates=${dates}&symbol=${symbol}`,
          )

          if (!response.ok) {
            console.warn(`Failed to fetch data for ${symbol}`)
            continue
          }

          const stockData: StockData[] = await response.json()

          if (stockData.length < 3) {
            console.warn(`Insufficient data for ${symbol}`)
            continue
          }

          // Sort by date (newest first)
          const sortedData = stockData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

          const [day3, day2, day1] = sortedData

          // Apply filtering logic
          let passed = false
          let reason = ""

          // Volume test: day3 > day2 > day1
          const volumeTest = day3.ttlTrdQnty > day2.ttlTrdQnty && day2.ttlTrdQnty > day1.ttlTrdQnty

          if (volumeTest) {
            // Candle type tests
            const day3Bullish = day3.closePrice > day3.openPrice
            const day3Bearish = day3.closePrice < day3.openPrice
            const day2Bullish = day2.closePrice > day2.openPrice
            const day2Bearish = day2.closePrice < day2.openPrice

            // Selection rules
            if (day3Bullish && day2Bearish) {
              passed = true
              reason = "Highest volume on picked date (bullish), previous day bearish with lower volume"
            } else if (day3Bearish && day2Bullish) {
              passed = true
              reason = "Highest volume on picked date (bearish), previous day bullish with lower volume"
            } else {
              reason = "Volume pattern correct but candle pattern doesn't match criteria"
            }
          } else {
            reason = "Volume pattern doesn't match (picked date should have highest volume)"
          }

          // Get company name
          const company = nifty50Data.find((c: any) => c.symbol === symbol)
          const companyName = company ? company.companyName : symbol

          analysisResults.push({
            symbol,
            companyName,
            data: sortedData,
            passed,
            reason,
          })
        } catch (err) {
          console.error(`Error analyzing ${symbol}:`, err)
        }
      }

      setResults(analysisResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during analysis")
    } finally {
      setLoading(false)
    }
  }

  return {
    analyzeStocks,
    results,
    loading,
    error,
  }
}

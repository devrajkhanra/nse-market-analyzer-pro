"use client"

import { useState } from "react"
import type { SectorAnalysisResult, IndiceData } from "@/types/sector-analysis"

export function useSectorAnalysis() {
  const [results, setResults] = useState<SectorAnalysisResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPreviousBusinessDays = (date: Date): string[] => {
    const dates: string[] = []
    const currentDate = new Date(date)

    // Add the selected date
    dates.push(formatDateForAPI(currentDate))

    // Get previous business days
    let daysAdded = 0
    let dayOffset = 1

    while (daysAdded < 2) {
      const prevDate = new Date(currentDate)
      prevDate.setDate(currentDate.getDate() - dayOffset)

      // Skip weekends
      const dayOfWeek = prevDate.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(formatDateForAPI(prevDate))
        daysAdded++
      }
      dayOffset++
    }

    return dates
  }

  const formatDateForAPI = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear().toString()
    return `${day}${month}${year}`
  }

  const analyzeSectors = async (selectedDate: Date, sectors: string[]) => {
    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const dates = getPreviousBusinessDays(selectedDate)
      const datesParam = dates.join(",")

      const sectorResults: SectorAnalysisResult[] = []

      for (const sector of sectors) {
        try {
          const encodedSector = encodeURIComponent(sector)
          const response = await fetch(
            `http://localhost:3000/api/indice/by-dates-and-index?dates=${datesParam}&index=${encodedSector}`,
          )

          if (!response.ok) {
            console.warn(`Failed to fetch data for ${sector}:`, response.statusText)
            continue
          }

          const data: IndiceData[] = await response.json()

          if (data.length !== 3) {
            console.warn(`Insufficient data for ${sector}: got ${data.length} records, expected 3`)
            continue
          }

          const sortedData = data.sort((a, b) => {
            const dateA = new Date(a.indexDate.split("-").reverse().join("-"))
            const dateB = new Date(b.indexDate.split("-").reverse().join("-"))
            return dateB.getTime() - dateA.getTime()
          })

          const [date3, date2, date1] = sortedData

          // Volume test: date3 > date2 > date1
          if (!(date3.volume > date2.volume && date2.volume > date1.volume)) {
            continue
          }

          // Determine candle types
          const getCandleType = (item: IndiceData) =>
            item.closingIndexValue > item.openIndexValue ? "bullish" : "bearish"

          const candle3 = getCandleType(date3)
          const candle2 = getCandleType(date2)

          // Mixed candle direction test
          const pattern1 = candle3 === "bullish" && candle2 === "bearish"
          const pattern2 = candle3 === "bearish" && candle2 === "bullish"

          if (pattern1 || pattern2) {
            sectorResults.push({
              sectorName: sector,
              dateData: [
                {
                  date: date3.indexDate,
                  volume: date3.volume,
                  candleType: candle3,
                  openValue: date3.openIndexValue,
                  closeValue: date3.closingIndexValue,
                },
                {
                  date: date2.indexDate,
                  volume: date2.volume,
                  candleType: candle2,
                  openValue: date2.openIndexValue,
                  closeValue: date2.closingIndexValue,
                },
                {
                  date: date1.indexDate,
                  volume: date1.volume,
                  candleType: getCandleType(date1),
                  openValue: date1.openIndexValue,
                  closeValue: date1.closingIndexValue,
                },
              ],
              patternType: pattern1 ? "bullish-bearish" : "bearish-bullish",
            })
          }
        } catch (sectorError) {
          console.warn(`Error processing ${sector}:`, sectorError)
        }
      }

      setResults(sectorResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while analyzing sectors")
    } finally {
      setLoading(false)
    }
  }

  return {
    analyzeSectors,
    results,
    loading,
    error,
  }
}

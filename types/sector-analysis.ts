export interface IndiceData {
  indexName: string
  indexDate: string // DD-MM-YYYY format from API
  openIndexValue: number
  highIndexValue: number
  lowIndexValue: number
  closingIndexValue: number
  pointsChange: number
  changePercent: number | null
  volume: number
  turnoverRsCr: number | null
  pe: number
  pb: number
  divYield: number
}

export interface DateData {
  date: string
  volume: number
  candleType: "bullish" | "bearish"
  openValue: number
  closeValue: number
}

export interface SectorAnalysisResult {
  sectorName: string
  dateData: DateData[]
  patternType: "bullish-bearish" | "bearish-bullish"
}

export interface StockData {
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

export interface StockAnalysisResult {
  symbol: string
  companyName: string
  data: StockData[]
  passed: boolean
  reason: string
}

export interface Nifty50Stock {
  companyName: string
  symbol: string
  industry: string
  isinCode: string
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ChevronLeft, ChevronRight, TrendingUp, Sparkles, BarChart3, Building2 } from "lucide-react"
import { format, addDays, subDays } from "date-fns"
import { SectorResults } from "@/components/sector-results"
import { StockResults } from "@/components/stock-results"
import { StockSelector } from "@/components/stock-selector"
import { useSectorAnalysis } from "@/hooks/use-sector-analysis"
import { useStockAnalysis } from "@/hooks/use-stock-analysis"
import { ModernDatePicker } from "@/components/modern-date-picker"
import { ThemeToggle } from "@/components/theme-toggle"

const SECTORS = [
  "Nifty Auto",
  "Nifty Bank",
  "Nifty Energy",
  "Nifty Financial Services",
  "Nifty FMCG",
  "Nifty IT",
  "Nifty Media",
  "Nifty Metal",
  "Nifty MNC",
  "Nifty Pharma",
  "Nifty PSU Bank",
  "Nifty Realty",
  "Nifty India Consumption",
  "Nifty Commodities",
  "Nifty Infrastructure",
  "Nifty PSE",
  "Nifty Services Sector",
  "Nifty Oil & Gas",
  "Nifty Healthcare Index",
  "Nifty Consumer Durables",
]

const getNextBusinessDay = (date: Date, direction: "forward" | "backward"): Date => {
  let newDate = direction === "forward" ? addDays(date, 1) : subDays(date, 1)

  // Skip weekends
  while (newDate.getDay() === 0 || newDate.getDay() === 6) {
    newDate = direction === "forward" ? addDays(newDate, 1) : subDays(newDate, 1)
  }

  return newDate
}

export default function NSESectorAnalyzer() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedStocks, setSelectedStocks] = useState<string[]>([])

  const { analyzeSectors, results: sectorResults, loading: sectorLoading, error: sectorError } = useSectorAnalysis()
  const { analyzeStocks, results: stockResults, loading: stockLoading, error: stockError } = useStockAnalysis()

  const handleSectorAnalyze = async () => {
    if (!selectedDate) return
    await analyzeSectors(selectedDate, SECTORS)
  }

  const handleStockAnalyze = async () => {
    if (!selectedDate || selectedStocks.length === 0) return
    await analyzeStocks(selectedDate, selectedStocks)
  }

  const navigateDate = (direction: "forward" | "backward") => {
    if (!selectedDate) return

    const newDate = getNextBusinessDay(selectedDate, direction)

    // Don't allow future dates
    if (direction === "forward" && newDate > new Date()) return

    setSelectedDate(newDate)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-accent animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                NSE Market Analyzer
              </h1>
              <p className="text-sm text-primary font-medium">Smart • Fast • Reliable</p>
            </div>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            🚀 Analyze sectors and individual stocks with advanced volume patterns and candle detection
          </p>
        </div>

        <Tabs defaultValue="sectors" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="sectors" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Sectors
            </TabsTrigger>
            <TabsTrigger value="stocks" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Stocks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sectors">
            <Card className="mb-6 border-2 border-primary/20 shadow-xl bg-gradient-to-r from-background to-primary/5 dark:from-card dark:to-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <BarChart3 className="h-5 w-5" />
                  Sector Analysis Controls
                </CardTitle>
                <CardDescription className="text-sm">
                  Pick a date and navigate between business days for comprehensive sector analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateDate("backward")}
                      disabled={!selectedDate || sectorLoading}
                      className="h-10 w-10 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <ModernDatePicker
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      disabled={(date) => {
                        const day = date.getDay()
                        return day === 0 || day === 6 || date > new Date()
                      }}
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateDate("forward")}
                      disabled={
                        !selectedDate ||
                        sectorLoading ||
                        (selectedDate && getNextBusinessDay(selectedDate, "forward") > new Date())
                      }
                      className="h-10 w-10 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={handleSectorAnalyze}
                    disabled={!selectedDate || sectorLoading}
                    className="w-full sm:w-auto px-6 h-10 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                  >
                    {sectorLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze {SECTORS.length} Sectors
                      </>
                    )}
                  </Button>
                </div>

                {selectedDate && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <p className="text-sm font-medium text-primary">📅 {format(selectedDate, "EEEE, MMMM do, yyyy")}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fetching data for this date + 2 previous business days
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {sectorError && (
              <Card className="mb-6 border-2 border-destructive/30 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 shadow-lg">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                    <p className="text-destructive font-medium">⚠️ {sectorError}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {sectorResults && <SectorResults results={sectorResults} selectedDate={selectedDate!} />}
          </TabsContent>

          <TabsContent value="stocks">
            <Card className="mb-6 border-2 border-primary/20 shadow-xl bg-gradient-to-r from-background to-primary/5 dark:from-card dark:to-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Building2 className="h-5 w-5" />
                  Stock Analysis Controls
                </CardTitle>
                <CardDescription className="text-sm">
                  Select stocks from Nifty 50 and analyze their performance patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StockSelector selectedStocks={selectedStocks} onStocksChange={setSelectedStocks} />

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateDate("backward")}
                      disabled={!selectedDate || stockLoading}
                      className="h-10 w-10 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <ModernDatePicker
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      disabled={(date) => {
                        const day = date.getDay()
                        return day === 0 || day === 6 || date > new Date()
                      }}
                    />

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateDate("forward")}
                      disabled={
                        !selectedDate ||
                        stockLoading ||
                        (selectedDate && getNextBusinessDay(selectedDate, "forward") > new Date())
                      }
                      className="h-10 w-10 border-2 border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={handleStockAnalyze}
                    disabled={!selectedDate || selectedStocks.length === 0 || stockLoading}
                    className="w-full sm:w-auto px-6 h-10 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                  >
                    {stockLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze {selectedStocks.length} Stock{selectedStocks.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </Button>
                </div>

                {selectedDate && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                    <p className="text-sm font-medium text-primary">📅 {format(selectedDate, "EEEE, MMMM do, yyyy")}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fetching data for this date + 2 previous business days
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {stockError && (
              <Card className="mb-6 border-2 border-destructive/30 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 shadow-lg">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                    <p className="text-destructive font-medium">⚠️ {stockError}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {stockResults && <StockResults results={stockResults} selectedDate={selectedDate!} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"
import type { SectorAnalysisResult } from "@/types/sector-analysis"

interface SectorResultsProps {
  results: SectorAnalysisResult[]
  selectedDate: Date
}

export function SectorResults({ results, selectedDate }: SectorResultsProps) {
  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sectors Match Criteria</h3>
            <p className="text-muted-foreground">
              No sectors met the volume and candle pattern requirements for the selected date range.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <Badge variant="secondary" className="text-sm">
          {results.length} sector{results.length !== 1 ? "s" : ""} match criteria
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <Card key={result.sectorName} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{result.sectorName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.dateData.map((data, index) => (
                <div key={data.date} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {format(new Date(data.date.split("-").reverse().join("-")), "MMM dd, yyyy")}
                    </p>
                    <div className="flex items-center gap-2">
                      {data.candleType === "bullish" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <Badge variant={data.candleType === "bullish" ? "default" : "destructive"} className="text-xs">
                        {data.candleType}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Volume</p>
                    <p className="text-xs text-muted-foreground">{data.volume.toLocaleString()}</p>
                    <div className="mt-1">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{
                          width: `${(data.volume / Math.max(...result.dateData.map((d) => d.volume))) * 100}%`,
                          minWidth: "20%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Pattern:{" "}
                  {result.patternType === "bullish-bearish" ? "Bullish → Bearish → Lower" : "Bearish → Bullish → Lower"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface Nifty50Stock {
  companyName: string
  symbol: string
  industry: string
  isinCode: string
}

interface StockSelectorProps {
  selectedStocks: string[]
  onStocksChange: (stocks: string[]) => void
}

export function StockSelector({ selectedStocks, onStocksChange }: StockSelectorProps) {
  const [open, setOpen] = useState(false)
  const [stocks, setStocks] = useState<Nifty50Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/nifty50")
        if (!response.ok) throw new Error("Failed to fetch stocks")
        const data = await response.json()
        setStocks(data)
      } catch (error) {
        console.error("Error fetching stocks:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStocks()
  }, [])

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleStock = (symbol: string) => {
    if (selectedStocks.includes(symbol)) {
      onStocksChange(selectedStocks.filter((s) => s !== symbol))
    } else {
      onStocksChange([...selectedStocks, symbol])
    }
  }

  const removeStock = (symbol: string) => {
    onStocksChange(selectedStocks.filter((s) => s !== symbol))
  }

  const clearAll = () => {
    onStocksChange([])
  }

  const selectAll = () => {
    onStocksChange(stocks.map(stock => stock.symbol))
  }

  const getStockName = (symbol: string) => {
    const stock = stocks.find((s) => s.symbol === symbol)
    return stock ? stock.companyName : symbol
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks by name or symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 border-primary/20 focus:border-primary"
          />
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between border-2 border-primary/20 hover:border-primary bg-transparent"
            >
              Select stocks...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Search stocks..." />
              <CommandList>
                <CommandEmpty>{loading ? "Loading stocks..." : "No stocks found."}</CommandEmpty>
                <CommandGroup>
                  {filteredStocks.map((stock) => (
                    <CommandItem key={stock.symbol} value={stock.symbol} onSelect={() => toggleStock(stock.symbol)}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedStocks.includes(stock.symbol) ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{stock.symbol}</span>
                        <span className="text-xs text-muted-foreground">{stock.companyName}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedStocks.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="border-destructive/30 text-destructive hover:bg-destructive/10 bg-transparent"
          >
            Clear All
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={selectAll}
          disabled={loading || selectedStocks.length === stocks.length}
          className="border-primary/30 text-primary hover:bg-primary/10 bg-transparent"
        >
          Select All
        </Button>
      </div>

      {selectedStocks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStocks.map((symbol) => (
            <Badge
              key={symbol}
              variant="secondary"
              className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <span className="font-medium">{symbol}</span>
              <span className="text-xs ml-1 opacity-70">{getStockName(symbol).split(" ").slice(0, 2).join(" ")}</span>
              <button onClick={() => removeStock(symbol)} className="ml-2 hover:text-destructive transition-colors">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Selected {selectedStocks.length} of {stocks.length} stocks
      </p>
    </div>
  )
}

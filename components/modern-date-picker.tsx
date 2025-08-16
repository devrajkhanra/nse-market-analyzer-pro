"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns"
import { cn } from "@/lib/utils"

interface ModernDatePickerProps {
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  disabled?: (date: Date) => boolean
}

export function ModernDatePicker({ selectedDate, onDateSelect, disabled }: ModernDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())
  const [isOpen, setIsOpen] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => (direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)))
  }

  const handleDateClick = (date: Date) => {
    if (disabled?.(date)) return
    onDateSelect(date)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-[280px] justify-start text-left font-normal h-12 border-2 border-primary/30 hover:border-primary/50 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-200",
          !selectedDate && "text-muted-foreground",
        )}
      >
        <Calendar className="mr-3 h-5 w-5 text-primary" />
        {selectedDate ? format(selectedDate, "EEEE, MMM do, yyyy") : "Pick a date"}
      </Button>

      {isOpen && (
        <Card className="absolute top-14 left-0 z-50 w-80 shadow-2xl border-2 border-primary/20 bg-white">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-semibold text-lg text-primary">{format(currentMonth, "MMMM yyyy")}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("next")}
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const isDisabled = disabled?.(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isCurrentMonth = isSameMonth(day, currentMonth)

                return (
                  <Button
                    key={day.toISOString()}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    className={cn(
                      "h-8 w-8 p-0 text-sm font-normal hover:bg-primary/10 transition-colors",
                      !isCurrentMonth && "text-muted-foreground/50",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                      isDisabled && "opacity-30 cursor-not-allowed",
                    )}
                  >
                    {format(day, "d")}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

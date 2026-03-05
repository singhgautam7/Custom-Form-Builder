"use client"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import type { Question, QuestionErrors, DateOptions } from "../types"

function DatePicker({ value, onChange, label }: { value?: string; onChange: (v: string | undefined) => void; label: string }) {
  const date = value ? new Date(value + "T00:00:00") : undefined
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full h-8 text-xs justify-start font-normal">
            <CalendarIcon className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            {value || "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={(d) => {
            if (d) {
              const y = d.getFullYear()
              const m = String(d.getMonth() + 1).padStart(2, "0")
              const day = String(d.getDate()).padStart(2, "0")
              onChange(`${y}-${m}-${day}`)
            } else { onChange(undefined) }
          }} />
        </PopoverContent>
      </Popover>
      {value && (
        <Button variant="ghost" size="sm" className="h-5 text-[10px] text-muted-foreground px-1" onClick={() => onChange(undefined)}>Clear</Button>
      )}
    </div>
  )
}

export function DateEditor({ question, errors, onUpdate }: {
  question: Question; errors: QuestionErrors; onUpdate: (patch: Partial<Question>) => void
}) {
  const dateOpts: DateOptions = (question.options && typeof question.options === "object" && !Array.isArray(question.options))
    ? question.options as DateOptions
    : { allow_past: true }

  const updateOpt = (key: string, val: any) => {
    const current: DateOptions = (typeof question.options === "object" && !Array.isArray(question.options))
      ? question.options as DateOptions : {}
    onUpdate({ options: { ...current, [key]: val } })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox id={`past-${question.id}`} checked={dateOpts.allow_past !== false} onCheckedChange={(v: boolean) => updateOpt("allow_past", v)} />
        <Label htmlFor={`past-${question.id}`} className="text-sm cursor-pointer">Allow past dates</Label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DatePicker label="Min Date" value={dateOpts.min_date} onChange={v => updateOpt("min_date", v || null)} />
        <DatePicker label="Max Date" value={dateOpts.max_date} onChange={v => updateOpt("max_date", v || null)} />
      </div>
      {errors.min_date && <Label className="text-red-500 text-sm">{errors.min_date}</Label>}
    </div>
  )
}

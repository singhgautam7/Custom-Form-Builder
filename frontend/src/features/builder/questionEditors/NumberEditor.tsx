"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Question, QuestionErrors } from "../types"

export function NumberEditor({ question, errors, onUpdate }: {
  question: Question; errors: QuestionErrors; onUpdate: (patch: Partial<Question>) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Min value</Label>
        <Input type="number" value={question.min_value ?? ""} onChange={e => onUpdate({ min_value: e.target.value ? parseFloat(e.target.value) : undefined })} placeholder="No min" className="h-8 text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Max value</Label>
        <Input type="number" value={question.max_value ?? ""} onChange={e => onUpdate({ max_value: e.target.value ? parseFloat(e.target.value) : undefined })} placeholder="No max" className="h-8 text-sm" />
      </div>
      {errors.min_value && <Label className="text-red-500 text-sm col-span-2">{errors.min_value}</Label>}
    </div>
  )
}

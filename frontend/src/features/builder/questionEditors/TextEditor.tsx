"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Question, QuestionErrors } from "../types"

export function TextEditor({ question, errors, onUpdate }: {
  question: Question; errors: QuestionErrors; onUpdate: (patch: Partial<Question>) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Min characters length</Label>
        <Input type="number" value={question.min_length ?? ""} onChange={e => onUpdate({ min_length: e.target.value ? parseInt(e.target.value) : undefined })} placeholder="0" className="h-8 text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Max characters length</Label>
        <Input type="number" value={question.max_length ?? ""} onChange={e => onUpdate({ max_length: e.target.value ? parseInt(e.target.value) : undefined })} placeholder="No limit" className="h-8 text-sm" />
      </div>
      {errors.min_length && <Label className="text-red-500 text-sm col-span-2">{errors.min_length}</Label>}
    </div>
  )
}

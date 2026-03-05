"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import type { Question, QuestionErrors, Option } from "../types"

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
}

export function ChoiceEditor({ question, errors, onUpdate }: {
  question: Question; errors: QuestionErrors; onUpdate: (patch: Partial<Question>) => void
}) {
  const options = (Array.isArray(question.options) ? question.options : []) as Option[]

  const addOption = () => {
    const n = options.length + 1
    onUpdate({ options: [...options, { label: `Option ${n}`, value: `option-${n}` }] })
  }
  const updateLabel = (i: number, label: string) => {
    const updated = options.map((o, idx) => idx === i ? { ...o, label, value: slugify(label) || o.value } : o)
    onUpdate({ options: updated })
  }
  const removeOption = (i: number) => {
    onUpdate({ options: options.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Options</Label>
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground w-16 shrink-0">Option {i + 1}</Label>
          <Input value={opt.label} onChange={e => updateLabel(i, e.target.value)} className="h-8 text-sm" />
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeOption(i)}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addOption} className="h-7 text-xs">
        <Plus className="w-3 h-3 mr-1" /> Add Option
      </Button>
      {errors.options && <Label className="text-red-500 text-sm">{errors.options}</Label>}
    </div>
  )
}

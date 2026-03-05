"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock } from "lucide-react"
import type { Question, FormData, Option } from "../types"

// ─── Preview Validation ─────────────────────────────────

function validatePreviewAnswer(q: Question, val: any): string | undefined {
  if (q.is_required) {
    if (val === undefined || val === null || val === "") return "This field is required."
    if (Array.isArray(val) && val.length === 0) return "At least one option must be selected."
  }
  if (!val && val !== 0) return undefined
  const t = q.question_type

  if ((t === "text" || t === "textarea") && typeof val === "string") {
    if (q.min_length && val.length < q.min_length) return `Minimum ${q.min_length} characters required.`
    if (q.max_length && val.length > q.max_length) return `Maximum ${q.max_length} characters allowed.`
  }
  if (t === "number" && typeof val === "number") {
    if (q.min_value !== undefined && val < q.min_value) return `Minimum value is ${q.min_value}.`
    if (q.max_value !== undefined && val > q.max_value) return `Maximum value is ${q.max_value}.`
  }
  if (t === "date" && typeof val === "string") {
    const d = new Date(val)
    const dateOpts = (q.options && typeof q.options === "object" && !Array.isArray(q.options)) ? q.options as any : {}
    if (dateOpts.allow_past === false && d < new Date(new Date().toDateString())) return "Past dates are not allowed."
    if (dateOpts.min_date && d < new Date(dateOpts.min_date)) return `Date must be on or after ${dateOpts.min_date}.`
    if (dateOpts.max_date && d > new Date(dateOpts.max_date)) return `Date must be on or before ${dateOpts.max_date}.`
  }
  if (t === "email" && typeof val === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Invalid email format."
  return undefined
}

// ─── Single Question Renderer ───────────────────────────

function PreviewQuestion({ question, value, error, onChange }: {
  question: Question; value: any; error?: string; onChange: (v: any) => void
}) {
  const t = question.question_type
  const choiceOpts = (Array.isArray(question.options) ? question.options : []) as Option[]

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">
        {question.question_text || "Untitled Question"}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {question.help_text && <p className="text-sm text-muted-foreground">{question.help_text}</p>}

      {t === "text" && <Input value={value || ""} onChange={e => onChange(e.target.value)} placeholder={question.placeholder || "Your answer"} />}
      {t === "textarea" && <Textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={question.placeholder || "Your answer"} className="min-h-[100px]" />}
      {t === "email" && <Input type="email" value={value || ""} onChange={e => onChange(e.target.value)} placeholder="email@example.com" />}
      {t === "number" && <Input type="number" value={value ?? ""} onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : "")} placeholder="0" />}
      {t === "date" && <Input type="date" value={value || ""} onChange={e => onChange(e.target.value)} />}

      {t === "radio" && (
        <RadioGroup value={value || ""} onValueChange={onChange} className="space-y-2">
          {choiceOpts.map((opt, i) => (
            <div key={i} className="flex items-center space-x-2 p-2 rounded-md border hover:bg-muted/40 cursor-pointer" onClick={() => onChange(opt.value)}>
              <RadioGroupItem value={opt.value} id={`prev-r-${question.id}-${i}`} />
              <Label htmlFor={`prev-r-${question.id}-${i}`} className="cursor-pointer flex-1">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {(t === "checkbox" || t === "multiselect") && (
        <div className="space-y-2">
          {choiceOpts.map((opt, i) => (
            <div key={i} className="flex items-center space-x-2 p-2 rounded-md border hover:bg-muted/40 cursor-pointer">
              <Checkbox id={`prev-c-${question.id}-${i}`} checked={Array.isArray(value) && value.includes(opt.value)}
                onCheckedChange={(checked: boolean) => {
                  const arr = Array.isArray(value) ? [...value] : []
                  if (checked) arr.push(opt.value)
                  else { const idx = arr.indexOf(opt.value); if (idx > -1) arr.splice(idx, 1) }
                  onChange(arr)
                }} />
              <Label htmlFor={`prev-c-${question.id}-${i}`} className="cursor-pointer flex-1">{opt.label}</Label>
            </div>
          ))}
        </div>
      )}

      {t === "dropdown" && (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
          <SelectContent>
            {choiceOpts.map((opt, i) => <SelectItem key={i} value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      {error && <Label className="text-red-500 text-sm">{error}</Label>}
    </div>
  )
}

// ─── Form Renderer ──────────────────────────────────────

export function FormRenderer({ form, questions, onSubmit }: {
  form: FormData; questions: Question[]; onSubmit?: (values: Record<string, any>) => void
}) {
  const [values, setValues] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const errs: Record<string, string> = {}
    for (const q of questions) {
      const err = validatePreviewAnswer(q, values[q.id])
      if (err) errs[q.id] = err
    }
    setErrors(errs)
    if (Object.keys(errs).length === 0 && onSubmit) onSubmit(values)
  }

  return (
    <div className="max-w-[700px] mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{form.title || "Untitled Form"}</h1>
        {form.description && <p className="text-muted-foreground whitespace-pre-wrap">{form.description}</p>}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Created on {new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
          {form.is_password_protected && <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Password protected</span>}
        </div>
      </div>

      <Separator />

      {questions.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">No questions to preview. Add questions in the Build tab.</p>
      )}

      {questions.map(q => (
        <PreviewQuestion
          key={q.id} question={q} value={values[q.id]} error={errors[q.id]}
          onChange={v => {
            setValues(prev => ({ ...prev, [q.id]: v }))
            setErrors(prev => { const n = { ...prev }; delete n[q.id]; return n })
          }}
        />
      ))}

      {questions.length > 0 && (
        <div className="pt-4">
          <Button size="lg" className="w-full sm:w-auto px-8" onClick={handleSubmit}>Submit Form</Button>
        </div>
      )}
    </div>
  )
}

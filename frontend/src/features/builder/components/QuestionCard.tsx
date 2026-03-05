"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Trash2 } from "lucide-react"
import { questionEditorRegistry } from "../questionEditors/registry"
import type { Question, QuestionErrors } from "../types"
import { BADGE_COLORS, QUESTION_TYPES } from "../types"

export function QuestionCard({ question, index, errors, onUpdate, onDuplicate, onDelete, highlighted }: {
  question: Question; index: number; errors: QuestionErrors
  onUpdate: (patch: Partial<Question>) => void
  onDuplicate: () => void; onDelete: () => void; highlighted: boolean
}) {
  const typeInfo = QUESTION_TYPES.find(qt => qt.type === question.question_type)!
  const Editor = questionEditorRegistry[question.question_type]

  return (
    <Card className={`transition-all duration-300 group ${highlighted ? "ring-2 ring-primary/50 shadow-lg" : "hover:shadow-md"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wider ${BADGE_COLORS[question.question_type]}`}>
              {typeInfo.label}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">Question {index + 1}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip><TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate}><Copy className="w-3.5 h-3.5" /></Button>
            </TooltipTrigger><TooltipContent>Duplicate</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete}><Trash2 className="w-3.5 h-3.5" /></Button>
            </TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label className="text-sm">Question Text <span className="text-destructive">*</span></Label>
          <Input value={question.question_text} onChange={e => onUpdate({ question_text: e.target.value })} placeholder="Enter your question" />
          {errors.question_text && <Label className="text-red-500 text-sm">{errors.question_text}</Label>}
        </div>

        <div className="space-y-1">
          <Label className="text-sm text-muted-foreground">Help Text</Label>
          <Input value={question.help_text || ""} onChange={e => onUpdate({ help_text: e.target.value })} placeholder="Optional helper text" className="text-sm" />
        </div>

        <div className="flex items-center justify-between py-1">
          <Label className="text-sm cursor-pointer" htmlFor={`req-${question.id}`}>Required</Label>
          <Switch id={`req-${question.id}`} checked={question.is_required} onCheckedChange={v => onUpdate({ is_required: v })} />
        </div>

        <Separator />

        <Editor question={question} errors={errors} onUpdate={onUpdate} />
      </CardContent>
    </Card>
  )
}

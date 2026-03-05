"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Type, AlignLeft, Mail, Hash, CalendarIcon, CircleDot, CheckSquare, ChevronDown, List } from "lucide-react"
import type { QuestionType } from "../types"
import { QUESTION_TYPES } from "../types"

const ICONS: Record<string, any> = {
  Type, AlignLeft, Mail, Hash, CalendarIcon, CircleDot, CheckSquare, ChevronDown, List,
}

export function AddQuestionCard({ onAdd }: { onAdd: (type: QuestionType) => void }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Add Questions</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {QUESTION_TYPES.map(qt => {
            const Icon = ICONS[qt.iconName] || Type
            return (
              <Button key={qt.type} variant="outline" className={`h-auto py-3 px-2 flex flex-col items-center gap-1.5 text-xs font-medium border ${qt.color} hover:opacity-80`} onClick={() => onAdd(qt.type)}>
                <Icon className="w-4 h-4" />
                {qt.label}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

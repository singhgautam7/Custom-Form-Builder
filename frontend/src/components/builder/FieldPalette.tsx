"use client"

import React from 'react';
import { useBuilderStore, QuestionType } from "@/stores/builderStore"
import { IconAbc, IconMail, IconNumber123, IconCalendar, IconTextWrap, IconCircleDot, IconSquareCheck, IconSelect, IconList } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

export function FieldPalette() {
  const { addField } = useBuilderStore()

  const fieldTypes: { type: QuestionType, icon: React.ElementType, label: string }[] = [
    { type: 'text', icon: IconAbc, label: 'Short Text' },
    { type: 'textarea', icon: IconTextWrap, label: 'Long Text' },
    { type: 'email', icon: IconMail, label: 'Email' },
    { type: 'number', icon: IconNumber123, label: 'Number' },
    { type: 'date', icon: IconCalendar, label: 'Date' },
    { type: 'radio', icon: IconCircleDot, label: 'Single Choice' },
    { type: 'checkbox', icon: IconSquareCheck, label: 'Checkboxes' },
    { type: 'dropdown', icon: IconSelect, label: 'Dropdown' },
    { type: 'multiselect', icon: IconList, label: 'Multiple Select' },
  ]

  return (
    <div className="w-[280px] border-r border-border/50 bg-card/30 flex flex-col h-full overscroll-none">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold text-sm tracking-tight">Form Elements</h3>
        <p className="text-xs text-muted-foreground mt-1">Select fields to add to your canvas.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {fieldTypes.map(ft => (
          <button
            key={ft.type}
            className={cn(
               "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground",
               "border border-transparent hover:border-border/60 hover:bg-muted/30 transition-all",
               "group active:scale-[0.98]"
            )}
            onClick={() => addField({
              type: ft.type,
              question_text: `New ${ft.label}`,
              is_required: false
            })}
          >
            <div className="bg-muted rounded p-1.5 group-hover:bg-background transition-colors border border-border/40 shadow-sm">
              <ft.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="font-medium tracking-tight group-hover:text-foreground text-muted-foreground transition-colors">{ft.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

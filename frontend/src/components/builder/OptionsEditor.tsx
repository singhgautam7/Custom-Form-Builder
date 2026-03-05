"use client"

import React from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface Option {
  id: string
  label: string
  value: string
}

interface OptionsEditorProps {
  options: Option[]
  onChange: (options: Option[]) => void
  disabled?: boolean
}

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

function SortableItem({ option, index, disabled, updateOption, removeOption }: { option: Option, index: number, disabled: boolean, updateOption: (id: string, label: string) => void, removeOption: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: option.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 group ${isDragging ? 'bg-muted/50 rounded-lg' : ''}`}>
      {!disabled && (
        <button
          type="button"
          className="p-1 text-muted-foreground/40 hover:text-foreground cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
      )}

      <Label className="text-xs text-muted-foreground whitespace-nowrap w-16 shrink-0">Option {index + 1}</Label>

      <Input
        value={option.label}
        onChange={(e) => updateOption(option.id, e.target.value)}
        placeholder={`Option ${index + 1}`}
        className="h-8 text-sm flex-1"
        disabled={disabled}
      />

      {!disabled && (
        <button
          type="button"
          onClick={() => removeOption(option.id)}
          className="p-1.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export function OptionsEditor({ options, onChange, disabled = false }: OptionsEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = options.findIndex((item) => item.id === active.id)
      const newIndex = options.findIndex((item) => item.id === over.id)
      onChange(arrayMove(options, oldIndex, newIndex))
    }
  }

  const handleAdd = () => {
    const newId = crypto.randomUUID()
    const label = `Option ${options.length + 1}`
    onChange([...options, { id: newId, label, value: generateSlug(label) }])
  }

  const updateOption = (id: string, label: string) => {
    onChange(options.map(opt =>
      opt.id === id ? { ...opt, label, value: generateSlug(label) } : opt
    ))
  }

  const removeOption = (id: string) => {
    onChange(options.filter(opt => opt.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
         <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Choice Options</Label>
         {!disabled && (
           <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] uppercase font-semibold text-primary/80 hover:text-primary" onClick={handleAdd}>
             <Plus className="w-3 h-3 mr-1" /> Add
           </Button>
         )}
      </div>

      <div className="space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={options} strategy={verticalListSortingStrategy}>
            {options.map((option, index) => (
              <SortableItem
                key={option.id}
                option={option}
                index={index}
                disabled={disabled}
                updateOption={updateOption}
                removeOption={removeOption}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {options.length === 0 && (
         <div className="text-center p-4 border border-dashed rounded-lg bg-muted/10">
            <p className="text-xs text-muted-foreground">No options added yet.</p>
         </div>
      )}
    </div>
  )
}

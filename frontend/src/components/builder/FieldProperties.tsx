"use client"

import { useBuilderStore } from "@/stores/builderStore"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { OptionsEditor } from "@/components/builder/OptionsEditor"
import { validateQuestion, ValidationError } from "@/lib/validation"
import { AlertCircle } from "lucide-react"

function FieldError({ errors, field }: { errors: ValidationError[], field: string }) {
  const match = errors.find(e => e.field === field)
  if (!match) return null
  return (
    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {match.message}
    </p>
  )
}

export function FieldProperties() {
  const { fields, activeFieldId, updateField, metadata, setMetadata } = useBuilderStore()

  const activeField = fields.find(f => f.id === activeFieldId)

  // Form Settings View (when no field is selected)
  if (!activeField) {
    return (
      <div className="w-[320px] border-l border-border/50 bg-card/30 flex flex-col h-full">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-sm tracking-tight">Form Settings</h3>
          <p className="text-xs text-muted-foreground mt-1">Configure global form properties.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
           <div className="space-y-3">
             <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Title</Label>
             <Input
               value={metadata.title}
               onChange={(e) => setMetadata({ title: e.target.value })}
               placeholder="Form Title"
             />
           </div>

           <div className="space-y-3">
             <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
             <Input
               value={metadata.description}
               onChange={(e) => setMetadata({ description: e.target.value })}
               placeholder="Brief description of your form."
             />
           </div>

           <div className="space-y-3 pt-4 border-t border-border/50">
             <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">After Submission</Label>
             <Input
               value={metadata.success_message || ''}
               onChange={(e) => setMetadata({ success_message: e.target.value })}
               placeholder="Success message (optional)"
             />
           </div>
        </div>
      </div>
    )
  }

  // Active Field Properties View
  const errors = validateQuestion(activeField)
  const isLocked = metadata.status === 'PUBLISHED'
  const type = activeField.type
  const dateOpts = (type === 'date' && activeField.options && typeof activeField.options === 'object' && !Array.isArray(activeField.options))
    ? activeField.options as Record<string, any>
    : {}

  const updateDateOption = (key: string, value: any) => {
    const current = (typeof activeField.options === 'object' && !Array.isArray(activeField.options))
      ? activeField.options as Record<string, any>
      : {}
    updateField(activeField.id, { options: { ...current, [key]: value } })
  }

  return (
    <div className="w-[320px] border-l border-border/50 bg-card/30 flex flex-col h-full">
       <div className="p-4 border-b border-border/50 flex flex-col justify-center">
           <h3 className="font-semibold text-sm tracking-tight flex items-center gap-2">
             <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">{type}</span>
             Properties
           </h3>
           <p className="text-xs text-muted-foreground mt-1">Configure the selected field.</p>
       </div>

       <div className="flex-1 overflow-y-auto p-5 pb-12 space-y-6 custom-scrollbar">
         {/* Basic Settings */}
         <div className="space-y-4">
           <div className="space-y-2">
             <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Question Title</Label>
             <Input
               value={activeField.question_text}
               onChange={(e) => updateField(activeField.id, { question_text: e.target.value })}
               disabled={isLocked}
             />
             <FieldError errors={errors} field="question_text" />
           </div>

           <div className="space-y-2">
             <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Help Text</Label>
             <Input
               value={activeField.help_text || ''}
               placeholder="Optional description"
               onChange={(e) => updateField(activeField.id, { help_text: e.target.value })}
               disabled={isLocked}
             />
           </div>

           <div className="flex items-center space-x-2 pt-2 border-t border-border/40 mt-4">
             <Checkbox
               id="required-toggle"
               checked={activeField.is_required}
               onCheckedChange={(checked: boolean) => updateField(activeField.id, { is_required: checked })}
               disabled={isLocked}
             />
             <Label htmlFor="required-toggle" className="font-normal cursor-pointer">Required field</Label>
           </div>
         </div>

         {/* Validation Constraints */}
         <div className="space-y-4 pt-4 border-t border-border/50">
           <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Validation Constraints</Label>

           {/* NUMBER: min_value / max_value */}
           {type === 'number' && (
             <>
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground">Min Value</Label>
                   <Input
                     type="number"
                     value={activeField.min_value ?? ''}
                     onChange={(e) => updateField(activeField.id, { min_value: e.target.value ? parseFloat(e.target.value) : undefined })}
                     placeholder="0"
                     disabled={isLocked}
                   />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground">Max Value</Label>
                   <Input
                     type="number"
                     value={activeField.max_value ?? ''}
                     onChange={(e) => updateField(activeField.id, { max_value: e.target.value ? parseFloat(e.target.value) : undefined })}
                     placeholder="100"
                     disabled={isLocked}
                   />
                 </div>
               </div>
               <FieldError errors={errors} field="min_value" />
             </>
           )}

           {/* TEXT / TEXTAREA: min_length / max_length */}
           {(type === 'text' || type === 'textarea') && (
             <>
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground">Min Length</Label>
                   <Input
                     type="number"
                     value={activeField.min_length ?? ''}
                     onChange={(e) => updateField(activeField.id, { min_length: e.target.value ? parseInt(e.target.value) : undefined })}
                     placeholder="0"
                     disabled={isLocked}
                   />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground">Max Length</Label>
                   <Input
                     type="number"
                     value={activeField.max_length ?? ''}
                     onChange={(e) => updateField(activeField.id, { max_length: e.target.value ? parseInt(e.target.value) : undefined })}
                     placeholder="100"
                     disabled={isLocked}
                   />
                 </div>
               </div>
               <FieldError errors={errors} field="min_length" />
             </>
           )}

           {/* DATE: allow_past, min_date, max_date */}
           {type === 'date' && (
             <div className="space-y-4">
               <div className="flex items-center space-x-2">
                 <Checkbox
                   id="allow-past-toggle"
                   checked={dateOpts.allow_past !== false}
                   onCheckedChange={(checked: boolean) => updateDateOption('allow_past', checked)}
                   disabled={isLocked}
                 />
                 <Label htmlFor="allow-past-toggle" className="font-normal cursor-pointer text-sm">Allow past dates</Label>
               </div>

               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground">Min Date</Label>
                   <Input
                     type="date"
                     value={dateOpts.min_date || ''}
                     onChange={(e) => updateDateOption('min_date', e.target.value || null)}
                     disabled={isLocked}
                   />
                   <FieldError errors={errors} field="min_date" />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-xs text-muted-foreground">Max Date</Label>
                   <Input
                     type="date"
                     value={dateOpts.max_date || ''}
                     onChange={(e) => updateDateOption('max_date', e.target.value || null)}
                     disabled={isLocked}
                   />
                   <FieldError errors={errors} field="max_date" />
                 </div>
               </div>
             </div>
           )}

           {/* TEXT / TEXTAREA / EMAIL: Regex */}
           {(type === 'text' || type === 'textarea' || type === 'email') && (
             <div className="space-y-1">
               <Label className="text-xs text-muted-foreground">Regex Pattern</Label>
               <Input
                 value={activeField.regex || ''}
                 placeholder="^[A-Z]+$"
                 onChange={(e) => updateField(activeField.id, { regex: e.target.value })}
                 disabled={isLocked}
               />
               <FieldError errors={errors} field="regex" />
             </div>
           )}

           {/* Custom Error Message */}
           <div className="space-y-1">
             <Label className="text-xs text-muted-foreground">Custom Error Message</Label>
             <Input
               value={activeField.custom_error || ''}
               placeholder="Invalid input"
               onChange={(e) => updateField(activeField.id, { custom_error: e.target.value })}
               disabled={isLocked}
             />
           </div>

           {/* CHOICE FIELDS: Options Editor */}
           {(type === 'dropdown' || type === 'radio' || type === 'checkbox' || type === 'multiselect') && (
             <div className="pt-4 border-t border-border/50">
                <OptionsEditor
                  disabled={isLocked}
                  options={Array.isArray(activeField.options) ? activeField.options.map((opt: any) =>
                     typeof opt === 'string' ? { id: crypto.randomUUID(), label: opt, value: opt.toLowerCase().replace(/[^a-z0-9]+/g, '-') } : opt
                  ) : []}
                  onChange={(newOptions) => updateField(activeField.id, { options: newOptions })}
                />
                <FieldError errors={errors} field="options" />
             </div>
           )}

         </div>
       </div>
    </div>
  )
}

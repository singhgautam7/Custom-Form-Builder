"use client"

import { useBuilderStore } from "@/stores/builderStore"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

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
  return (
    <div className="w-[320px] border-l border-border/50 bg-card/30 flex flex-col h-full">
       <div className="p-4 border-b border-border/50 flex justify-between items-center">
         <div>
           <h3 className="font-semibold text-sm tracking-tight flex items-center gap-2">
             <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">{activeField.type}</span>
             Properties
           </h3>
           <p className="text-xs text-muted-foreground mt-1">Configure the selected item.</p>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
         {/* Basic Settings */}
         <div className="space-y-4">
           <div className="space-y-2">
             <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Question Title</Label>
             <Input
               value={activeField.question_text}
               onChange={(e) => updateField(activeField.id, { question_text: e.target.value })}
             />
           </div>

           <div className="space-y-2">
             <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Help Text</Label>
             <Input
               value={activeField.help_text || ''}
               placeholder="Optional description"
               onChange={(e) => updateField(activeField.id, { help_text: e.target.value })}
             />
           </div>

           <div className="flex items-center space-x-2 pt-2 border-t border-border/40 mt-4">
             <Checkbox
               id="required-toggle"
               checked={activeField.is_required}
               onCheckedChange={(checked: boolean) => updateField(activeField.id, { is_required: checked })}
             />
             <Label htmlFor="required-toggle" className="font-normal cursor-pointer">Required field</Label>
           </div>
         </div>

         {/* Advanced Settings */}
         <div className="space-y-4 pt-4 border-t border-border/50">
           <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Validation Constraints</Label>

           <div className="grid grid-cols-2 gap-3">
             <div className="space-y-2">
               <Label className="text-xs text-muted-foreground">Min Length / Val</Label>
               <Input
                 type="number"
                 value={activeField.min_length || activeField.min_value || ''}
                 onChange={(e) => updateField(activeField.id, { min_length: parseInt(e.target.value) })}
                 placeholder="0"
               />
             </div>
             <div className="space-y-2">
               <Label className="text-xs text-muted-foreground">Max Length / Val</Label>
               <Input
                 type="number"
                 value={activeField.max_length || activeField.max_value || ''}
                 onChange={(e) => updateField(activeField.id, { max_length: parseInt(e.target.value) })}
                 placeholder="100"
               />
             </div>
           </div>

           <div className="space-y-2">
             <Label className="text-xs text-muted-foreground">Regex Pattern</Label>
             <Input
               value={activeField.regex || ''}
               placeholder="^[A-Z]+$"
               onChange={(e) => updateField(activeField.id, { regex: e.target.value })}
             />
           </div>

           <div className="space-y-2">
             <Label className="text-xs text-muted-foreground">Custom Error Message</Label>
             <Input
               value={activeField.custom_error || ''}
               placeholder="Invalid input"
               onChange={(e) => updateField(activeField.id, { custom_error: e.target.value })}
             />
           </div>
         </div>
       </div>
    </div>
  )
}

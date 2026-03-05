"use client"

import { useBuilderStore } from "@/stores/builderStore"
import { cn } from "@/lib/utils"
import { GripVertical, Copy, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function CanvasPreview() {
  const { fields, activeFieldId, setActiveField, removeField, duplicateField, metadata, setMetadata } = useBuilderStore()

  return (
    <div className="flex-1 bg-muted/10 overflow-y-auto flex flex-col h-full relative" onClick={() => setActiveField(null)}>
       <div className="max-w-[700px] w-full mx-auto p-8 lg:p-12 pb-32 space-y-4">

         <div className="mb-8 p-6 bg-card border border-border/40 shadow-sm rounded-xl">
            <input
              value={metadata.title}
              onChange={(e) => setMetadata({ title: e.target.value })}
              className="text-2xl font-semibold tracking-tight bg-transparent border-none outline-none focus:ring-0 w-full p-0 placeholder:text-muted-foreground/50"
              placeholder="Form Title"
            />
            <textarea
              value={metadata.description}
              onChange={(e) => setMetadata({ description: e.target.value })}
              className="text-muted-foreground mt-2 text-sm bg-transparent border-none outline-none focus:ring-0 w-full resize-none p-0 placeholder:text-muted-foreground/50 leading-relaxed"
              placeholder="Form description placeholder goes here..."
              rows={2}
            />
         </div>

         {fields.length === 0 ? (
           <div className="text-center p-16 border-2 border-dashed border-border/50 rounded-xl bg-card/20">
             <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
               <GripVertical className="text-muted-foreground h-5 w-5 opacity-50" />
             </div>
             <p className="font-medium">Your canvas is empty</p>
             <p className="text-sm text-muted-foreground mt-1">Select an element from the left panel to begin mapping logic.</p>
           </div>
         ) : (
           <div className="space-y-3">
             <AnimatePresence>
               {fields.map((field) => (
                 <motion.div
                   key={field.id}
                   layout
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ duration: 0.2 }}
                 >
                   <div
                     onClick={(e) => { e.stopPropagation(); setActiveField(field.id) }}
                     className={cn(
                       "group relative bg-card p-5 rounded-xl border border-border/40 transition-all cursor-pointer shadow-sm hover:shadow-md",
                       activeFieldId === field.id ? "ring-2 ring-primary/50 border-primary" : "hover:border-primary/30"
                     )}
                   >
                     {/* Drag Handle */}
                     {metadata.status !== 'PUBLISHED' && (
                       <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:text-foreground text-muted-foreground p-1">
                          <GripVertical className="w-4 h-4" />
                       </div>
                     )}

                     <div className="pl-6">
                        <label className="text-[15px] font-medium block">
                          {field.question_text} {field.is_required && <span className="text-destructive ml-0.5">*</span>}
                        </label>
                        {field.help_text && <p className="text-[13px] text-muted-foreground mt-1">{field.help_text}</p>}

                        <div className="mt-3">
                           {field.type === 'textarea' ? (
                             <div className="w-full rounded-md border border-border/50 bg-muted/20 h-20" />
                           ) : field.type === 'radio' || field.type === 'checkbox' ? (
                             <div className="space-y-2">
                               <div className="flex items-center gap-2"><div className={cn("w-4 h-4 border border-border/80 rounded-sm bg-muted/20", field.type === 'radio' && "rounded-full")} /><span className="text-sm text-muted-foreground">Option 1</span></div>
                               <div className="flex items-center gap-2"><div className={cn("w-4 h-4 border border-border/80 rounded-sm bg-muted/20", field.type === 'radio' && "rounded-full")} /><span className="text-sm text-muted-foreground">Option 2</span></div>
                             </div>
                           ) : (
                             <div className="w-full max-w-sm rounded-md border border-border/50 bg-muted/20 h-9" />
                           )}
                        </div>
                     </div>

                     {/* Actions */}
                     <AnimatePresence>
                       {activeFieldId === field.id && metadata.status !== 'PUBLISHED' && (
                         <motion.div
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           className="absolute -right-2 -top-2 bg-card border border-border/60 shadow-lg rounded-lg flex items-center p-1 overflow-hidden"
                         >
                            <button
                              onClick={(e) => { e.stopPropagation(); duplicateField(field.id) }}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <div className="w-px h-4 bg-border/50 mx-1" />
                            <button
                              onClick={(e) => { e.stopPropagation(); removeField(field.id) }}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                 </motion.div>
               ))}
             </AnimatePresence>
           </div>
         )}
       </div>
    </div>
  )
}

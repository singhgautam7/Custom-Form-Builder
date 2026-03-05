"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Undo, Redo, Save, Rocket, Loader2 } from "lucide-react"
import { useBuilderStore } from "../builderStore"

export function BuilderHeader({ onSave, onPublish, isSaving, isPublishing }: {
  onSave: () => void; onPublish: () => void; isSaving: boolean; isPublishing: boolean
}) {
  const { form, history, undo, redo } = useBuilderStore()

  return (
    <header className="h-14 border-b bg-card/60 backdrop-blur sticky top-0 z-50 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
          <Link href="/forms"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <span className="font-semibold text-sm tracking-tight">{form.title || "New Form"}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 hidden sm:flex" onClick={undo} disabled={history.past.length === 0}>
          <Undo className="w-3.5 h-3.5 mr-1" /> Undo
        </Button>
        <Button variant="outline" size="sm" className="h-8 hidden sm:flex" onClick={redo} disabled={history.future.length === 0}>
          <Redo className="w-3.5 h-3.5 mr-1" /> Redo
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
        <Button variant="outline" size="sm" className="h-8" onClick={onSave} disabled={isSaving || isPublishing}>
          {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
          Save Draft
        </Button>
        <Button size="sm" className="h-8 group" onClick={onPublish} disabled={isSaving || isPublishing}>
          {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
            <><Rocket className="w-3.5 h-3.5 mr-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> Publish</>
          )}
        </Button>
      </div>
    </header>
  )
}

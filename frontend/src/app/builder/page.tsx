"use client"

import { FieldPalette } from "@/components/builder/FieldPalette"
import { CanvasPreview } from "@/components/builder/CanvasPreview"
import { FieldProperties } from "@/components/builder/FieldProperties"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Undo, Redo, Share } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { useBuilderStore } from "@/stores/builderStore"
import api from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

function BuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || 'new'
  const currentTab = searchParams.get('tab') || 'builder'
  const store = useBuilderStore()
  const [isSaving, setIsSaving] = useState(false)

  const handlePublish = async () => {
    try {
      setIsSaving(true)
      const payload = {
        title: store.metadata.title || "Untitled Form",
        description: store.metadata.description || "",
        schema: { fields: store.fields, metadata: store.metadata },
        is_published: true
      }
      if (id === 'new') {
        const res = await api.createForm(payload)
        const data = await res.json()
        toast.success("Form created successfully!")
        router.replace(`?id=${data.id}&tab=builder`)
      } else {
        await api.updateForm(id, payload)
        toast.success("Form updated successfully!")
      }
    } catch (e) {
      toast.error((e as Error).message || "Failed to save form")
    } finally {
      setIsSaving(false)
    }
  }

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden relative selection:bg-primary/10">

      {/* Builder Topbar */}
      <header className="h-14 border-b border-border/50 bg-card/60 backdrop-blur shrink-0 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:bg-muted/50 rounded-full">
            <Link href="/"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight leading-none">Draft Form ({id})</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">Auto-saved 2 mins ago</span>
          </div>
        </div>

        <div className="flex flex-1 justify-center max-w-sm mx-auto hidden md:flex">
          <div className="bg-muted/40 p-1 rounded-full border border-border/50 flex">
             <button
                onClick={() => setTab('builder')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${currentTab === 'builder' ? 'bg-background shadow-sm border border-border/50 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                Builder
             </button>
             <button
                onClick={() => setTab('submissions')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${currentTab === 'submissions' ? 'bg-background shadow-sm border border-border/50 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                Submissions
             </button>
             {/* <button
                onClick={() => setTab('settings')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${currentTab === 'settings' ? 'bg-background shadow-sm border border-border/50 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                Settings
             </button> */}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Implementation Note: Undo/Redo connected via standard Zustand hooks across separate client components ideally, mocked here. */}
          <Button variant="outline" size="sm" className="h-8 hidden sm:flex border-border/50"><Undo className="w-3.5 h-3.5 mr-1" /> Undo</Button>
          <Button variant="outline" size="sm" className="h-8 hidden sm:flex border-border/50"><Redo className="w-3.5 h-3.5 mr-1" /> Redo</Button>

          <div className="w-px h-6 bg-border/50 mx-1 hidden sm:block" />

          <Button variant="outline" size="sm" className="h-8 border-border/50"><Share className="w-3.5 h-3.5 mr-2" /> Share</Button>
          <Button size="sm" className="h-8" onClick={handlePublish} disabled={isSaving}>
             {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-2" />}
             Publish Form
          </Button>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 flex overflow-hidden">
        {currentTab === 'builder' && (
          <>
            <FieldPalette />
            <CanvasPreview />
            <FieldProperties />
          </>
        )}
        {currentTab === 'submissions' && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/10">
            Submissions View Placeholder
          </div>
        )}
        {currentTab === 'settings' && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/10">
            Form Settings Placeholder
          </div>
        )}
      </main>

    </div>
  )
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading builder...</div>}>
      <BuilderContent />
    </Suspense>
  )
}

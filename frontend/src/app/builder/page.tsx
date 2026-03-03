"use client"

import { FieldPalette } from "@/components/builder/FieldPalette"
import { CanvasPreview } from "@/components/builder/CanvasPreview"
import { FieldProperties } from "@/components/builder/FieldProperties"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Undo, Redo, Share } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function BuilderContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || 'new'

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden relative selection:bg-primary/10">

      {/* Builder Topbar */}
      <header className="h-14 border-b border-border/50 bg-card/60 backdrop-blur shrink-0 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:bg-muted/50 rounded-full">
            <Link href="/dashboard"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight leading-none">Draft Form ({id})</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">Auto-saved 2 mins ago</span>
          </div>
        </div>

        <div className="flex flex-1 justify-center max-w-sm mx-auto hidden md:flex">
          {/* Environment/Preview switch logic placeholder */}
          <div className="bg-muted/40 p-1 rounded-full border border-border/50 flex">
             <button className="px-3 py-1 text-xs font-medium rounded-full bg-background shadow-sm border border-border/50">Editor</button>
             <button className="px-3 py-1 text-xs font-medium rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">Preview</button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Implementation Note: Undo/Redo connected via standard Zustand hooks across separate client components ideally, mocked here. */}
          <Button variant="outline" size="sm" className="h-8 hidden sm:flex border-border/50"><Undo className="w-3.5 h-3.5 mr-1" /> Undo</Button>
          <Button variant="outline" size="sm" className="h-8 hidden sm:flex border-border/50"><Redo className="w-3.5 h-3.5 mr-1" /> Redo</Button>

          <div className="w-px h-6 bg-border/50 mx-1 hidden sm:block" />

          <Button variant="outline" size="sm" className="h-8 border-border/50"><Share className="w-3.5 h-3.5 mr-2" /> Share</Button>
          <Button size="sm" className="h-8"><Save className="w-3.5 h-3.5 mr-2" /> Publish Form</Button>
        </div>
      </header>

      {/* 3-Panel Main Area */}
      <main className="flex-1 flex overflow-hidden">
        <FieldPalette />
        <CanvasPreview />
        <FieldProperties />
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

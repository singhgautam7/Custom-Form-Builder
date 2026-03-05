"use client"

import { FieldPalette } from "@/components/builder/FieldPalette"
import { CanvasPreview } from "@/components/builder/CanvasPreview"
import { FieldProperties } from "@/components/builder/FieldProperties"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Undo, Redo, Share } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { useBuilderStore } from "@/stores/builderStore"
import api from "@/lib/api"
import { validateForm } from "@/lib/validation"
import { toast } from "sonner"
import { Loader2, Play, Lock, Rocket, LayoutTemplate, Eye, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

function BuilderContent() {
  const router = useRouter()
  const params = useParams()
  // if not found in params (because it's the `new` route), fallback to 'new'
  const slug = (params?.slug as string) || 'new'
  const store = useBuilderStore()
  const { undo, redo, history } = store
  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0
  const [isLoading, setIsLoading] = useState(slug !== 'new')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    async function loadForm() {
      if (slug === 'new') return
      try {
        const res = await fetch(`${api.API_BASE}${api.endpoints.forms}${slug}/`, {
          headers: {
            'Authorization': `Bearer ${api.getAccessToken() || ''}`
          }
        })
        if (!res.ok) throw new Error("Failed to load form")
        const data = await res.json()
        store.setMetadata({
           title: data.title,
           description: data.description,
           submission_limit: data.submission_limit,
           success_message: data.success_message,
           status: data.status
        })
        store.setFields(data.questions || [])
      } catch (e) {
        toast.error("Could not load form")
      } finally {
        setIsLoading(false)
      }
    }
    loadForm()
  }, [slug])

  const handleSave = async (publish: boolean) => {
    try {
      if (publish) {
         const errs = validateForm(store.fields)
         if (errs.length > 0) {
            toast.error(errs[0].message)
            return
         }
      }

      if (publish) setIsPublishing(true)
      else setIsSaving(true)

      const payload = {
        title: store.metadata.title || "Untitled Form",
        description: store.metadata.description || "",
        schema: { fields: store.fields, metadata: store.metadata },
      }

      let resData;
      if (slug === 'new') {
        const res = await api.createForm(payload)
        resData = await res.json()
        toast.success("Draft saved successfully!")
        if (!publish) {
           router.replace(`/forms/${resData.slug}/edit`)
        }
      } else {
        await api.updateForm(slug, payload)
        toast.success("Draft updated successfully!")
        resData = { slug }
      }

      if (publish) {
         // Proceed to publish it
         await api.publishForm(resData.slug)
         toast.success("Form published!")
         router.push(`/forms/${resData.slug}/preview`)
      }

    } catch (e) {
      toast.error((e as Error).message || "Failed to save form")
    } finally {
      setIsPublishing(false)
      setIsSaving(false)
    }
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
            <span className="font-semibold text-sm tracking-tight leading-none">Form Builder ({slug === 'new' ? 'New Form' : slug})</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-medium">Add questions to your form</span>
          </div>
        </div>

        <div className="flex flex-1 justify-center mx-auto absolute left-1/2 -translate-x-1/2">
           <div className="bg-muted p-1 rounded-lg flex items-center space-x-1 border border-border/40 shadow-sm">
             <Button variant="ghost" size="sm" className="h-7 px-3 text-xs font-medium bg-background shadow-sm hover:bg-background">
               <LayoutTemplate className="w-3.5 h-3.5 mr-1.5" />
               Builder
             </Button>
             <Link href={`/forms/${slug}/preview`}>
               <Button variant="ghost" size="sm" className="h-7 px-3 text-xs font-medium text-muted-foreground hover:text-foreground">
                 <Eye className="w-3.5 h-3.5 mr-1.5" />
                 Preview
               </Button>
             </Link>
           </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Implementation Note: Undo/Redo connected via standard Zustand hooks across separate client components ideally, mocked here. */}
          <Button variant="outline" size="sm" className="h-8 hidden sm:flex border-border/50" onClick={undo} disabled={!canUndo}><Undo className="w-3.5 h-3.5 mr-1" /> Undo</Button>
          <Button variant="outline" size="sm" className="h-8 hidden sm:flex border-border/50" onClick={redo} disabled={!canRedo}><Redo className="w-3.5 h-3.5 mr-1" /> Redo</Button>

          <div className="w-px h-6 bg-border/50 mx-1 hidden sm:block" />


          {store.metadata.status !== 'PUBLISHED' && (
            <>
              <Button variant="outline" size="sm" className="h-8 border-border/50" onClick={() => handleSave(false)} disabled={isLoading || isSaving || isPublishing}>
                 {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-2" />}
                 Save Draft
              </Button>

              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      size="sm"
                      className="h-8 group"
                      onClick={() => handleSave(true)}
                      disabled={isLoading || isSaving || isPublishing || validateForm(store.fields).length > 0}
                    >
                       {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                         <>
                           <Rocket className="w-3.5 h-3.5 mr-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                           Publish
                         </>
                       )}
                    </Button>
                  </div>
                </TooltipTrigger>
                {validateForm(store.fields).length > 0 && (
                  <TooltipContent side="bottom" align="end" className="text-destructive font-medium border-destructive/20 bg-destructive/10 max-w-[250px]">
                    <div className="flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <p className="text-xs">{validateForm(store.fields)[0]?.message}</p>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </>
          )}
        </div>
      </header>

      {/* Published Warning Banner */}
      {store.metadata.status === 'PUBLISHED' && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex items-center justify-center text-sm text-yellow-600 dark:text-yellow-500 shadow-sm z-30">
          <Lock className="w-4 h-4 mr-2 mb-0.5" />
          <strong>Locked:</strong> This form is currently published. Structural modifications are disabled to prevent data corruption.
          <Button variant="link" className="h-auto p-0 px-2 text-yellow-600 dark:text-yellow-500 underline" onClick={async () => {
             try {
                await api.fetchWithAuth(`${api.endpoints.forms}${slug}/unpublish/`, { method: 'POST' });
                toast.success("Form unpublished. You can now edit it.");
                store.setMetadata({ status: "DRAFT" });
             } catch(e) { toast.error("Failed to unpublish") }
          }}>
             Unpublish to safely edit
          </Button>
        </div>
      )}

      {/* Main Area */}
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

"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import api from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, Eye } from "lucide-react"

import { useBuilderStore } from "@/features/builder/builderStore"
import { validateForm } from "@/features/builder/validation/validateForm"
import type { FormErrors, AllQuestionErrors, QuestionType } from "@/features/builder/types"

import { BuilderHeader } from "@/features/builder/components/BuilderHeader"
import { FormSettingsCard } from "@/features/builder/components/FormSettingsCard"
import { AddQuestionCard } from "@/features/builder/components/AddQuestionCard"
import { QuestionList, QuestionListRef } from "@/features/builder/components/QuestionList"
import { FormRenderer } from "@/features/builder/preview/FormRenderer"

export default function NewFormPage() {
  const router = useRouter()
  const store = useBuilderStore()
  const questionListRef = useRef<QuestionListRef>(null)

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [questionErrors, setQuestionErrors] = useState<AllQuestionErrors>({})
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // Reset store on mount for new form
  useEffect(() => { store.reset() }, [])

  // ─── Autosave (600ms debounce) ─────────
  useEffect(() => {
    if (!store.dirty || !store.slug) return
    const timer = setTimeout(async () => {
      try {
        const payload = store.serializeForApi()
        await api.updateForm(store.slug!, payload)
        store.markClean()
      } catch { /* silent fail for autosave */ }
    }, 600)
    return () => clearTimeout(timer)
  }, [store.dirty, store.slug, store.form, store.questions])

  // ─── Add Question ──────────────────────
  const handleAddQuestion = useCallback((type: QuestionType) => {
    const id = store.addQuestion(type)
    setHighlightedId(id)
    setTimeout(() => setHighlightedId(null), 1200)
    questionListRef.current?.scrollToQuestion(id)
  }, [store])

  // ─── Save / Publish ────────────────────
  const handleSave = async () => {
    setFormErrors({})
    setQuestionErrors({})
    setIsSaving(true)
    try {
      const payload = store.serializeForApi()
      const data = await api.createForm(payload)
      store.setSlug(data.slug)
      store.markClean()
      toast.success("Draft saved!")
      router.push(`/forms/${data.slug}/edit`)
    } catch (e) {
      toast.error((e as Error).message || "Save failed")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    const { formErrors: fe, questionErrors: qe, valid } = validateForm(store.form, store.questions)
    setFormErrors(fe)
    setQuestionErrors(qe)

    if (store.questions.length === 0) {
      toast.error("Form must have at least one question.")
      return
    }
    if (!valid) {
      toast.error("Please fix the errors before publishing.")
      return
    }

    setIsPublishing(true)
    try {
      const payload = store.serializeForApi()
      const data = await api.createForm(payload)
      await api.publishForm(data.slug)
      toast.success("Form published!")
      router.push(`/forms/${data.slug}/preview`)
    } catch (e) {
      toast.error((e as Error).message || "Publish failed")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <BuilderHeader onSave={handleSave} onPublish={handlePublish} isSaving={isSaving} isPublishing={isPublishing} />

      <Tabs defaultValue="build" className="flex-1 flex flex-col">
        <div className="border-b bg-card/30">
          <div className="max-w-3xl mx-auto px-4">
            <TabsList className="h-10 bg-transparent p-0 gap-4">
              <TabsTrigger value="build" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2 text-sm font-medium">
                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Build
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2 text-sm font-medium">
                <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* ─── BUILD TAB ─── */}
        <TabsContent value="build" className="flex-1 mt-0">
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <FormSettingsCard errors={formErrors} />
            <QuestionList ref={questionListRef} errors={questionErrors} highlightedId={highlightedId} />
            <AddQuestionCard onAdd={handleAddQuestion} />
          </div>
        </TabsContent>

        {/* ─── PREVIEW TAB ─── */}
        <TabsContent value="preview" className="flex-1 mt-0">
          <FormRenderer
            form={store.form}
            questions={store.questions}
            onSubmit={() => toast.success(store.form.success_message || "Form submitted successfully!")}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

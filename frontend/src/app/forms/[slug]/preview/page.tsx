"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import api from "@/lib/api"
import { FormField } from "@/stores/builderStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function PreviewPage() {
  const params = useParams()
  const slug = params?.slug as string
  const router = useRouter()

  const [formConfig, setFormConfig] = useState<any>(null)
  const [status, setStatus] = useState<string>("DRAFT")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { control, handleSubmit, register, formState: { errors } } = useForm()

  useEffect(() => {
    if (!slug) return
    async function load() {
      try {
        const res = await fetch(`${api.API_BASE}${api.endpoints.forms}${slug}/client-schema/`, {
          headers: { 'Authorization': `Bearer ${api.getAccessToken() || ''}` }
        })
        if (!res.ok) throw new Error("Could not load form schema")
        const schema = await res.json()
        setFormConfig(schema)

        // Load full form to check status
        const fullRes = await fetch(`${api.API_BASE}${api.endpoints.forms}${slug}/`, {
          headers: { 'Authorization': `Bearer ${api.getAccessToken() || ''}` }
        })
        if (fullRes.ok) {
           const fullData = await fullRes.json()
           setStatus(fullData.status)
        }
      } catch (e) {
        toast.error("Failed to load schema")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const onSubmit = async (data: Record<string, any>) => {
    if (status !== "PUBLISHED") {
      toast.error("Form is not published. This is a preview test only.")
      return
    }

    setSubmitting(true)
    try {
      // Map data to the backend format
      const submissionPayload: Record<string, any> = { is_draft: false, answers: [] }

      for (const [qId, val] of Object.entries(data)) {
         if (!val) continue
         const q = formConfig.questions.find((x: any) => x.id === qId)
         if (!q) continue

         const ans: any = { question: qId }
         if (q.type === 'number') {
            ans.answer_number = parseFloat(val)
         } else if (q.type === 'date') {
            ans.answer_date = val
         } else if (q.type === 'checkbox' || q.type === 'multiselect') {
            // Usually array from rhf
            ans.answer_choices = Array.isArray(val) ? val : [val]
         } else {
            ans.answer_text = val
         }
         submissionPayload.answers.push(ans)
      }

      const res = await fetch(`${api.API_BASE}${api.endpoints.forms}${slug}/submissions/`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           // Optional auth header for tracking
         },
         body: JSON.stringify(submissionPayload)
      })

      if (!res.ok) {
         const err = await res.json()
         throw new Error(err.detail || JSON.stringify(err))
      }

      const resData = await res.json()
      setSuccessMessage(resData.success_message || formConfig.success_message || "Thank you for your submission.")

    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>
  }

  if (!formConfig) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Form not found.</div>
  }

  return (
    <div className="min-h-screen bg-muted/10 selection:bg-primary/10 flex flex-col items-center py-12 px-4 relative">

      {/* Topbar navigation for owners */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-none">
        <Button variant="outline" size="sm" asChild className="pointer-events-auto bg-background/50 backdrop-blur shadow-sm">
           <Link href={`/forms/${slug}/edit`}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Builder</Link>
        </Button>
      </div>

      <div className="max-w-2xl w-full">
        {status !== "PUBLISHED" && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 rounded-lg text-sm text-center font-medium shadow-sm flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            PREVIEW MODE: This form is currently {status}. Submissions are disabled.
          </div>
        )}

        {successMessage ? (
           <div className="bg-card p-12 rounded-2xl border border-border/40 shadow-sm text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                 <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Success!</h2>
              <p className="text-muted-foreground">{successMessage}</p>

              <Button variant="outline" className="mt-8" onClick={() => setSuccessMessage(null)}>Submit another response</Button>
           </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-card p-8 rounded-2xl border border-border/40 shadow-sm">
              <h1 className="text-3xl font-bold tracking-tight mb-3">{formConfig.title}</h1>
              {formConfig.description && <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{formConfig.description}</p>}
            </div>

            <div className="space-y-6">
              {formConfig.questions.map((q: any) => {
                const rules: any = { required: q.required ? "This field is required" : false }

                if (q.min_length) rules.minLength = { value: q.min_length, message: `Minimum length is ${q.min_length}` }
                if (q.max_length) rules.maxLength = { value: q.max_length, message: `Maximum length is ${q.max_length}` }
                if (q.min_value) rules.min = { value: q.min_value, message: `Minimum value is ${q.min_value}` }
                if (q.max_value) rules.max = { value: q.max_value, message: `Maximum value is ${q.max_value}` }
                if (q.type === 'email') rules.pattern = { value: /^\S+@\S+$/i, message: "Invalid email format" }

                return (
                  <div key={q.id} className="bg-card p-6 rounded-2xl border border-border/40 shadow-sm transition-all hover:shadow-md">
                    <Label className="text-base font-semibold mb-1 block">
                      {q.label} {q.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {q.help_text && <p className="text-sm text-muted-foreground mb-4">{q.help_text}</p>}

                    <div className="mt-4">
                      {q.type === 'textarea' ? (
                        <Textarea placeholder={q.placeholder || ''} {...register(q.id, rules)} className="resize-y" />
                      ) : q.type === 'date' ? (
                        <Input type="date" {...register(q.id, rules)} />
                      ) : q.type === 'number' ? (
                        <Input type="number" placeholder={q.placeholder || ''} {...register(q.id, rules)} />
                      ) : q.type === 'radio' ? (
                        <Controller
                          name={q.id}
                          control={control}
                          rules={rules}
                          render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                              {q.options?.map((opt: any, i: number) => {
                                const val = typeof opt === 'object' ? opt.value : opt
                                const lbl = typeof opt === 'object' ? opt.label : opt
                                return (
                                  <div key={i} className="flex items-center space-x-3 bg-muted/20 hover:bg-muted/40 p-3 rounded-lg border border-border/50 transition-colors cursor-pointer" onClick={() => field.onChange(val)}>
                                    <RadioGroupItem value={val} id={`${q.id}-${i}`} />
                                    <Label htmlFor={`${q.id}-${i}`} className="cursor-pointer flex-1 font-medium">{lbl}</Label>
                                  </div>
                                )
                              })}
                            </RadioGroup>
                          )}
                        />
                      ) : q.type === 'dropdown' ? (
                        <Controller
                          name={q.id}
                          control={control}
                          rules={rules}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={q.placeholder || "Select an option"} />
                              </SelectTrigger>
                              <SelectContent>
                                {q.options?.map((opt: any, i: number) => {
                                  const val = typeof opt === 'object' ? opt.value : opt
                                  const lbl = typeof opt === 'object' ? opt.label : opt
                                  return <SelectItem key={i} value={val}>{lbl}</SelectItem>
                                })}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      ) : (
                        <Input type={q.type} placeholder={q.placeholder || ''} {...register(q.id, rules)} />
                      )}
                    </div>

                    {errors[q.id] && (
                      <p className="text-sm font-medium text-destructive mt-3 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-destructive" />
                        {errors[q.id]?.message as string}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" size="lg" disabled={submitting || status !== "PUBLISHED"} className="px-8 shadow-md">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Form"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

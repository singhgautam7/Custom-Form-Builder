"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getAccessToken, fetchWithAuth } from '../../../../lib/api'
import { toast } from 'sonner'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Textarea } from '../../../../components/ui/textarea'
import { Checkbox } from '../../../../components/ui/checkbox'
import { Label } from '../../../../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select'
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger } from '../../../../components/ui/alert-dialog'
// ...existing imports

type QSchema = {
  id: string
  type: string
  label: string
  required: boolean
  order?: number
  options?: any
  min_length?: number
  max_length?: number
  min_value?: number
  max_value?: number
}

export default function SubmitFormPage({ params }: { params: any }) {
  const router = useRouter()
  // Next.js may pass `params` as a Promise-like object in newer versions.
  // Use React.use(params) when available to safely unwrap it. Fall back to
  // using params directly for older runtimes.
  let routeParams: any = params
  try {
    const maybeUse = (React as any).use
    if (typeof maybeUse === 'function') {
      routeParams = (React as any).use(params)
    }
  } catch (err) {
    // ignore and fall back to params
    routeParams = params
  }
  const id = routeParams?.id ?? params?.id
  const [schema, setSchema] = useState<{ id: string; title: string; description?: string; questions: QSchema[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [openConfirm, setOpenConfirm] = useState(false)

  useEffect(() => {
    // require auth: if not logged in, redirect to signin with redirect back
    const token = getAccessToken()
    if (!token) {
      const returnTo = encodeURIComponent(`/form/submit/${id}`)
      try { router.push(`/signin?next=${returnTo}`) } catch (e) { window.location.href = `/signin?next=${returnTo}` }
      return
    }

    async function load() {
      setLoading(true)
      try {
  const s = await fetchWithAuth(`/api/forms/${id}/client-schema/`)
        setSchema(s)
        // init answers
        const map: Record<string, any> = {}
        s.questions.forEach((q: QSchema) => {
          if (q.type === 'checkbox' || q.type === 'multiselect') map[q.id] = []
          else map[q.id] = ''
        })
        setAnswers(map)
      } catch (err: any) {
        toast.error(`Unable to load form: ${err?.message || String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, router])

  function setAnswer(qid: string, value: any) {
    setAnswers((a) => ({ ...a, [qid]: value }))
  }

  function validateAll() {
    if (!schema) return false
    for (const q of schema.questions) {
      const val = answers[q.id]
      if (q.required) {
        if (q.type === 'checkbox' || q.type === 'multiselect') {
          if (!val || !Array.isArray(val) || val.length === 0) { toast.error(`${q.label} is required`); return false }
        } else {
          if (val === undefined || val === null || String(val).trim() === '') { toast.error(`${q.label} is required`); return false }
        }
      }
      if (q.min_length && typeof val === 'string' && val.length < q.min_length) { toast.error(`${q.label}: minimum ${q.min_length} characters`); return false }
      if (q.max_length && typeof val === 'string' && val.length > q.max_length) { toast.error(`${q.label}: maximum ${q.max_length} characters`); return false }
      if (q.min_value != null && (Number(val) < q.min_value)) { toast.error(`${q.label}: minimum value is ${q.min_value}`); return false }
      if (q.max_value != null && (Number(val) > q.max_value)) { toast.error(`${q.label}: maximum value is ${q.max_value}`); return false }
    }
    return true
  }

  async function doSubmit() {
    if (!schema) return
    if (!validateAll()) return
    // build answers array as API expects
    const payload = {
      form: schema.id,
      is_draft: false,
      answers: schema.questions.map((q) => {
        const base: any = { question: q.id }
        const v = answers[q.id]
        if (q.type === 'number') base.answer_number = v === '' ? null : Number(v)
        else if (q.type === 'date') base.answer_date = v
        else if (q.type === 'checkbox' || q.type === 'multiselect') base.answer_choices = v || []
        else base.answer_text = v
        return base
      })
    }

    try {
  const res = await fetchWithAuth(`/api/forms/${id}/submissions/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      toast.success('Submitted')
      // go to a simple thank you route or back home
      try { router.push('/') } catch (e) { window.location.href = '/' }
    } catch (err: any) {
      toast.error(`Submission failed: ${err?.message || String(err)}`)
    }
  }

  if (!schema) {
    return <div className="min-h-screen flex items-center justify-center">{loading ? 'Loading...' : 'Form not found'}</div>
  }

  return (
    <div className="min-h-screen bg-background">

      {/* use the global header from layout; no small header here */}

      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">{schema.title}</h1>
        {schema.description && <p className="mb-6 text-muted-foreground">{schema.description}</p>}

        <div className="space-y-6">
          {schema.questions.sort((a,b)=> (a.order||0)-(b.order||0)).map((q, idx) => (
            <div key={q.id}>
              <p className="mb-2">{idx + 1}. {q.label}{q.required ? <span className="text-accent ml-1">*</span> : ''}</p>
              <div>
                {q.type === 'text' && (
                  <Input value={answers[q.id] ?? ''} onChange={(e) => setAnswer(q.id, e.target.value)} />
                )}
                {q.type === 'textarea' && (
                  <Textarea value={answers[q.id] ?? ''} onChange={(e) => setAnswer(q.id, e.target.value)} />
                )}
                {q.type === 'email' && (
                  <Input type="email" value={answers[q.id] ?? ''} onChange={(e) => setAnswer(q.id, e.target.value)} />
                )}
                {q.type === 'number' && (
                  <Input type="number" value={answers[q.id] ?? ''} onChange={(e) => setAnswer(q.id, e.target.value)} />
                )}
                {q.type === 'date' && (
                  <Input type="date" value={answers[q.id] ?? ''} onChange={(e) => setAnswer(q.id, e.target.value)} />
                )}
                {q.type === 'radio' && (
                  <RadioGroup value={answers[q.id] ?? ''} onValueChange={(v) => setAnswer(q.id, v)}>
                    <div className="flex flex-col gap-2">
                      {(q.options || []).map((opt: any, i: number) => {
                        const value = typeof opt === 'object' && opt !== null ? String(opt.value ?? opt.label ?? JSON.stringify(opt)) : String(opt)
                        const label = typeof opt === 'object' && opt !== null ? (opt.label ?? String(opt.value ?? '')) : String(opt)
                        return (
                          <label key={i} className="flex items-center gap-3">
                            <RadioGroupItem value={value} id={`${q.id}-${i}`} />
                            <span>{label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </RadioGroup>
                )}
                {q.type === 'dropdown' && (
                  <Select onValueChange={(v) => setAnswer(q.id, v)}>
                    <SelectTrigger>
                      <SelectValue>{answers[q.id] ?? ''}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(q.options || []).map((opt: any, i: number) => {
                        const value = typeof opt === 'object' && opt !== null ? String(opt.value ?? opt.label ?? JSON.stringify(opt)) : String(opt)
                        const label = typeof opt === 'object' && opt !== null ? (opt.label ?? String(opt.value ?? '')) : String(opt)
                        return <SelectItem key={i} value={value}>{label}</SelectItem>
                      })}
                    </SelectContent>
                  </Select>
                )}
                {(q.type === 'checkbox' || q.type === 'multiselect') && (
                  <div className="flex flex-col gap-2">
                    {(q.options || []).map((opt: any, i: number) => {
                      const value = typeof opt === 'object' && opt !== null ? String(opt.value ?? opt.label ?? JSON.stringify(opt)) : String(opt)
                      const label = typeof opt === 'object' && opt !== null ? (opt.label ?? String(opt.value ?? '')) : String(opt)
                      const checked = Array.isArray(answers[q.id]) ? answers[q.id].includes(value) : false
                      return (
                        <label key={i} className="flex items-center gap-2">
                          <Checkbox checked={checked} onCheckedChange={(v) => {
                            const prev = Array.isArray(answers[q.id]) ? [...answers[q.id]] : []
                            const isChecked = Boolean(v)
                            if (isChecked) {
                              if (!prev.includes(value)) prev.push(value)
                            } else {
                              const idx = prev.indexOf(value); if (idx !== -1) prev.splice(idx, 1)
                            }
                            setAnswer(q.id, prev)
                          }} />
                          <span>{label}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
            <AlertDialogTrigger asChild>
              <Button onClick={() => setOpenConfirm(true)}>Submit</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit form</AlertDialogTitle>
                <AlertDialogDescription>Are you sure you want to submit? You won't be able to edit after submission.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button variant="ghost" onClick={() => setOpenConfirm(false)}>Cancel</Button>
                <Button onClick={() => { setOpenConfirm(false); doSubmit() }}>Yes, submit</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  )
}

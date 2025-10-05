"use client"

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/card'
import { Input } from '../../../../components/ui/input'
import { fetchWithAuth } from '../../../../lib/api'
// date-fns format not needed in this read-only view
import SubmissionsTable from '../../../../components/forms/SubmissionsTable'

type Option = string | { label?: string }

interface Question {
  id?: string | number
  question_type?: string
  question_text?: string
  options?: Option[]
}

interface FormData {
  title?: string
  form_title?: string
  description?: string
  form_description?: string
  questions?: Question[]
}

export default function ViewFormPage({ params }: { params: unknown }) {
  // safe unwrap for possible promise-like params using React.use when available
  // Avoid casting to `any` — use unknown and a narrow typed helper to call use if present.
  const maybeUse = (React as unknown as { use?: (p: unknown) => unknown }).use
  let routeParams: unknown = params
  if (typeof maybeUse === 'function') {
    routeParams = maybeUse(params)
  }

  const getIdFromParams = (r: unknown): string | null => {
    if (!r) return null
    if (typeof r === 'object') {
      const rp = r as Record<string, unknown>
      const candidate = rp['id'] ?? rp['slug'] ?? rp['uuid']
      if (typeof candidate === 'string') return candidate
      if (Array.isArray(candidate) && candidate.length) return String(candidate[0])
    }
    return null
  }

  const id = getIdFromParams(routeParams)
  const [form, setForm] = React.useState<FormData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    if (!id) {
      // No id available yet (params may be a promise); stop and wait.
      if (mounted) setLoading(false)
      return () => { mounted = false }
    }

    fetchWithAuth(`/api/forms/${id}/`)
      .then((res) => { if (!mounted) return; setForm(res as FormData) })
      .catch(() => {})
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  if (loading) return <div className="p-8">Loading...</div>
  if (!form) return <div className="p-8">Form not found</div>

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 min-h-screen p-8 sm:p-12">
      <div className={`px-4 lg:px-6 max-w-7xl mx-auto w-full`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{form.title || form.form_title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{form.description || form.form_description}</p>
              </div>

              <div className="flex flex-col gap-3">
                {(form.questions || []).map((q: Question, idx: number) => (
                  <div key={(q.id as string) || idx} className="border rounded p-3">
                    <div className="text-sm text-muted-foreground mb-2">{q.question_type}</div>
                    <Input value={q.question_text || ''} readOnly className="cursor-default" />
                      {q.options && (
                        <div className="mt-2">
                          <div className="flex flex-col gap-1 max-w-[60%]">
                            {(q.options || []).map((o: Option, i: number) => {
                              const val = typeof o === 'string' ? o : (o.label ?? '')
                              return <Input key={i} value={val} readOnly className="cursor-default" />
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submissions</CardTitle>
                  <CardDescription>Responses received for this form.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SubmissionsTable formId={id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

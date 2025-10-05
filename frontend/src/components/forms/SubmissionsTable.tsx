"use client"

import * as React from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table"
import { Button } from "../ui/button"
import { fetchWithAuth } from '../../lib/api'
import { format } from 'date-fns'
import { IconExternalLink, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react'
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { Input } from '../ui/input'
// ...existing code... (textarea/checkbox/radio not needed in read-only viewer)
import { Separator } from '../ui/separator'

export default function SubmissionsTable({ formId }: { formId: string | null }) {
  interface Answer {
    question_text?: string
    question?: string
    answer_text?: string
    answer_number?: number
    answer_date?: string
    answer_choices?: unknown[]
    [k: string]: unknown
  }

  interface Submission {
    id?: string | number
    submission_id?: string | number
    submitted_at?: string
    submitted_by?: string | Record<string, unknown>
    submitted_by_email?: string
    submitted_by_name?: string
    name?: string
    submitter_email?: string
    submitter_name?: string
    answers?: Answer[]
    [k: string]: unknown
  }

  const [rows, setRows] = React.useState<Submission[]>([])
  // loading state unused in UI here; keep for future use if desired but mark as ref for now
  const [, setLoading] = React.useState(false)
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Submission | null>(null)

  React.useEffect(() => {
    let mounted = true
    async function load() {
      if (!formId) return
      setLoading(true)
      try {
        const res = await fetchWithAuth(`/api/forms/${formId}/submissions/`)
        if (!mounted) return
        // API may return a paginated object or an array
        const data = (res && (res.results ?? res)) as Submission[]
        setRows(Array.isArray(data) ? data : [])
      } catch {
        if (!mounted) return
        setRows([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [formId])

  const filteredRows = React.useMemo(() => rows || [], [rows])
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))

  React.useEffect(() => {
    if (pageIndex >= pageCount) setPageIndex(Math.max(0, pageCount - 1))
  }, [pageCount, pageIndex])

  function openAnswers(row: Submission) {
    setSelected(row)
    setOpen(true)
  }

  // Helper to extract submitter email and/or name from the submission row.
  function extractSubmitter(row: Submission | null | undefined): { email?: string | null; name?: string | null } {
    if (!row) return { email: null, name: null }
    const rr = row as Record<string, unknown>
    const sb = (rr['submitted_by'] ?? rr['submitter'] ?? null) as unknown

    // If submitted_by is a string, prefer it as email when it contains '@'
    if (typeof sb === 'string') {
      const val = sb.trim()
      if (val.includes('@')) return { email: val, name: val }
      return { name: val }
    }

    // If it's an object, read common fields
    if (typeof sb === 'object' && sb !== null) {
      const sbo = sb as Record<string, unknown>
      const emailCand = sbo['email'] ?? sbo['email_address'] ?? null
      const username = typeof sbo['username'] === 'string' ? sbo['username'] as string : null
      const email = (typeof emailCand === 'string' && emailCand) ? (emailCand as string) : (username && username.includes('@') ? username : null)
      const nameCand = sbo['name'] ?? sbo['full_name'] ?? sbo['display_name'] ?? null
      const first = typeof sbo['first_name'] === 'string' ? sbo['first_name'] as string : ''
      const last = typeof sbo['last_name'] === 'string' ? sbo['last_name'] as string : ''
      const name = (typeof nameCand === 'string' && (nameCand as string)) ? (nameCand as string) : ([first, last].filter(Boolean).join(' ') || null)
      return { email: email ?? null, name: name ?? null }
    }

    // Fallback to top-level fields on the row
    const emailRaw = rr['submitted_by_email'] ?? rr['email'] ?? rr['submitter_email'] ?? null
    const nameRaw = rr['submitted_by_name'] ?? rr['name'] ?? rr['submitter_name'] ?? null
    const email = typeof emailRaw === 'string' ? emailRaw : null
    const name = typeof nameRaw === 'string' ? nameRaw : null
    return { email, name }
  }

  return (
    <div>
      {!formId ? (
        <div className="text-sm text-muted-foreground">No form id yet — save the form to see submissions.</div>
      ) : (
        <div>
          {rows.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No submissions yet</div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="py-2 px-3">Submitted by</TableHead>
                      <TableHead className="py-2 px-3">When</TableHead>
                      <TableHead className="py-2 px-3">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
          {filteredRows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map((r: Submission) => {
            const submitter = extractSubmitter(r)
                        // Prefer to show email if available, otherwise name, otherwise anonymous.
                        const displayName = (submitter.email && String(submitter.email).trim()) || (submitter.name && String(submitter.name).trim()) || 'Anonymous'
                      return (
                        <TableRow key={r.id || r.submission_id}>
                          <TableCell className="py-2 px-3">{displayName}</TableCell>
                          <TableCell className="py-2 px-3">{r.submitted_at ? format(new Date(String(r.submitted_at)), 'PP p') : ''}</TableCell>
                          <TableCell className="py-2 px-3 text-right">
                            <Button variant="outline" size="icon" aria-label="Open" onClick={() => openAnswers(r)}>
                              <IconExternalLink />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <Separator className="my-2" />

              <div className="px-2 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground">{filteredRows.length} row(s)</div>
                  <div className="hidden items-center gap-2 lg:flex">
                    <div className="text-sm font-medium">Rows per page</div>
                    <Select value={`${pageSize}`} onValueChange={(v) => { setPageSize(Number(v)); setPageIndex(0); }}>
                      <SelectTrigger size="sm" className="w-20">
                        <SelectValue placeholder={`${pageSize}`} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[5, 10, 20, 50].map((ps) => (
                          <SelectItem key={ps} value={`${ps}`}>{ps}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-end mt-2">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
                      <span className="sr-only">Go to first page</span>
                      <IconChevronsLeft />
                    </Button>
                    <Button variant="outline" className="size-8" size="icon" onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={pageIndex === 0}>
                      <span className="sr-only">Previous</span>
                      <IconChevronLeft />
                    </Button>
                    <div className="text-sm px-2">Page {pageIndex + 1} of {pageCount}</div>
                    <Button variant="outline" className="size-8" size="icon" onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))} disabled={pageIndex >= pageCount - 1}>
                      <span className="sr-only">Next</span>
                      <IconChevronRight />
                    </Button>
                    <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => setPageIndex(pageCount - 1)} disabled={pageIndex >= pageCount - 1}>
                      <span className="sr-only">Go to last page</span>
                      <IconChevronsRight />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
        <DialogContent className="w-[85vw] h-[85vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle>{(extractSubmitter(selected)?.email || extractSubmitter(selected)?.name || 'Anonymous') + ' submission'}</DialogTitle>
          </div>

          <div className="space-y-6">
            {((selected?.answers ?? []) as Answer[]).map((a: Answer, i: number) => (
              <div key={i} className="border rounded p-3">
                <div className="text-sm text-muted-foreground mb-1">Question</div>
                <div className="mb-2">{a.question_text ?? a.question ?? ''}</div>
                <div className="text-sm text-muted-foreground mb-1">Answer</div>
                {/* Render answers based on type-like hints in the answer object */}
                <div>
                  {a.answer_text && <Input value={a.answer_text} readOnly className="cursor-default" />}
                  {a.answer_number !== undefined && a.answer_number !== null && <Input value={String(a.answer_number)} readOnly className="cursor-default" />}
                  {a.answer_date && <Input value={a.answer_date} readOnly className="cursor-default" />}
                  {a.answer_choices && Array.isArray(a.answer_choices) && (
                    <div className="flex flex-col gap-2 mt-2">
                      {a.answer_choices.map((c: unknown, idx: number) => {
                        const choiceVal = (typeof c === 'object' && c !== null) ? ((c as Record<string, unknown>).label ?? String(c)) : String(c)
                        return <Input key={idx} value={String(choiceVal)} readOnly className="cursor-default" />
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

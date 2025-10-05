"use client"

import * as React from "react"
import { IconDownload, IconExternalLink, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table"

import { fetchWithAuth } from "../../lib/api"
import { toast } from "sonner"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"

export function FormsTable() {
  const [tab, setTab] = React.useState<'created'|'submitted'>('created')

  const [rows, setRows] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    const path = tab === 'created' ? '/api/forms/my-created/' : '/api/forms/my-submitted/'
    fetchWithAuth(path)
      .then((res: any) => {
        if (!mounted) return
        // res.results expected
        setRows(res.results || [])
        // fetch completed
      })
      .catch((err: any) => {
        console.error('forms fetch error', err)
        toast.error('Unable to fetch forms')
        setRows([])
      })
      .finally(() => setLoading(false))

    return () => { mounted = false }
  }, [tab])

  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [openSubmission, setOpenSubmission] = React.useState<any | null>(null)
  const [openSubmissionFull, setOpenSubmissionFull] = React.useState<any | null>(null)

  const filteredRows = React.useMemo(() => {
    // rows is already fetched per-tab from the API: my-created or my-submitted
    // For submitted tab, show whatever the API returned (don't filter by submitted_at)
    return tab === 'created' ? rows : rows
  }, [tab, rows])

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize))

  // Ensure pageIndex is within range when dependencies change
  React.useEffect(() => {
    if (pageIndex >= pageCount) setPageIndex(Math.max(0, pageCount - 1))
  }, [pageCount, pageIndex])

  function exportCSV() {
    const selectedRows = rows || []
    if (!selectedRows || selectedRows.length === 0) return

    let headers: string[] = []
    let dataRows: Array<Record<string, any>> = []

    if (tab === 'created') {
      headers = ['Form name', 'Description', 'Status', 'Questions', 'Submissions', 'Limit', 'Created']
      dataRows = selectedRows.map((r: any) => ({
        'Form name': r.title || r.form_title || '',
        'Description': r.description || r.form_description || '',
        'Status': r.is_active === false ? 'Disabled' : (r.is_published ? 'Active' : 'Draft'),
        'Questions': r.question_count ?? '',
        'Submissions': r.submission_count ?? '',
        'Limit': r.submission_limit ?? '',
        'Created': r.created_at ?? '',
      }))
    } else {
      headers = ['Submission id', 'Form name', 'Description', 'Status', 'Questions', 'Submitted']
      dataRows = selectedRows.map((r: any) => ({
        'Submission id': r.id || r.submission_id || '',
        'Form name': r.form_title || r.title || '',
        'Description': r.form_description || r.description || '',
        // treat any row that has a submission id / submitted_at as completed/submitted
        'Status': (r.submission_id || r.id || r.submitted_at) ? 'Submitted' : (r.is_active === false ? 'Disabled' : (r.is_published ? 'Active' : 'Draft')),
        'Questions': r.question_count ?? '',
        'Submitted': r.submitted_at ?? '',
      }))
    }

    const csv = [headers.join(',')]
      .concat(
        dataRows.map((row) =>
          headers.map((h) => {
            const v = row[h]
            if (v === undefined || v === null) return ''
            return `"${String(v).replace(/"/g, '""')}"`
          }).join(',')
        )
      )
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tab === 'created' ? 'created_forms' : 'submitted_forms'}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-8">
      <Tabs value={tab} onValueChange={(v) => setTab(v as 'created' | 'submitted')}>
        <div className="flex items-center justify-between mb-4">
          {/* Mobile: select view */}
          <Select value={tab} onValueChange={(v) => { setTab(v as 'created'|'submitted'); setPageIndex(0); }}>
            <SelectTrigger size="sm" className="flex w-fit @4xl/main:hidden" id="view-selector">
              <SelectValue placeholder={tab === 'created' ? 'My Forms' : 'My Submissions'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">My Forms</SelectItem>
              <SelectItem value="submitted">My Submissions</SelectItem>
            </SelectContent>
          </Select>

          <TabsList className="hidden @4xl/main:flex">
            <TabsTrigger value="created">My Forms</TabsTrigger>
            <TabsTrigger value="submitted">My Submissions</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} className="cursor-pointer">
              <IconDownload />
              <span className="ml-2">Export</span>
            </Button>
          </div>
        </div>

        <TabsContent value="created">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                <TableRow>
                  <TableHead className="min-w-[140px]">Form name</TableHead>
                  <TableHead className="w-full max-w-[60%]">Description</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Questions</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Submissions</TableHead>
                  <TableHead className="hidden lg:table-cell text-right">Limit</TableHead>
                  <TableHead className="text-right md:table-cell">Created</TableHead>
                  <TableHead className="w-12 text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map((row: any) => (
                  <TableRow key={row.id}>
                    {/* Form name */}
                    <TableCell className="font-medium max-w-[160px]">{row.title || row.form_title}</TableCell>
                    {/* Description (truncate, widest) */}
                    <TableCell className="w-full">
                      <div title={row.description || row.form_description} className="truncate max-w-full">
                        {row.description || row.form_description}
                      </div>
                    </TableCell>
                    {/* Status (computed) */}
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-muted-foreground px-1.5">
                        {row.is_active === false ? (
                          <span className="text-yellow-400">Disabled</span>
                        ) : row.is_published ? (
                          <span className="text-green-400">Active</span>
                        ) : (
                          <span className="text-muted-foreground">Draft</span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right">{row.question_count ?? ''}</TableCell>
                    <TableCell className="hidden md:table-cell text-right">{row.submission_count ?? ''}</TableCell>
                    <TableCell className="hidden lg:table-cell text-right">{row.submission_limit ?? ''}</TableCell>
                    <TableCell className="text-right md:table-cell">{row.created_at ? format(new Date(row.created_at), 'PP p') : ''}</TableCell>
                    <TableCell className="w-12 text-right">
                      <a href={`/forms/view/${row.id || row.slug || row.uuid || row.pk || ''}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="icon" aria-label="Open">
                            <IconExternalLink />
                          </Button>
                        </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-muted-foreground hidden lg:flex">{filteredRows.length} row(s)</div>
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 lg:flex">
                <div className="text-sm font-medium">Rows per page</div>
                <Select value={`${pageSize}`} onValueChange={(v) => { setPageSize(Number(v)); setPageIndex(0); }}>
                  <SelectTrigger size="sm" className="w-20">
                    <SelectValue placeholder={`${pageSize}`} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((ps) => (
                      <SelectItem key={ps} value={`${ps}`}>{ps}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm">Page {pageIndex + 1} of {pageCount}</div>
                <div className="ml-2 flex items-center gap-1">
                  <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}>
                    <span className="sr-only">Go to first page</span>
                    <IconChevronsLeft />
                  </Button>
                  <Button variant="outline" className="size-8" size="icon" onClick={() => setPageIndex((p) => Math.max(0, p - 1))} disabled={pageIndex === 0}>
                    <span className="sr-only">Previous</span>
                    <IconChevronLeft />
                  </Button>
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
        </TabsContent>
        {/* Dialog to show answers for a selected submission in My Submissions tab */}
        <Dialog open={!!openSubmission} onOpenChange={(v) => { if (!v) { setOpenSubmission(null); setOpenSubmissionFull(null) } }}>
          <DialogContent className="w-[85vw] h-[85vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <DialogTitle>{((openSubmissionFull || openSubmission) && ((openSubmissionFull || openSubmission).submitted_by_email || (openSubmissionFull || openSubmission).submitted_by_name || (openSubmissionFull || openSubmission).submitted_by || 'Submission')) + ' submission'}</DialogTitle>
            </div>

            <div className="space-y-6">
              {((openSubmissionFull?.answers || openSubmission?.answers) || []).map((a: any, i: number) => (
                <div key={i} className="border rounded p-3">
                  <div className="text-sm text-muted-foreground mb-1">Question</div>
                  <div className="mb-2">{a.question_text || a.question || ''}</div>
                  <div className="text-sm text-muted-foreground mb-1">Answer</div>
                  <div>
                    {a.answer_text && <Input value={a.answer_text} readOnly className="cursor-default" />}
                    {a.answer_number !== undefined && a.answer_number !== null && <Input value={String(a.answer_number)} readOnly className="cursor-default" />}
                    {a.answer_date && <Input value={a.answer_date} readOnly className="cursor-default" />}
                    {a.answer_choices && Array.isArray(a.answer_choices) && (
                      <div className="flex flex-col gap-2 mt-2">
                        {a.answer_choices.map((c: any, idx: number) => (
                          <Input key={idx} value={String((c && (c.label || c)) || c)} readOnly className="cursor-default" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <TabsContent value="submitted">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                <TableRow>
                  <TableHead className="min-w-[140px]">Form name</TableHead>
                  <TableHead className="w-full max-w-[60%]">Description</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Questions</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Submitted</TableHead>
                  <TableHead className="w-12 text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              {filteredRows.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">No submissions found.</td>
                  </tr>
                </tbody>
              ) : (
                <TableBody>
                  {filteredRows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map((row: any) => (
                    <TableRow key={row.submission_id || row.id}>
                      <TableCell className="font-medium max-w-[160px]">{row.form_title || row.title}</TableCell>
                      <TableCell className="w-full">
                        <div title={row.form_description || row.description} className="truncate max-w-full">
                          {row.form_description || row.description}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-muted-foreground px-1.5">
                          {row.is_submitted ? (
                            <span className="text-green-400">{row.status || 'Submitted'}</span>
                          ) : row.is_active === false ? (
                            <span className="text-yellow-400">Disabled</span>
                          ) : row.is_published ? (
                            <span className="text-green-400">Active</span>
                          ) : (
                            <span className="text-muted-foreground">Draft</span>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right">{row.question_count ?? ''}</TableCell>
                      <TableCell className="text-right hidden md:table-cell">{row.submitted_at ? format(new Date(row.submitted_at), 'PP p') : ''}</TableCell>
                      <TableCell className="w-12 text-right">
                        <Button variant="outline" size="icon" aria-label="Open submission" onClick={async () => {
                          setOpenSubmission(row)
                          // fetch full submission details
                          try {
                            const sid = row.submission_id || row.id
                            const formId = row.form_id || row.form_id || row.form_id || row.form_id
                            // the retrieve endpoint is under /api/forms/{form_slug_or_id}/submissions/{id}/
                            const full = await fetchWithAuth(`/api/forms/${row.slug || row.form_id || row.form_id}/submissions/${sid}/`)
                            setOpenSubmissionFull(full)
                          } catch (e) {
                            // fallback: open row as-is
                            setOpenSubmissionFull(row)
                          }
                        }}>
                          <IconExternalLink />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

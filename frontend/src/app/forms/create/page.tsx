"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Button } from "../../../components/ui/button"
import { IconMail, IconHash, IconCalendar, IconAlignLeft, IconCircle, IconCheckbox, IconSelector, IconList, IconFileText } from "@tabler/icons-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "../../../components/ui/tooltip"
import { Checkbox } from "../../../components/ui/checkbox"
import { IconPlus, IconTrash, IconHammer, IconGripVertical } from "@tabler/icons-react"

const FIELD_TYPES: Array<{ key: string; label: string; icon: any }> = [
  { key: 'text', label: 'Text', icon: IconFileText },
  { key: 'email', label: 'Email', icon: IconMail },
  { key: 'number', label: 'Number', icon: IconHash },
  { key: 'date', label: 'Date', icon: IconCalendar },
  { key: 'textarea', label: 'Textarea', icon: IconAlignLeft },
  { key: 'radio', label: 'Radio', icon: IconCircle },
  { key: 'checkbox', label: 'Checkbox', icon: IconCheckbox },
  { key: 'dropdown', label: 'Dropdown', icon: IconSelector },
  { key: 'multiselect', label: 'Multi-select', icon: IconList },
]

export default function CreateFormPage() {
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 min-h-screen p-8 sm:p-12">
      <div className="px-4 lg:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  {/* Left column: occupies 3/12 on large screens. Add top margin on large screens to align with right column toolbar */}
  <div className="lg:col-span-3 lg:mt-12">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Form General Settings</CardTitle>
                <CardDescription>Configure global form properties.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Form Title</label>
                  <Input value={title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder="Form name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} placeholder="What is your form about, and what message you want to give?" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Questions</CardTitle>
                <CardDescription>Select a question type to add in your form.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {FIELD_TYPES.map((f) => {
                    const Icon = f.icon
                    return (
                      <button
                        key={f.key}
                        type="button"
                        aria-label={`Add ${f.label} question`}
                        className="flex items-center gap-3 rounded-md border border-border px-3 py-3 text-sm hover:bg-accent hover:text-accent-foreground text-left cursor-pointer"
                      >
                        <Icon className="size-4" />
                        <span>{f.label}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">Form Preview</Button>
                <Button variant="outline" className="flex-1">Save to Drafts</Button>
              </div>
            </div> */}
          </div>
        </div>

        {/* Right side: placeholder for form preview/editor */}
        <div className="lg:col-span-9">
            <div className="flex justify-end mb-4 gap-3">
              <Button variant="outline" size="sm">Form Preview</Button>
              <Button variant="outline" size="sm">Save to Drafts</Button>
              <Button size="sm">Publish Form</Button>
            </div>
          <div className="bg-card rounded-md border p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{title || 'Untitled form'}</h3>
              <p className="text-sm text-muted-foreground">{description || 'No description'}</p>
            </div>

            <div>
              <QuestionsTable />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

type QuestionRow = {
  id: number
  type: string
  label: string
  required: boolean
}

function QuestionsTable() {
  const initial: QuestionRow[] = [
    { id: 1, type: 'text', label: 'What is your name?', required: true },
    { id: 2, type: 'radio', label: 'How satisfied are you?', required: true },
    { id: 3, type: 'checkbox', label: 'Which features do you use?', required: false },
  ]

  const [data, setData] = React.useState<QuestionRow[]>(initial)
  const [sortKey, setSortKey] = React.useState<keyof QuestionRow | null>('label')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc' | null>('asc')
  const [draggingId, setDraggingId] = React.useState<number | null>(null)

  const sorted = React.useMemo(() => {
    const copy = [...data]
    if (!sortKey || !sortDir) return copy
    copy.sort((a, b) => {
      const va: any = a[sortKey]
      const vb: any = b[sortKey]
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      }
      if (typeof va === 'boolean' && typeof vb === 'boolean') {
        return sortDir === 'asc' ? Number(va) - Number(vb) : Number(vb) - Number(va)
      }
      return 0
    })
    return copy
  }, [data, sortKey, sortDir])

  function toggleSort(key: keyof QuestionRow) {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
      return
    }
    if (sortDir === 'asc') setSortDir('desc')
    else if (sortDir === 'desc') setSortDir(null)
    else setSortDir('asc')
  }

  function renderTypeIcon(t: string) {
    const Icon =
      t === 'text'
        ? IconFileText
        : t === 'email'
        ? IconMail
        : t === 'number'
        ? IconHash
        : t === 'date'
        ? IconCalendar
        : t === 'textarea'
        ? IconAlignLeft
        : t === 'radio'
        ? IconCircle
        : t === 'checkbox'
        ? IconCheckbox
        : t === 'dropdown'
        ? IconSelector
        : IconList

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent cursor-default">
            <Icon className="size-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>{t}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full table-auto">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left cursor-pointer" onClick={() => toggleSort('label')}>
                Question {sortKey === 'label' ? (sortDir === 'asc' ? '▲' : sortDir === 'desc' ? '▼' : '') : ''}
              </th>
              <th className="p-2 text-center cursor-pointer" onClick={() => toggleSort('required')}>
                Mandatory {sortKey === 'required' ? (sortDir === 'asc' ? '▲' : sortDir === 'desc' ? '▼' : '') : ''}
              </th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr
                key={row.id}
                className={`border-t ${draggingId === row.id ? 'opacity-60' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const idStr = e.dataTransfer.getData('text/plain')
                  const dragId = Number(idStr)
                  if (!dragId) return
                  setData((prev) => {
                    const fromIndex = prev.findIndex((p) => p.id === dragId)
                    const toIndex = prev.findIndex((p) => p.id === row.id)
                    if (fromIndex === -1 || toIndex === -1) return prev
                    const copy = [...prev]
                    const [moved] = copy.splice(fromIndex, 1)
                    copy.splice(toIndex, 0, moved)
                    return copy
                  })
                  setDraggingId(null)
                }}
              >
                <td className="p-2 align-top w-20">
                  <div className="flex items-center gap-2">
                    <div className="mr-1 cursor-grab" draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(row.id)); setDraggingId(row.id) }}>
                      <IconGripVertical className="size-4 text-muted-foreground" />
                    </div>
                    {renderTypeIcon(row.type)}
                  </div>
                </td>
                <td className="p-2 align-top">
                  <Input value={row.label} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData((d) => d.map((r) => (r.id === row.id ? { ...r, label: e.target.value } : r)))} />
                </td>
                <td className="p-2 align-top text-center">
                  <Checkbox checked={row.required} onCheckedChange={(v) => setData((d) => d.map((r) => (r.id === row.id ? { ...r, required: !!v } : r)))} />
                </td>
                <td className="p-2 align-top text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => alert('Add validation (stub)')}>
                      <IconHammer className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setData((d) => d.filter((r) => r.id !== row.id))}>
                      <IconTrash className="size-4 stroke-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setData((d) => [...d, { id: Date.now(), type: 'text', label: 'New question', required: false }])}>
            <IconPlus /> Add question
          </Button>
        </div>
      </div>
    </div>
  )
}

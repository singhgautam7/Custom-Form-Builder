"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Button } from "../../../components/ui/button"
import { IconMail, IconHash, IconCalendar, IconAlignLeft, IconCircle, IconCheckbox, IconSelector, IconList, IconFileText } from "@tabler/icons-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "../../../components/ui/tooltip"
import { Checkbox } from "../../../components/ui/checkbox"
import { IconPlus, IconTrash, IconHammer, IconGripVertical, IconX } from "@tabler/icons-react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Table as _UnusedTable } from "../../../components/ui/table"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../../../components/ui/item"
import { Popover, PopoverTrigger, PopoverContent } from "../../../components/ui/popover"
import { ChevronDownIcon } from "lucide-react"
import { IconSettings } from "@tabler/icons-react"
import { Label } from "../../../components/ui/label"
import { fetchWithAuth } from '../../../lib/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Spinner } from '../../../components/ui/spinner'
import { Calendar } from "../../../components/ui/calendar"

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
  const router = useRouter()
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [questions, setQuestions] = React.useState<QuestionRow[]>([
    { id: 1, type: 'text', label: 'What is your name?', required: true },
    { id: 2, type: 'radio', label: 'How satisfied are you?', required: true, options: ['Yes', 'No'] },
    { id: 3, type: 'checkbox', label: 'Which features do you use?', required: false, options: ['A', 'B'] },
  ])
  const canSubmit = React.useMemo(() => {
    return title.trim().length > 0 && questions.length > 0
  }, [title, questions])

  const [isSaving, setIsSaving] = React.useState(false)

  function validateBeforeSubmit() {
    if (!title.trim()) {
      toast.error('Please enter a form title')
      return false
    }
    if (!questions.length) {
      toast.error('Add at least one question')
      return false
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.label || !q.label.trim()) {
        toast.error(`Question ${i + 1}: label cannot be empty`)
        return false
      }
      if (['radio', 'checkbox', 'dropdown', 'multiselect'].includes(q.type)) {
        if (!q.options || q.options.length === 0) {
          toast.error(`Question ${i + 1}: add at least one option`)
          return false
        }
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j] || !String(q.options[j]).trim()) {
            toast.error(`Question ${i + 1}: option ${j + 1} cannot be empty`)
            return false
          }
        }
      }
    }
    return true
  }

  function mapQuestionForAPI(q: QuestionRow, idx: number) {
    const base: any = {
      question_text: q.label,
      question_type: q.type,
      is_required: !!q.required,
      order: idx + 1,
      placeholder: '',
      help_text: null,
      hint: null,
      min_length: q.minChars ?? null,
      max_length: q.maxChars ?? null,
      min_value: q.minNumber ?? null,
      max_value: q.maxNumber ?? null,
      options: null,
    }

    if (q.type === 'date') {
      base.options = {
        allow_past: true,
        min_date: q.minDate || null,
        max_date: q.maxDate || null,
      }
    }

    if (['radio', 'checkbox', 'dropdown', 'multiselect'].includes(q.type)) {
      // store options as array of {label,value}
      base.options = (q.options || []).map((o) => ({ label: String(o), value: String(o) }))
    }

    return base
  }

  async function submitForm(isPublish: boolean) {
    if (!validateBeforeSubmit()) return
    setIsSaving(true)
    try {
      const payload = {
        title: title.trim(),
        description: description || '',
        is_published: !!isPublish,
        questions: questions.map((q, i) => mapQuestionForAPI(q, i)),
      }

      const res = await fetchWithAuth('/api/forms/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      // success - toast and navigate. If published, route to the created/thank-you page using returned slug
      toast.success(isPublish ? 'Form published' : 'Saved to drafts')
      if (isPublish) {
        // prefer a UUID-like field from the backend (uuid, id, pk), fall back to slug
        const uid = (res && (res.uuid || res.id || res.pk || res.slug || (res.data && (res.data.uuid || res.data.id || res.data.pk || res.data.slug)))) || null
        if (uid) {
          try { router.push(`/forms/created/${uid}`) } catch (e) { window.location.href = `/forms/created/${uid}` }
        } else {
          try { router.push('/') } catch (e) { window.location.href = '/' }
        }
      } else {
        try { router.push('/') } catch(e) { window.location.href = '/' }
      }
    } catch (err: any) {
      const msg = err?.message || String(err)
      toast.error(`Save failed: ${msg}`)
    } finally {
      setIsSaving(false)
    }
  }

  function addQuestionOfType(type: string) {
    // start with an empty label so the Input's placeholder "Question" is visible
    const base: QuestionRow = { id: Date.now(), type, label: '', required: false }
    if (type === 'radio' || type === 'checkbox' || type === 'dropdown' || type === 'multiselect') {
      // default one option
      // @ts-ignore
      base.options = ['']
    }
    setQuestions((q) => [...q, base])
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 min-h-screen p-8 sm:p-12">
      <div className={`px-4 lg:px-6 max-w-7xl mx-auto w-full ${isSaving ? 'pointer-events-none opacity-60' : ''}`} aria-busy={isSaving}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  {/* Left column: now wider (9/12) containing inputs and questions list */}
  <div className="lg:col-span-9 lg:mt-12">
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

            {/* Questions list moved below the form settings (no outer border — Items are the bordered containers) */}
            <div>
              <QuestionsTable questions={questions} setQuestions={setQuestions} />
            </div>
          </div>
        </div>

        {/* Right side: narrower (3/12) containing toolbar and question-type buttons */}
        <div className="lg:col-span-3">
            <div className="flex justify-end mb-4 gap-3">
              <Button variant="outline" size="sm" disabled={!canSubmit || isSaving}>
                {isSaving ? <><Spinner className="h-4 w-4 mr-2" /> Processing</> : 'Form Preview'}
              </Button>
              <Button variant="outline" size="sm" disabled={!canSubmit || isSaving} onClick={() => submitForm(false)}>
                {isSaving ? <><Spinner className="h-4 w-4 mr-2" /> Saving...</> : 'Save to Drafts'}
              </Button>
              <Button size="sm" disabled={!canSubmit || isSaving} onClick={() => submitForm(true)}>
                {isSaving ? <><Spinner className="h-4 w-4 mr-2" /> Publishing...</> : 'Publish Form'}
              </Button>
            </div>
          <div className="flex flex-col gap-6">
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
                        onClick={() => addQuestionOfType(f.key)}
                        className="flex items-center gap-3 rounded-md border border-border px-3 py-3 text-sm text-left cursor-pointer"
                      >
                        <Icon className="size-4 text-accent-foreground" />
                        <span>{f.label}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
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
  // validations / options
  minChars?: number | null
  maxChars?: number | null
  minNumber?: number | null
  maxNumber?: number | null
  minDate?: string | null
  maxDate?: string | null
  options?: string[]
}

function QuestionsTable({ questions, setQuestions }: { questions: QuestionRow[]; setQuestions: React.Dispatch<React.SetStateAction<QuestionRow[]>> }) {
  // Simple sortable rendering (client-side)
  const [sortKey, setSortKey] = React.useState<keyof QuestionRow | null>(null)
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc' | null>(null)
  const [draggingId, setDraggingId] = React.useState<number | null>(null)

  const sorted = React.useMemo(() => {
    const copy = [...questions]
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
  }, [questions, sortKey, sortDir])

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
      <div className="flex items-center justify-center w-8 h-8">
        <Icon className="size-4 text-accent-foreground" />
      </div>
    )
  }

  // dnd-kit setup
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(() => questions.map((q) => q.id), [questions])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setQuestions((prev) => {
        const oldIndex = prev.findIndex((p) => p.id === (active.id as number))
        const newIndex = prev.findIndex((p) => p.id === (over.id as number))
        if (oldIndex === -1 || newIndex === -1) return prev
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  function DragHandle({ attributes, listeners }: { attributes: any; listeners: any }) {
    return (
      <Button {...attributes} {...listeners} variant="ghost" size="icon" className="text-muted-foreground size-7 hover:bg-transparent">
        <IconGripVertical className="text-muted-foreground size-3" />
        <span className="sr-only">Drag to reorder</span>
      </Button>
    )
  }

  function DraggableRow({ row }: { row: QuestionRow }) {
    const { transform, transition, setNodeRef, isDragging, attributes, listeners } = useSortable({ id: row.id })

    return (
      <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`relative z-0 ${isDragging ? 'z-10 opacity-80' : ''}`}>
        <Item variant="outline" className="w-full">
          <ItemMedia>
            {/* small drag handle area */}
            <div className="w-8 flex items-start">
              <DragHandle attributes={attributes} listeners={listeners} />
            </div>
          </ItemMedia>
          <ItemContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">{(FIELD_TYPES.find(f => f.key === row.type)?.label) ?? row.type}</div>
                  <Input placeholder="Question" value={row.label} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestions((d) => d.map((r) => (r.id === row.id ? { ...r, label: e.target.value } : r)))} />
                </div>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* validations / options area (moved to left) */}
                  {row.type === 'text' && (
                    <div className="flex items-center gap-2">
                      <Input placeholder="Min chars" value={row.minChars ?? ''} onChange={(e) => setQuestions((d) => d.map((r) => (r.id === row.id ? { ...r, minChars: e.target.value ? Number(e.target.value) : undefined } : r)))} className="w-24" />
                      <Input placeholder="Max chars" value={row.maxChars ?? ''} onChange={(e) => setQuestions((d) => d.map((r) => (r.id === row.id ? { ...r, maxChars: e.target.value ? Number(e.target.value) : undefined } : r)))} className="w-24" />
                    </div>
                  )}

                  {row.type === 'number' && (
                    <div className="flex items-center gap-2">
                      <Input placeholder="Min" value={row.minNumber ?? ''} onChange={(e) => setQuestions((d) => d.map((r) => (r.id === row.id ? { ...r, minNumber: e.target.value ? Number(e.target.value) : undefined } : r)))} className="w-24" />
                      <Input placeholder="Max" value={row.maxNumber ?? ''} onChange={(e) => setQuestions((d) => d.map((r) => (r.id === row.id ? { ...r, maxNumber: e.target.value ? Number(e.target.value) : undefined } : r)))} className="w-24" />
                    </div>
                  )}

                  {row.type === 'date' && (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-36 justify-between font-normal">
                              {row.minDate ? new Date(row.minDate).toLocaleDateString() : 'Select Min Date'}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={row.minDate ? new Date(row.minDate) : undefined}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                setQuestions((d) => d.map((r) => r.id === row.id ? { ...r, minDate: date ? (date as Date).toISOString().slice(0, 10) : undefined } : r))
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-36 justify-between font-normal">
                              {row.maxDate ? new Date(row.maxDate).toLocaleDateString() : 'Select Max Date'}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={row.maxDate ? new Date(row.maxDate) : undefined}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                setQuestions((d) => d.map((r) => r.id === row.id ? { ...r, maxDate: date ? (date as Date).toISOString().slice(0, 10) : undefined } : r))
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}

                  {(row.type === 'radio' || row.type === 'checkbox' || row.type === 'dropdown' || row.type === 'multiselect') && (
                    <div className="flex flex-col gap-2 w-full max-w-md">
                      {(row.options || []).map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input placeholder={`Option ${i + 1}`} value={opt} onChange={(e) => setQuestions((d) => d.map((r) => (r.id === row.id ? { ...r, options: (r.options || []).map((o, idx) => idx === i ? e.target.value : o) } : r)))} />
                          <Button variant="ghost" size="icon" onClick={() => setQuestions((d) => d.map((r) => r.id === row.id ? { ...r, options: (r.options || []).filter((_, idx) => idx !== i) } : r))}>
                            <IconX className="size-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex">
                        <Button size="sm" variant="outline" onClick={() => setQuestions((d) => d.map((r) => r.id === row.id ? { ...r, options: [...(r.options || []), ''] } : r))}>
                          <IconPlus /> Add option
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* <div className="flex items-center gap-3">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Required</Label>
                  </div> */}
                  <Label className="hover:bg-accent/50 flex items-center gap-2 rounded-md border px-2 py-1 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                    <Checkbox
                      id={`mandatory-${row.id}`}
                      checked={!!row.required}
                      onCheckedChange={(v) => setQuestions((d) => d.map((r) => r.id === row.id ? { ...r, required: !!v } : r))}
                      className="h-5 w-5"
                    />
                    <div className="grid gap-0.5 font-normal">
                      <p className="text-xs leading-none font-medium">Mandatory</p>
                    </div>
                  </Label>

                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="Delete Question" className="h-8 w-8 inline-flex items-center justify-center" onClick={() => setQuestions((d) => d.filter((r) => r.id !== row.id))}>
                          <IconTrash className="size-4 text-destructive"/>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Question</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </ItemContent>
        </Item>
      </div>
    )
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-3 p-2">
            {sorted.length ? (
              <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                {sorted.map((row) => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </SortableContext>
            ) : (
              <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">No questions.</div>
            )}
          </div>
        </DndContext>
      </div>
    </div>
  )
}

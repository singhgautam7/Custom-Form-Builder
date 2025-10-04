"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Button } from "../../../components/ui/button"
import { IconMail, IconHash, IconCalendar, IconAlignLeft, IconCircle, IconCheckbox, IconSelector, IconList, IconFileText } from "@tabler/icons-react"

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
  const [title, setTitle] = React.useState('New Form')
  const [description, setDescription] = React.useState('')

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: occupies 3/12 on large screens */}
        <div className="lg:col-span-3">
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
                <CardTitle>Question Types</CardTitle>
                <CardDescription>Select a question type to add.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {FIELD_TYPES.map((f) => {
                    const Icon = f.icon
                    return (
                      <button key={f.key} type="button" className="flex items-center gap-3 rounded-md border border-border px-3 py-3 text-sm hover:bg-accent hover:text-accent-foreground text-left">
                        <Icon className="size-4" />
                        <span>{f.label}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">Form Preview</Button>
                <Button variant="outline" className="flex-1">Save to Drafts</Button>
              </div>
              <Button className="w-full">Publish Form</Button>
            </div>
          </div>
        </div>

        {/* Right side: placeholder for form preview/editor */}
        <div className="lg:col-span-9">
          <div className="h-[640px] border rounded-md bg-muted/20 flex items-center justify-center text-muted-foreground">Form editor / preview (right side) — coming soon</div>
        </div>
      </div>
    </div>
  )
}

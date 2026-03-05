"use client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBuilderStore } from "../builderStore"
import type { FormErrors } from "../types"

export function FormSettingsCard({ errors }: { errors: FormErrors }) {
  const { form, updateForm } = useBuilderStore()

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Form Settings</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1">
          <Label className="text-sm">Title <span className="text-destructive">*</span></Label>
          <Input value={form.title} onChange={e => updateForm({ title: e.target.value })} placeholder="My Form" />
          {errors.title && <Label className="text-red-500 text-sm">{errors.title}</Label>}
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Description</Label>
          <Textarea value={form.description} onChange={e => updateForm({ description: e.target.value })} placeholder="What is this form about?" className="min-h-[80px]" />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Allow Multiple Submissions</Label>
            <p className="text-xs text-muted-foreground">Allow each user to submit the form multiple times</p>
          </div>
          <Checkbox checked={form.allow_multiple_submissions} onCheckedChange={(v: boolean) => updateForm({ allow_multiple_submissions: v })} />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Password Protected</Label>
              <p className="text-xs text-muted-foreground">The form could be submitted only with this password</p>
            </div>
            <Checkbox checked={form.is_password_protected} onCheckedChange={(v: boolean) => updateForm({ is_password_protected: v })} />
          </div>
          {form.is_password_protected && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Access Code</Label>
              <Input type="password" value={form.access_code} onChange={e => updateForm({ access_code: e.target.value })} placeholder="Enter access code" />
              {errors.access_code && <Label className="text-red-500 text-sm">{errors.access_code}</Label>}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-1">
          <Label className="text-sm">Submission Limit</Label>
          <p className="text-xs text-muted-foreground">If the number of submissions reaches this limit, the form will be marked as Closed automatically</p>
          <Input type="number" value={form.submission_limit ?? ""} onChange={e => updateForm({ submission_limit: e.target.value ? parseInt(e.target.value) : undefined })} placeholder="No limit" className="max-w-[200px]" />
        </div>
      </CardContent>
    </Card>
  )
}

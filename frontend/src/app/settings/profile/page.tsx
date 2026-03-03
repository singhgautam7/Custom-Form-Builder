"use client"

import { useAuth } from "@/hooks/use-auth"
import { Shell } from "@/components/layout/Shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import api from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function ProfileSettingsPage() {
  const { user, getInitials, refetch, isLoading } = useAuth()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "")
      setLastName(user.last_name || "")
    }
  }, [user])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await api.updateProfile({ first_name: firstName, last_name: lastName })
      await refetch()
      toast.success("Profile updated successfully")
    } catch (e) {
      toast.error((e as Error).message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Shell>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="max-w-2xl py-10 w-full space-y-8 px-6 text-left">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Profile Settings</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage your personal information and security preferences.</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary/30 to-primary/10 border border-border/80 flex items-center justify-center text-2xl font-semibold tracking-widest text-primary shrink-0">
            {getInitials() || '...'}
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">Avatar</h3>
            <p className="text-xs text-muted-foreground">Your avatar is generated from your initials.</p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} readOnly className="bg-muted/50 text-muted-foreground cursor-not-allowed" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
            </div>
          </div>

          <div className="flex justify-start sm:justify-end mt-4">
            <Button onClick={handleSave} disabled={isSaving || !user}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 mt-8">
          <h3 className="font-medium mb-4">Security</h3>
          <div className="flex justify-start">
            <Button variant="outline">Change Password</Button>
          </div>
        </div>
      </div>
    </Shell>
  )
}

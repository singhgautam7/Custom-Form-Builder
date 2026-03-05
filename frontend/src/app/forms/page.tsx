"use client"

import { Shell } from "@/components/layout/Shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, MoreVertical, FileText, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"

const mockForms = [
  { id: "F-001", title: "Customer Feedback Q3", status: "Published", responses: 1240, updated: "2 hours ago" },
  { id: "F-002", title: "NPS Survey 2024", status: "Published", responses: 890, updated: "1 day ago" },
  { id: "F-003", title: "Internal Employee Onboarding", status: "Draft", responses: 0, updated: "3 days ago" },
  { id: "F-004", title: "Event Registration: TechMeet", status: "Published", responses: 450, updated: "1 week ago" },
  { id: "F-005", title: "Product Feature Waitlist", status: "Published", responses: 12, updated: "2 weeks ago" },
]

export default function FormsPage() {
  return (
    <Shell>
      <div className="flex-1 space-y-4 p-6 pt-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">All Forms</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage, edit, and organize all your created forms.</p>
          </div>
          <div className="flex items-center space-x-2">
             <Button asChild>
               <Link href="/forms/new">
                 <Plus className="mr-2 h-4 w-4" /> Create Form
               </Link>
             </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden flex flex-col min-h-[500px]">
           <div className="p-4 border-b border-border/50 flex items-center justify-between gap-4 bg-muted/20 supports-[backdrop-filter]:bg-background/60">
             <div className="relative w-full max-w-sm">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input
                 type="search"
                 placeholder="Search forms..."
                 className="pl-9 bg-background"
               />
             </div>
             <Button variant="outline" size="sm" className="h-9 border-border/50"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
           </div>

           <div className="flex-1 p-0">
             <div className="grid grid-cols-1 divide-y divide-border/50">
               {mockForms.map((form) => (
                 <div key={form.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                   <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${form.status === 'Published' ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
                       <FileText className="w-5 h-5" />
                     </div>
                     <div>
                       <Link href={`/builder?id=${form.id}`} className="font-medium text-foreground hover:underline decoration-primary underline-offset-4">{form.title}</Link>
                       <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                         <span className="flex items-center gap-1">
                           {form.status === 'Published' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5" />}
                           {form.status}
                         </span>
                         <span>•</span>
                         <span>{form.responses} responses</span>
                         <span>•</span>
                         <span>Updated {form.updated}</span>
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <Button variant="outline" size="sm" asChild className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
                       <Link href={`/builder?id=${form.id}`}>Edit</Link>
                     </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                       <MoreVertical className="h-4 w-4" />
                     </Button>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </Shell>
  )
}

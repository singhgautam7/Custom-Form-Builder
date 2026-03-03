"use client"

import * as React from "react"
import { Shell } from "@/components/layout/Shell"
import { Topbar } from "@/components/layout/Topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Filter, Search, Settings2, FileJson, FileSpreadsheet, Eye } from "lucide-react"

const mockSubmissions = [
  { id: "SUB-1234", form: "Customer Feedback Q3", date: "2 mins ago", status: "Completed", email: "user1@example.com" },
  { id: "SUB-1235", form: "NPS Survey", date: "15 mins ago", status: "Completed", email: "john@doe.com" },
  { id: "SUB-1236", form: "Event Registration", date: "1 hour ago", status: "Incomplete", email: "sarah@smith.com" },
  { id: "SUB-1237", form: "Customer Feedback Q3", date: "3 hours ago", status: "Completed", email: "mike@company.com" },
  { id: "SUB-1238", form: "Product Waitlist", date: "Yesterday", status: "Completed", email: "alex@startup.io" },
]

export default function SubmissionsPage() {
  const [search, setSearch] = React.useState("")

  return (
    <Shell>
      <div className="flex-1 space-y-4 p-6 pt-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Submissions</h2>
            <p className="text-sm text-muted-foreground mt-1">Review and manage gathered form data securely.</p>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" size="sm" className="hidden sm:flex">
                   <Download className="mr-2 h-4 w-4" /> Export All
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-40 mt-1">
                 <DropdownMenuItem><FileSpreadsheet className="w-4 h-4 mr-2" /> CSV</DropdownMenuItem>
                 <DropdownMenuItem><FileJson className="w-4 h-4 mr-2" /> JSON</DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden flex flex-col h-[calc(100vh-14rem)]">
          <div className="p-4 border-b border-border/50 flex items-center justify-between gap-4 bg-muted/20 supports-[backdrop-filter]:bg-background/60">
             <div className="relative w-full max-w-sm">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input
                 type="search"
                 placeholder="Search submissions..."
                 className="pl-9 bg-background"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
             <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" className="h-9 border-border/50 hidden md:flex"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
               <Button variant="outline" size="sm" className="h-9 border-border/50"><Settings2 className="mr-2 h-4 w-4" /> View</Button>
             </div>
          </div>

          <div className="flex-1 overflow-auto">
             <table className="w-full text-sm">
               <thead className="sticky top-0 bg-muted/40 backdrop-blur z-10 text-xs uppercase tracking-wider text-muted-foreground text-left border-y border-border/50">
                 <tr>
                   <th className="px-6 py-3 font-medium">Submission ID</th>
                   <th className="px-6 py-3 font-medium">Form</th>
                   <th className="px-6 py-3 font-medium">Respondent</th>
                   <th className="px-6 py-3 font-medium">Status</th>
                   <th className="px-6 py-3 font-medium">Date</th>
                   <th className="px-6 py-3 font-medium text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/50">
                 {mockSubmissions.map((sub) => (
                   <tr key={sub.id} className="group hover:bg-muted/20 transition-colors">
                     <td className="px-6 py-3.5 whitespace-nowrap font-medium text-foreground">{sub.id}</td>
                     <td className="px-6 py-3.5 whitespace-nowrap text-muted-foreground group-hover:text-foreground transition-colors">{sub.form}</td>
                     <td className="px-6 py-3.5 whitespace-nowrap text-muted-foreground">{sub.email}</td>
                     <td className="px-6 py-3.5 whitespace-nowrap">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${sub.status === 'Completed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                         {sub.status}
                       </span>
                     </td>
                     <td className="px-6 py-3.5 whitespace-nowrap text-muted-foreground">{sub.date}</td>
                     <td className="px-6 py-3.5 whitespace-nowrap text-right text-muted-foreground">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted"><Eye className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted"><Download className="h-4 w-4" /></Button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          <div className="p-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
             <div>Showing 1 to 5 of 3,542 results</div>
             <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" className="h-8" disabled>Previous</Button>
               <Button variant="outline" size="sm" className="h-8">Next</Button>
             </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

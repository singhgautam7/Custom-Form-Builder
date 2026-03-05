"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LayoutDashboard, FileText, Settings, Database, PanelLeftClose, PanelLeft, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: FileText, label: "All Forms", href: "/forms" },
  { icon: Database, label: "Submissions", href: "/submissions" },
  // { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 68 : 240 }}
      className={cn(
        "relative flex h-screen flex-col border-r border-border/50 bg-card/40 supports-[backdrop-filter]:bg-card/20 backdrop-blur-md transition-all sm:flex overflow-hidden",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4 border-b border-border/50">
         <div className="flex items-center gap-2 overflow-hidden">
           <div className="h-6 w-6 rounded bg-primary flex items-center justify-center shrink-0">
             <span className="text-primary-foreground font-bold text-[10px]">F</span>
           </div>
           {!isCollapsed && <span className="font-semibold text-sm whitespace-nowrap tracking-tight">FormBuilder</span>}
         </div>
         <Button
           variant="ghost"
           size="icon"
           className="h-6 w-6 shrink-0 text-muted-foreground hover:bg-muted/50"
           onClick={() => setIsCollapsed(!isCollapsed)}
         >
           {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
         </Button>
      </div>

      <div className="flex-1 overflow-auto py-4 px-3 flex flex-col gap-1.5">
         <Button
           variant="default"
           className={cn("mb-4 justify-start overflow-hidden shadow-none", isCollapsed ? "px-0 justify-center" : "")}
           size={isCollapsed ? "icon" : "default"}
         >
           <Plus className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
           {!isCollapsed && "New Form"}
         </Button>

         <div className="space-y-1">
           {navItems.map((item) => {
             const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href)
             return (
               <Link key={item.href} href={item.href}>
                 <div
                   className={cn(
                     "group flex items-center rounded-md px-2.5 py-2 text-sm font-medium hover:bg-muted/50 transition-colors relative",
                     isActive ? "text-primary bg-primary/5 hover:bg-primary/10" : "text-muted-foreground",
                     isCollapsed && "justify-center"
                   )}
                   title={isCollapsed ? item.label : undefined}
                 >
                   <item.icon className={cn("h-4 w-4 flex-shrink-0", !isCollapsed && "mr-3", isActive && "text-primary")} />
                   {!isCollapsed && <span className="truncate">{item.label}</span>}
                 </div>
               </Link>
             )
           })}
         </div>
      </div>
    </motion.aside>
  )
}

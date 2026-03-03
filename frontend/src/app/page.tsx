"use client"

import * as React from "react"
import { Shell } from "@/components/layout/Shell"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, ArrowUpRight, FileText, UploadCloud, Users, CheckCircle2 } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => api.getAnalyticsSummary()
  })

  const stats = data || {
    total_forms: 0,
    total_submissions: 0,
    active_views: 0,
    recent_submissions: 0,
    submission_trend: [],
    recent_activity: [] as Array<{
      id: string;
      form_title: string;
      submitter: string;
      submitted_at: string;
    }>
  }

  // helper to format date
  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }
  return (
    <Shell>
      <div className="flex-1 space-y-6 p-6 pt-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your forms and view recent submissions.</p>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto" asChild>
               <Link href="/builder?id=new">
                 <Plus className="mr-2 h-4 w-4" /> Create Form
               </Link>
            </Button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium tracking-tight">Total Forms</h3>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-16" /> : stats.total_forms}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                All time created forms
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium tracking-tight">Total Submissions</h3>
                <UploadCloud className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-24" /> : stats.total_submissions}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                Across all forms
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium tracking-tight">Active Views</h3>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-24" /> : stats.active_views}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                In the last 30 days
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium tracking-tight">Recent Submissions</h3>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-3xl font-bold">
                {isLoading ? <Skeleton className="h-9 w-16" /> : stats.recent_submissions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                In the last 7 days
              </p>
            </div>
          </motion.div>
        </div>

        {/* Charts and Tables Row */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 pt-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-4">
            <div className="rounded-xl border border-border/60 bg-card shadow-sm h-full">
              <div className="p-6">
                <h3 className="font-semibold text-base">Submission Trend</h3>
                <p className="text-sm text-muted-foreground mb-6">Traffic overview over the last 7 days.</p>
                <div className="h-[280px] w-full">
                  {isLoading ? (
                    <Skeleton className="w-full h-full rounded-md" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.submission_trend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                      <XAxis
                        dataKey="name"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip
                        cursor={{ fill: 'var(--muted)' }}
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          borderColor: 'var(--border)',
                          color: 'var(--foreground)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          border: '1px solid var(--border)'
                        }}
                        itemStyle={{ color: 'var(--foreground)', fontSize: '13px' }}
                        labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px', fontSize: '12px' }}
                      />
                      <Bar dataKey="submissions" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-3">
            <div className="rounded-xl border border-border/60 bg-card shadow-sm h-full flex flex-col">
              <div className="p-6 pb-2">
                <h3 className="font-semibold text-base">Recent Activity</h3>
                <p className="text-sm text-muted-foreground">You had {stats.recent_submissions} submissions this week.</p>
              </div>
              <div className="p-6 pt-4 flex-1">
                <div className="space-y-6">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : stats.recent_activity.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>
                  ) : (
                    stats.recent_activity.map((activity: any) => (
                      <div key={activity.id} className="flex items-center group cursor-pointer">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                           <FileText className="w-4 h-4" />
                        </div>
                        <div className="ml-4 space-y-1 flex-1">
                          <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{activity.form_title}</p>
                          <p className="text-xs text-muted-foreground">{activity.submitter}</p>
                        </div>
                        <div className="ml-auto text-xs font-medium text-muted-foreground">{formatTimeAgo(activity.submitted_at)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Shell>
  )
}

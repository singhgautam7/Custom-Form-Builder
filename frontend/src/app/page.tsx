"use client"

import * as React from "react"
import { Shell } from "@/components/layout/Shell"
import { Button } from "@/components/ui/button"
import { Plus, ArrowUpRight, FileText, UploadCloud, Users, CheckCircle2 } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { motion } from "framer-motion"

const mockChartData = [
  { name: "Mon", submissions: 12 },
  { name: "Tue", submissions: 34 },
  { name: "Wed", submissions: 22 },
  { name: "Thu", submissions: 45 },
  { name: "Fri", submissions: 80 },
  { name: "Sat", submissions: 30 },
  { name: "Sun", submissions: 50 },
]

export default function DashboardPage() {
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
            <Button size="sm" className="w-full sm:w-auto">
               <Plus className="mr-2 h-4 w-4" /> Create Form
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
              <div className="mt-2 text-3xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" /> <span className="text-emerald-500 font-medium">15%</span> from last month
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium tracking-tight">Total Submissions</h3>
                <UploadCloud className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-3xl font-bold">3,542</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" /> <span className="text-emerald-500 font-medium">+231</span> this week
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium tracking-tight">Active Views</h3>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-3xl font-bold">12.5k</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" /> <span className="text-emerald-500 font-medium">8.1%</span> from last month
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium tracking-tight">Completion Rate</h3>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-3xl font-bold">42.3%</div>
              <p className="text-xs text-muted-foreground mt-1">
                +2.4% from average
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-3">
            <div className="rounded-xl border border-border/60 bg-card shadow-sm h-full flex flex-col">
              <div className="p-6 pb-2">
                <h3 className="font-semibold text-base">Recent Submissions</h3>
                <p className="text-sm text-muted-foreground">You had 12 submissions today.</p>
              </div>
              <div className="p-6 pt-4 flex-1">
                <div className="space-y-6">
                  {/* Activity list placeholder */}
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center group cursor-pointer">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                         UI
                      </div>
                      <div className="ml-4 space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">Feedback Survey #{i}</p>
                        <p className="text-xs text-muted-foreground">user{i}@example.com</p>
                      </div>
                      <div className="ml-auto text-xs font-medium text-muted-foreground">just now</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Shell>
  )
}

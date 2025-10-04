"use client"

import * as React from "react"
import { Badge } from "../ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { fetchWithAuth } from "../../lib/api"
import { toast } from "sonner"

type Metrics = {
  total_forms_created: number
  total_forms_submitted: number
  total_answers_received: number
  answers_on_last_form: number
}

export function HomeMetricsCard() {
  const [metrics, setMetrics] = React.useState<Metrics | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchWithAuth('/api/forms/dashboard-metrics/')
      .then((data) => {
        if (!mounted) return
        setMetrics({
          total_forms_created: data.total_forms_created ?? 0,
          total_forms_submitted: data.total_forms_submitted ?? 0,
          total_answers_received: data.total_answers_received ?? 0,
          answers_on_last_form: data.answers_on_last_form ?? 0,
        })
      })
      .catch((err: any) => {
        console.error('metrics error', err)
        toast.error('Unable to fetch dashboard metrics')
        setMetrics({ total_forms_created: 0, total_forms_submitted: 0, total_answers_received: 0, answers_on_last_form: 0 })
      })
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Forms Created</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? '—' : metrics?.total_forms_created ?? 0}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Total forms you created</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Forms Submitted</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? '—' : metrics?.total_forms_submitted ?? 0}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Forms with at least one submission</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Answers Received</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? '—' : metrics?.total_answers_received ?? 0}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">All answers across your forms</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Answers on Last Form</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? '—' : metrics?.answers_on_last_form ?? 0}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Answers collected on your latest form</div>
        </CardFooter>
      </Card>
    </div>
  )
}

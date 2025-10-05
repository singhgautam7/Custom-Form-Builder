"use client"

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/card'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { IconCopy } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CreatedPage({ params }: { params: any }) {
  const router = useRouter()
  // Next.js may pass `params` as a Promise-like object in newer versions.
  // Use React.use(params) when available to safely unwrap it. Fall back to
  // using params directly for older runtimes.
  let routeParams: any = params
  try {
    const maybeUse = (React as any).use
    if (typeof maybeUse === 'function') {
      routeParams = (React as any).use(params)
    }
  } catch (err) {
    routeParams = params
  }
  // params.slug may actually be uuid/id/pk or slug; we prefer using it as the unique id for the submit link
  const id = routeParams?.slug ?? params?.slug
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/form/submit/${id}` : `/form/submit/${id}`

  function copyLink() {
    try {
      navigator.clipboard.writeText(publicUrl)
      toast.success('Link copied')
    } catch (e) {
      toast.error('Copy failed')
    }
  }

  return (
    <div className="min-h-screen flex items-start justify-center p-8">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>Form Published</CardTitle>
            <CardDescription>Your form is live. Share the link below to collect responses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Input readOnly value={publicUrl} />
              <div className="flex gap-2">
                <Button onClick={copyLink}>
                  <IconCopy className="size-4 mr-2" /> Copy Link
                </Button>
                <Button variant="ghost" onClick={() => { try { router.push('/') } catch(e) { window.location.href = '/' } }}>
                  Done
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

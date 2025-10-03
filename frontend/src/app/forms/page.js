"use client"
import React, {useEffect, useState} from 'react'
import { apiFetch, getToken } from '../../../src/lib/api'
import { useRouter } from 'next/navigation'
import { Button, Group, Card, Text } from '@mantine/core'

export default function MyForms(){
  const router = useRouter()
  const [forms, setForms] = useState([])
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load(p=1){
    setLoading(true)
    setError(null)
    try{
      const token = getToken()
      const data = await apiFetch('/api/forms/', { params: { page: p }, token })
      setForms(data.results || data)
      setCount(data.count || (data.results ? data.results.length : (data.length || 0)))
      setPage(p)
    }catch(e){
      setError(e)
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ load(1) }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Forms</h1>
          <div className="text-sm text-gray-600">Create and manage your forms. Click a form to edit or view submissions.</div>
        </div>
        <Group>
          <Button color="brand" onClick={() => router.push('/forms/create')}>Create Form</Button>
        </Group>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 border">Error loading forms</div>}

      <div className="grid md:grid-cols-2 gap-4">
        {loading ? <div>Loading...</div> : (
          forms.map(f=> (
            <Card key={f.id} shadow="sm" radius="md" padding="lg">
              <div className="flex items-start justify-between">
                <div>
                  <Text weight={700} size="lg">{f.title}</Text>
                  <Text size="sm" color="dimmed" className="mt-1">{f.description || ''}</Text>
                  <Text size="sm" color="dimmed" className="mt-2">{f.submissions_count ?? f.submissions ?? 0} submissions • {f.public ? 'Public' : 'Private'}</Text>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm text-gray-500">{f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}</div>
                  <div className="flex gap-2">
                    <Button size="xs" color="brand" onClick={() => router.push(`/forms/${f.id}/submissions`)}>Submissions</Button>
                    <Button size="xs" variant="outline" onClick={() => router.push(`/forms/${f.id}/edit`)}>Edit</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div />
        <button onClick={()=>load(page+1)} className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  )
}

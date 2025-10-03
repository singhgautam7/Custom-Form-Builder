"use client"
import React, {useEffect, useState} from 'react'
import Modal from '../../../src/components/Modal'
import { apiFetch, getToken } from '../../../src/lib/api'

export default function MySubmissions(){
  const [subs, setSubs] = useState([])
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(null)
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load(p=1){
    setLoading(true); setError(null)
    try{
      const token = getToken()
      const data = await apiFetch('/api/submissions/', { params: { page: p }, token })
      setSubs(data.results || data)
      setCount(data.count || (data.results ? data.results.length : (data.length || 0)))
      setPage(p)
    }catch(e){ setError(e) } finally { setLoading(false) }
  }

  useEffect(()=>{ load(1) }, [])

  async function openSubmission(id){
    try{
      const token = getToken()
      const data = await apiFetch(`/api/submissions/${id}/`, { token })
      setCurrent(data)
      setOpen(true)
    }catch(e){ console.error(e) }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">My Submissions</h1>

      {error && <div className="p-3 bg-red-50 text-red-700 border">Error loading submissions</div>}

      <div className="grid gap-3">
        {loading ? <div>Loading...</div> : (
          subs.map(s=> (
            <div key={s.id} className="p-3 bg-white border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{s.form_title || s.form || 'Form'}</div>
                <div className="text-sm text-gray-500">{s.submitted_at || s.created_at} • {s.answers?.length ?? s.question_count ?? '—'} questions</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>openSubmission(s.id)} className="px-3 py-1 border rounded">Open</button>
                <button onClick={()=>navigator.clipboard.writeText(window.location.origin + '/forms/' + (s.form_slug || s.form))} className="px-3 py-1 border rounded">Copy link</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">Total: {count}</div>
        <div className="flex gap-2">
          <button disabled={page<=1} onClick={()=>load(page-1)} className="px-3 py-1 border rounded">Prev</button>
          <button onClick={()=>load(page+1)} className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title={current?.form_title || current?.form || ''}>
        <div>
          {(current?.answers || []).map((ans, i)=> (
            <div key={i} className="mb-2">
              <div className="font-semibold">{ans.question}</div>
              <div>{ans.answer}</div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}

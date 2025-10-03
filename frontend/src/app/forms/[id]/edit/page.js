"use client"
import React, { useEffect, useState } from 'react'
import FormBuilder from '../../../../../src/components/FormBuilder'
import { apiFetch, getToken } from '../../../../../src/lib/api'

export default function EditFormPage({ params }){
  const id = params.id
  const [initial, setInitial] = useState(null)

  useEffect(()=>{
    async function load(){
      try{
        const token = getToken()
        const data = await apiFetch(`/api/forms/${id}/`, { token })
  // map to builder shape (keep choices as array)
  data.questions = data.questions.map(q=> ({ ...q, choices: q.choices || [] }))
        setInitial(data)
      }catch(e){ console.error(e) }
    }
    load()
  }, [id])

  async function handleSave(values){
    const body = { ...values }
    try{
      const token = getToken()
      await apiFetch(`/api/forms/${id}/`, { method: 'PUT', token, body })
      alert('Saved')
    }catch(e){ console.error(e) }
  }

  if(!initial) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Edit Form</h1>
      <FormBuilder initial={initial} onSave={handleSave} />
    </div>
  )
}

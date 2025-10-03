"use client"
import React from 'react'
import FormBuilder from '../../../../src/components/FormBuilder'
import { apiFetch, getToken } from '../../../../src/lib/api'

export default function CreateFormPage(){
  async function handleSave(data){
    // data.questions now contains choices as an array (from FormBuilder)
    const body = { ...data }
    try{
      const token = getToken()
      const res = await apiFetch('/api/forms/', { method: 'POST', token, body })
      window.location.href = `/forms/${res.id}/edit`
    }catch(e){ console.error(e) }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Create Form</h1>
      <FormBuilder onSave={handleSave} />
    </div>
  )
}

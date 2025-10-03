"use client"
import React, { useState } from 'react'
import { setTokens } from '../../../src/lib/auth'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../../../src/lib/api'
import { ENDPOINTS } from '../../../src/lib/config'

export default function RegisterPage(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function submit(e){
    e.preventDefault()
    try{
      const data = await apiFetch(ENDPOINTS.AUTH_REGISTER, { method: 'POST', body: { email, password } })
      if(data && data.access){
        setTokens({ access: data.access, refresh: data.refresh })
        router.push('/')
      }else{
        alert('Registration failed')
      }
    }catch(err){
      console.error(err)
      alert(err?.data?.detail || 'Registration error')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Create account</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 border rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 border rounded" />
        </div>
        <div className="flex items-center justify-between">
          <button style={{ background: '#659DFB' }} className="px-5 py-2 text-white rounded shadow">Create</button>
          <a href="/login" className="text-sm" style={{ color: '#659DFB' }}>Already have an account?</a>
        </div>
      </form>
    </div>
  )
}

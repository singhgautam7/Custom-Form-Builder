"use client"
import React, { useState } from 'react'
import { setTokens } from '../../../src/lib/auth'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../../../src/lib/api'
import { Button, TextInput, PasswordInput } from '@mantine/core'
import { ENDPOINTS } from '../../../src/lib/config'

export default function LoginPage(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  async function submit(e){
    e.preventDefault()
    try{
  const data = await apiFetch(ENDPOINTS.AUTH_LOGIN, { method: 'POST', body: { email, password } })
      if(data && data.access){
        setTokens({ access: data.access, refresh: data.refresh })
        router.push('/')
      }else{
        alert('Login failed')
      }
    }catch(err){
      console.error(err)
      alert(err?.data?.detail || 'Login error')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Sign in</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <TextInput label="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <PasswordInput label="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
            <Button type="submit" color="brand">Sign in</Button>
          <a href="/register" className="text-sm" style={{ color: 'var(--mantine-color-brand-6, #2f95fb)' }}>Create account</a>
        </div>
      </form>
    </div>
  )
}

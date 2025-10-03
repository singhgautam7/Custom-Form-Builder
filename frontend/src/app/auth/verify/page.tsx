"use client"
import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { verifyEmail, resendVerification } from '../../../lib/api'
import { toast } from 'sonner'

export default function VerifyPage(){
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') || undefined
  const [status, setStatus] = useState<'idle'|'verifying'|'success'|'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(()=>{
    async function doVerify(){
      if(!token) return
      setStatus('verifying')
      try{
        await verifyEmail(token)
        setStatus('success')
        setMessage('Email verified successfully. You may now sign in.')
        toast.success('Email verified successfully')
        // auto-redirect to signin after a short delay
        setTimeout(()=>router.push('/auth/signin'), 4000)
      }catch(err){
        setStatus('error')
        setMessage(err instanceof Error ? err.message : String(err))
        toast.error(err instanceof Error ? err.message : String(err))
      }
    }
    doVerify()
  }, [token, router])

  async function handleResend(e: React.FormEvent){
    e.preventDefault(); setResendLoading(true)
    try{
      await resendVerification(email)
      setMessage('Verification email resent. Check your inbox.')
    }catch(err){
      setMessage(err instanceof Error ? err.message : String(err))
    }finally{ setResendLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h2 className="text-xl font-semibold mb-4">Verify your email</h2>
        {status === 'verifying' && <p className="mb-6">Verifying your email...</p>}
        {status === 'success' && <p className="mb-6 text-green-600">{message}</p>}
        {status === 'error' && <p className="mb-6 text-red-600">{message}</p>}
        <div className="mb-6">
          <Button onClick={()=>router.push('/auth/signin')}>Back to sign in</Button>
        </div>

        <hr className="my-4" />

        <div className="text-left">
          <p className="mb-2">Didn&apos;t receive an email? Enter your email to resend verification.</p>
          <form onSubmit={handleResend} className="flex gap-2">
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setEmail(e.target.value)} required />
            <Button type="submit" disabled={resendLoading}>{resendLoading ? 'Sending...' : 'Resend'}</Button>
          </form>
          {message && <p className="mt-3 text-sm">{message}</p>}
        </div>
      </div>
    </div>
  )
}

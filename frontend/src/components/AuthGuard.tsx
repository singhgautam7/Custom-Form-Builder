"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken, clearTokens, fetchWithAuth } from '../lib/api'
import { Spinner } from './ui/spinner'

export default function AuthGuard({ children }: { children: React.ReactNode }){
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(()=>{
    async function check(){
      const token = getAccessToken()
      if(!token){ setChecking(false); router.push('/auth/signin'); return }
      try{
        // attempt a lightweight authenticated call to verify token validity
        await fetchWithAuth('/api/auth/me/', { method: 'GET' })
        setChecking(false)
      }catch(err){
        // Only clear tokens and redirect when the error is an explicit Unauthorized (refresh failed).
        const message = err instanceof Error ? err.message : String(err)
        if (message && message.toLowerCase().includes('unauthorized')){
          clearTokens()
          setChecking(false)
          router.push('/auth/signin')
        } else {
          // Treat non-authorization errors (network, server down) as temporary: allow access but stop checking.
          setChecking(false)
          console.warn('AuthGuard: non-authorization error while checking token:', err)
        }
      }
    }
    check()
  }, [router])

  if(checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="h-12 w-12" />
      <span className="sr-only">Checking authentication</span>
    </div>
  )
  return <>{children}</>
}

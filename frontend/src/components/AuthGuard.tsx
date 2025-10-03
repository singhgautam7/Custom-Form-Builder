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
        await fetchWithAuth('/api/auth-check/', { method: 'GET' })
        setChecking(false)
      }catch{
        clearTokens()
        setChecking(false)
        router.push('/auth/signin')
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

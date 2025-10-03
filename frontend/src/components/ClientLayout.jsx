"use client"
import React, { useEffect, useState } from 'react'
import MantineProviderWrapper from './MantineProviderWrapper'
import Sidebar from './Sidebar'
import Header from './Header'
import { usePathname, useRouter } from 'next/navigation'
import { getAccessToken, clearTokens } from '../lib/auth'

export default function ClientLayout({ children }){
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(()=>{
    try{ const v = localStorage.getItem('sidebarCollapsed'); setCollapsed(v === '1') }catch(e){}
  }, [])

  useEffect(()=>{
    // redirect to /login when not authenticated and not already on auth pages
    const token = getAccessToken()
    if(!token && !pathname.startsWith('/login') && !pathname.startsWith('/register')){
      router.push('/login')
    }
  }, [pathname])

  function toggle(){
    // If on small screen, toggle mobile overlay; otherwise toggle desktop collapse
    if (typeof window !== 'undefined' && window.innerWidth < 768){
      setMobileOpen(m => !m)
      return
    }
    setCollapsed(c=>{ const next = !c; try{ localStorage.setItem('sidebarCollapsed', next ? '1' : '0') }catch(e){}; return next })
  }

  // If collapsed on desktop, ensure mobile overlay is closed
  React.useEffect(()=>{
    if (collapsed) setMobileOpen(false)
  }, [collapsed])

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')

  function handleLogout(){
    clearTokens()
    router.push('/login')
  }

  return (
    <MantineProviderWrapper>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {!isAuthRoute && <Header onToggle={toggle} onLogout={handleLogout} />}
        <div className={`flex-1 flex ${isAuthRoute ? 'items-center justify-center' : ''}`}>
          {!isAuthRoute && (
            <Sidebar collapsed={collapsed} onToggle={toggle} currentPath={pathname} onLogout={handleLogout} mobileOpen={mobileOpen} onMobileToggle={setMobileOpen} />
          )}
          <main className={isAuthRoute ? 'w-full p-6' : 'p-6 max-w-6xl w-full mx-auto'}>{children}</main>
        </div>
        <footer className="footer p-4 text-center">Form Maker © {new Date().getFullYear()}</footer>
      </div>
      {/* <MantineDebug /> */}
    </MantineProviderWrapper>
  )
}

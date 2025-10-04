"use client"
import React, { useEffect, useState } from 'react'
import { buttonVariants } from './ui/button'
import { Sun, Moon } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip'
import { cn } from '../lib/utils'

const ThemeToggle = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(function ThemeToggle(props, ref){
  // avoid reading localStorage during render to prevent SSR/client hydration mismatch
  const [theme, setTheme] = useState<'light'|'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(()=>{
    setMounted(true)
    const stored = localStorage.getItem('theme') as 'light'|'dark' | null
    const initial = stored || 'light'
    setTheme(initial)
    if(initial === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [])

  useEffect(()=>{
    if(!mounted) return
    if(theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  function toggle(){ setTheme(prev => prev === 'dark' ? 'light' : 'dark') }

  const className = cn(buttonVariants({ variant: 'ghost' }), 'flex items-center justify-center p-2', props.className)

  return (
    <button {...props} ref={ref} onClick={(e)=>{ props.onClick?.(e); toggle() }} aria-label="Toggle theme" className={className}>
      <span className={`transition-transform duration-300 ${mounted && theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-90'}`}>
        {mounted ? (theme === 'dark' ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>) : <span className="inline-block w-5 h-5" />}
      </span>
    </button>
  )
})

export default function Header(){
  return (
    <header className="w-full border-b px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-primary" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-px h-6 bg-border" />
        <Tooltip>
          <TooltipTrigger asChild>
            <ThemeToggle />
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>Toggle theme</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}


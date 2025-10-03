"use client"
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Sun, Moon } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip'

function ThemeToggle(){
  const [theme, setTheme] = useState<'light'|'dark'>(() => typeof window !== 'undefined' ? (localStorage.getItem('theme') as 'light'|'dark' || 'light') : 'light')
  useEffect(()=>{
    if(theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])
  return (
    <Button variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex items-center justify-center p-2"
      aria-label="Toggle theme"
    >
      <span className={`transition-transform duration-300 ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-90'}`}>
        {theme === 'dark' ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}
      </span>
    </Button>
  )
}

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

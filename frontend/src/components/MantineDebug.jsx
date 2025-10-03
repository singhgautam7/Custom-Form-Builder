"use client"
import React, { useEffect, useState } from 'react'

export default function MantineDebug(){
  const [val, setVal] = useState(null)
  useEffect(()=>{
    try{
      const cs = getComputedStyle(document.documentElement)
      const v = cs.getPropertyValue('--mantine-color-brand-5') || cs.getPropertyValue('--mantine-color-brand-6')
      setVal(v && v.trim() ? v.trim() : null)
    }catch(e){ setVal(null) }
  }, [])

  return (
    <div style={{ position: 'fixed', left: 12, bottom: 12, background: '#fff', border: '1px solid #eee', padding: '8px 10px', borderRadius: 8, fontSize: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
      <strong>mantine:</strong>&nbsp;<span style={{ color: val || '#999' }}>{val || 'no-var'}</span>
    </div>
  )
}

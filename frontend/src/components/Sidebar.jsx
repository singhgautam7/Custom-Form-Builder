"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { Box, Drawer, ScrollArea, Group, ThemeIcon, NavLink, Button } from '@mantine/core'
import { HiOutlineViewGrid, HiOutlineDocumentAdd, HiOutlineFolderOpen, HiOutlineClipboardList, HiOutlineChartBar, HiOutlineCog, HiOutlineLogout } from 'react-icons/hi'

const tabs = [
  { label: 'Dashboard', href: '/', icon: HiOutlineViewGrid },
  { label: 'Create Form', href: '/forms/create', icon: HiOutlineDocumentAdd },
  { label: 'My Forms', href: '/forms', icon: HiOutlineFolderOpen },
  { label: 'My Submissions', href: '/submissions', icon: HiOutlineClipboardList },
  { label: 'Reports & Analytics', href: '/reports', icon: HiOutlineChartBar },
  { label: 'Settings', href: '/settings', icon: HiOutlineCog },
]

export default function Sidebar({ collapsed, onToggle, className = '', currentPath = '/', onLogout, mobileOpen = false, onMobileToggle }) {
  const router = useRouter()
  // longest prefix match for active tab
  let activeHref = ''
  for (const t of tabs) {
    if (currentPath === t.href) { activeHref = t.href; break }
    if (currentPath.startsWith(t.href) && t.href.length > activeHref.length) activeHref = t.href
  }

  return (
    <>
      {/* Desktop sidebar (visible on md+) */}
      <div className="hidden md:block">
        <Box p="xs" style={{ width: 260 }} className={className}>
          {/* <div className="flex items-center justify-between px-2 py-1">
            <div style={{ fontWeight: 700, color: 'var(--mantine-color-brand-5, #2f95fb)' }}>Form Maker</div>
            <button onClick={() => onToggle && onToggle()} className="p-1 rounded hover:bg-gray-100">{collapsed ? '☰' : '◀'}</button>
          </div> */}

          <ScrollArea style={{ height: 'calc(100vh - 160px)' }} className="px-1">
            <div className="space-y-1 px-2 py-1">
              {tabs.map((t) => {
                const Icon = t.icon
                const isActive = t.href === activeHref
                return (
                  <div
                    key={t.href}
                    onClick={() => router.push(t.href)}
                    style={{ cursor: 'pointer', background: isActive ? 'var(--mantine-color-brand-1, #eaf3ff)' : undefined }}
                    className={`flex items-center gap-3 px-2 py-2 rounded ${isActive ? '' : 'text-gray-700'}`}>
                    <span style={{ display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: isActive ? 'var(--mantine-color-brand-7, #1f7de0)' : '#374151' }}>
                      <Icon />
                    </span>
                    <span style={{ color: isActive ? 'var(--mantine-color-brand-7, #1f7de0)' : undefined }}>{t.label}</span>
                  </div>
                )
              })}
            </div>
          </ScrollArea>

          <div className="px-2 py-2">
            <div
              onClick={() => (onLogout ? onLogout() : null)}
              style={{ cursor: 'pointer' }}
              className={`flex items-center gap-3 px-2 py-2 rounded text-gray-700`}>
              <span style={{ display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: '#b50704' }}>
                <HiOutlineLogout />
              </span>
              <span style={{ color: '#b50704'}}>Logout</span>
            </div>
          </div>
        </Box>
      </div>

      {/* Mobile Drawer */}
      <Drawer opened={mobileOpen} onClose={() => onMobileToggle && onMobileToggle(false)} size="xs" padding="sm">
        <div className="mb-3 flex items-center justify-between">
          <div style={{ fontWeight: 700, color: 'var(--mantine-color-brand-5, #2f95fb)' }}>Form Maker</div>
          <button onClick={() => onToggle && onToggle()} className="p-1 rounded hover:bg-gray-100">{collapsed ? '☰' : '◀'}</button>
        </div>
        <ScrollArea style={{ height: 'calc(100vh - 160px)' }}>
          {tabs.map((t) => {
            const Icon = t.icon
            const isActive = t.href === activeHref
            return (
              <div
                key={t.href}
                onClick={() => { router.push(t.href); onMobileToggle && onMobileToggle(false) }}
                className={`block px-2 py-2 rounded`}
                style={{ cursor: 'pointer', background: isActive ? 'var(--mantine-color-brand-1, #eaf3ff)' : undefined }}>
                <div className="flex items-center gap-3">
                  <span style={{ display: 'inline-flex', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: isActive ? 'var(--mantine-color-brand-7, #1f7de0)' : '#374151' }}>
                    <Icon />
                  </span>
                  <div style={{ color: isActive ? 'var(--mantine-color-brand-7, #1f7de0)' : undefined }}>{t.label}</div>
                </div>
              </div>
            )
          })}
        </ScrollArea>

        <div className="mt-4">
          <button onClick={() => (onLogout ? onLogout() : null)} className="w-full px-3 py-2 rounded text-sm font-medium" style={{ background: 'var(--mantine-color-red-0, #fff5f5)', color: 'var(--mantine-color-red-7, #c53030)', border: '1px solid rgba(220,38,38,0.08)' }}>
            Logout
          </button>
        </div>
      </Drawer>
    </>
  )
}

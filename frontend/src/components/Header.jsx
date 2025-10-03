"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
import { Group, ActionIcon, Button, Title } from '@mantine/core'
import { FiPlusCircle } from 'react-icons/fi'

export default function Header({ onToggle, onLogout }){
  const router = useRouter()
  return (
    <div className="border-b bg-white" style={{ height: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 16px' }}>
        <Group>
          <ActionIcon variant="light" onClick={onToggle} aria-label="Toggle sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </ActionIcon>
          <Title order={4} style={{ color: 'var(--mantine-color-brand-5, #2f95fb)', margin: 0 }}>Form Maker</Title>
        </Group>

        <Group>
          <Button leftSection={<FiPlusCircle size={16} />} color="brand" variant="subtle" onClick={() => router.push('/forms/create')} className="inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-medium" style={{ border: '1px solid rgba(59,130,246,0.12)', background: '#f0f8ff', color: '#1f7de0' }}>
            Create Form
          </Button>
        </Group>
      </div>
    </div>
  )
}

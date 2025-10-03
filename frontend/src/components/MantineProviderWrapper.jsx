"use client"
import React from 'react'
import { MantineProvider } from '@mantine/core'

export default function MantineProviderWrapper({ children }){
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{
      colors: {
        // Brand palette centered on accent #659DFB
        brand: ['#eaf3ff', '#cfe9ff', '#9ed3ff', '#6fb9ff', '#4aa8ff', '#2f95fb', '#1f7de0', '#175fb8', '#114589', '#0a2a59']
      },
      primaryColor: 'brand',
      primaryShade: 5,
      colorScheme: 'light',
      components: {
        Button: { defaultProps: { radius: 'md' } }
      }
    }}>
      {children}
    </MantineProvider>
  )
}

"use client"
import React from 'react'
import { MantineProvider } from '@mantine/core'

export default function MantineProviderWrapper({ children }){
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{
      colors: {
        brand: ['#e6f0ff', '#cce1ff', '#99c3ff', '#66a6ff', '#3388ff', '#006bff', '#0059cc', '#004499', '#002d66', '#001433']
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

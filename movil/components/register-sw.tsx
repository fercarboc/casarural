'use client'

import { useEffect } from 'react'

export function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch(() => {
          // Fallo silencioso — la app funciona igual sin SW
        })
    }
  }, [])

  return null
}

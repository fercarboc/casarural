'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (!isAdmin) {
      supabase.auth.signOut().then(() => router.replace('/login'))
    }
  }, [user, loading, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) return null

  return <>{children}</>
}

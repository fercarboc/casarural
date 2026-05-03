'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Si ya hay sesión, redirige directo
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) router.replace('/')
      else setChecking(false)
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.replace('/')
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 safe-area-top safe-area-bottom">
      {/* Logo / Brand */}
      <div className="mb-10 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-primary-foreground">R</span>
        </div>
        <h1 className="text-2xl font-bold">La Rasilla</h1>
        <p className="text-sm text-muted-foreground mt-1">Panel de administración</p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-secondary border-0 text-sm"
              autoComplete="email"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-secondary border-0 text-sm"
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center bg-destructive/10 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-sm font-semibold"
          disabled={loading || !email.trim() || !password.trim()}
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Entrando...</>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground mt-8">
        Solo accesible para administradores de La Rasilla
      </p>
    </div>
  )
}

import { AuthGuard } from '@/components/auth-guard'
import { BottomNav } from '@/components/admin/bottom-nav'

// Panel privado — nunca prerenderizar: las páginas protegidas necesitan
// la sesión de Supabase que solo existe en el cliente en tiempo de ejecución.
export const dynamic = 'force-dynamic'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <main className="max-w-lg mx-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  )
}

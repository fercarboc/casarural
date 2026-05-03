import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'primary' | 'warning' | 'success'
}

export function StatsCard({ title, value, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
  return (
    <Card className={cn(
      'p-4 flex flex-col gap-2',
      variant === 'primary' && 'bg-primary text-primary-foreground',
      variant === 'warning' && 'bg-yellow-50 border-yellow-200',
      variant === 'success' && 'bg-emerald-50 border-emerald-200'
    )}>
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-xs font-medium',
          variant === 'default' && 'text-muted-foreground',
          variant === 'primary' && 'text-primary-foreground/80',
          variant === 'warning' && 'text-yellow-700',
          variant === 'success' && 'text-emerald-700'
        )}>
          {title}
        </span>
        <Icon className={cn(
          'h-4 w-4',
          variant === 'default' && 'text-muted-foreground',
          variant === 'primary' && 'text-primary-foreground/70',
          variant === 'warning' && 'text-yellow-600',
          variant === 'success' && 'text-emerald-600'
        )} />
      </div>
      <div className="flex items-end justify-between">
        <span className={cn(
          'text-2xl font-bold',
          variant === 'warning' && 'text-yellow-900',
          variant === 'success' && 'text-emerald-900'
        )}>
          {value}
        </span>
        {trend && (
          <span className={cn(
            'text-xs font-medium',
            trend.isPositive ? 'text-emerald-600' : 'text-red-600'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
    </Card>
  )
}

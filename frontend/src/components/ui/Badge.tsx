import React from 'react'
import clsx from 'clsx'

type Variant = 'default' | 'success' | 'warning' | 'danger'

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  /** @deprecated Use variant instead */
  tone?: 'neutral' | 'success' | 'warning'
  variant?: Variant
}

export default function Badge({ className, tone, variant, ...props }: Props) {
  // Support both tone (legacy) and variant (new)
  const v = variant ?? (tone === 'neutral' ? 'default' : tone) ?? 'default'

  const styles: Record<Variant, string> = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs',
        styles[v],
        className
      )}
      {...props}
    />
  )
}

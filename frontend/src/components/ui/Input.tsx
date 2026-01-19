import React from 'react'
import clsx from 'clsx'

type Props = React.InputHTMLAttributes<HTMLInputElement>

export default function Input({ className, ...props }: Props) {
  return (
    <input
      className={clsx(
        'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-300',
        className
      )}
      {...props}
    />
  )
}

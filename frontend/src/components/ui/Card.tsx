import React from 'react'
import clsx from 'clsx'

type Props = React.HTMLAttributes<HTMLDivElement>

export default function Card({ className, ...props }: Props) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-lg',
        className
      )}
      {...props}
    />
  )
}
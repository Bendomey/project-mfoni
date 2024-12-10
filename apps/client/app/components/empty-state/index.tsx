import {EmptyLottie} from '@/components/lotties/empty.tsx'
import { type PropsWithChildren } from 'react'

interface Props {
  title: string
  message: string
  svg?: any
}

export function EmptyState({message, title, svg, children}: PropsWithChildren<Props>) {
  return (
    <div className="text-center">
      {svg ? svg : <EmptyLottie />}
      <h3 className="mt-2 text-2xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {
        children ? (
          <div className="mt-6">
            {children}
          </div>
        ) : null
      }
    </div>
  )
}

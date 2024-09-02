import { type PropsWithChildren } from 'react'
import { ReactQueryProvider } from './react-query/index.tsx'
import { AuthProvider } from './auth/index.tsx'

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ReactQueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </ReactQueryProvider>
  )
}

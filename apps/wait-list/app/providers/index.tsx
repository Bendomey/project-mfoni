import {type PropsWithChildren} from 'react'
import {ReactQueryProvider} from './react-query/index.tsx'

export const Providers = ({children}: PropsWithChildren) => {
  return (
    <ReactQueryProvider>
 {children}
    </ReactQueryProvider>
  )
}

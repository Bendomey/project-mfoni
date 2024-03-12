import {type PropsWithChildren} from 'react'
import {ReactQueryProvider} from './react-query/index.tsx'
import {WaitListModalProvider} from './walt-list-popup/index.tsx'

export const Providers = ({children}: PropsWithChildren) => {
  return (
    <ReactQueryProvider>
      <WaitListModalProvider>{children}</WaitListModalProvider>
    </ReactQueryProvider>
  )
}

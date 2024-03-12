import {useBoolean} from '@/hooks/use-boolean.ts'
import WaitListForm from '@/modules/landing-page/modals/wait-list-form/index.tsx'
import React, {useContext, type PropsWithChildren} from 'react'

interface ModalContextType {
  showWaitListForm: boolean
  setShowWaitListForm: React.Dispatch<React.SetStateAction<boolean>>
  handleShowWaitListForm: () => void
  handleCloseWaitListForm: () => void
}

const WaitListModalContext = React.createContext<ModalContextType>(
  {} as ModalContextType,
)

export const WaitListModalProvider = ({children}: PropsWithChildren) => {
  const {value: showWaitListForm, setValue, setFalse, setTrue} = useBoolean()

  return (
    <WaitListModalContext.Provider
      value={{
        showWaitListForm,
        setShowWaitListForm: setValue,
        handleCloseWaitListForm: setFalse,
        handleShowWaitListForm: setTrue,
      }}
    >
      {children}
      <WaitListForm
        show={showWaitListForm}
        setShow={setValue}
        handleClose={setFalse}
      />
    </WaitListModalContext.Provider>
  )
}

export const useWaitListModal = () => useContext(WaitListModalContext)

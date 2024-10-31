import {useState} from 'react'

interface Params {
  isOpened?: boolean
}

export const useDisclosure = (params?: Params) => {
  const [isOpened, setIsOpened] = useState(() => params?.isOpened ?? false)

  const onOpen = () => setIsOpened(true)
  const onClose = () => setIsOpened(false)
  const onToggle = () => setIsOpened(prev => !prev)

  return {
    isOpened,
    onOpen,
    onClose,
    onToggle,
  }
}

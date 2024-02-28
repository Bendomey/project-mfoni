import {useCallback, useState} from 'react'

export const useDisclosure = () => {
  const [isOpen, setIsOpen] = useState(false)

  const onOpen = useCallback(() => setIsOpen(true), [])
  const onClose = useCallback(() => setIsOpen(false), [])
  const onToggle = useCallback(() => setIsOpen(prev => !prev), [])

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  }
}

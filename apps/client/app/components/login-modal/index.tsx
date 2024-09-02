import { LoginModule } from '@/modules/auth/login/index.tsx';
import React, { useRef } from 'react'

interface Props {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
}

export const LoginModal = ({showModal, setShowModal}: Props) => {
    const modalRef = useRef<HTMLDivElement>(null)

  // Handle click outside the modal to close it
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setShowModal(false)
    }
  }
  return (
    <>
      {showModal ? (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={handleBackdropClick}>
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                X
              </button>
                <h2>Login</h2>
                <LoginModule />
              
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}


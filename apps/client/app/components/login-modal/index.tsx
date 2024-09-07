import { LoginModule } from '@/modules/auth/login/index.tsx';
import React, { useEffect, useRef } from 'react'

interface Props {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
}

export const LoginModal = ({showModal, setShowModal}: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (showModal && dialogRef.current) {
      dialogRef.current.showModal(); // Open the dialog
    } else if (dialogRef.current) {
      dialogRef.current.close(); // Close the dialog
    }
  }, [showModal]);

  // Handle click outside the modal to close it
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      setShowModal(false);
    }
  };

  // Handle key events to simulate clicks
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
      setShowModal(false); // Simulate the button click
    }
  };
  
  return (
    <>
      {showModal ? (
        
          <dialog  className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          ref={dialogRef}    
          aria-modal="true"     
          onClick={handleBackdropClick}
                  
          >
            <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}     
            tabIndex={0}   
            onKeyDown={handleKeyDown}
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
          </dialog>
        
      ) : null}
    </>
  )
}


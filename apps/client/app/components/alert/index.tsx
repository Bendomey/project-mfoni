import React from 'react'

interface Props {
    message: string;
    onClose: () => void;
}

export const Alert = ({ message, onClose}: Props) => {

  return (
    <div className="p-4 mb-4 text-sm  bg-gray-200 rounded-lg flex justify-between items-center w-48">
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-lg font-bold text-blue-700 hover:text-blue-900"
      >
        &times;
      </button>
    </div>
  )
}

 
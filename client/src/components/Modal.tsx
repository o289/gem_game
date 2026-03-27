// src/components/Modal.tsx

import React from 'react'

type ModalProps = {
  isOpen: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-gray-800 p-5 rounded-lg flex flex-col gap-2">
        <div>{title}</div>

        <div>{children}</div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 rounded"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
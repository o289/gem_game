// src/components/ui/Modal.tsx

import React from "react"

type ModalProps = {
  isOpen: boolean
  onClose?: () => void
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose} // 背景クリックで閉じる
    >
      <div
        className="bg-gray-800 p-4 rounded-lg"
        onClick={(e) => e.stopPropagation()} // 中身クリックで閉じない
      >
        {children}
      </div>

      {onClose && (
        <button
          className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded"
          onClick={onClose}
        >
          閉じる
        </button>
      )}
    </div>
  )
}
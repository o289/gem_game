// DragContext.tsx
import { createContext, useContext } from 'react'
import { useDrag } from '../hooks/useDrag'

const DragContext = createContext<ReturnType<typeof useDrag> | null>(null)

export const DragProvider = ({ children }: { children: React.ReactNode }) => {
  const drag = useDrag()
  return (
    <DragContext.Provider value={drag}>
      {children}
    </DragContext.Provider>
  )
}

export const useDragContext = () => {
  const ctx = useContext(DragContext)
  if (!ctx) throw new Error('useDragContext must be used within DragProvider')
  return ctx
}
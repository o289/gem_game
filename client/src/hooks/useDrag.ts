import { useState } from 'react'
import { TokenColor, Card } from 'shared/types'

export type DragItem =
  | { type: 'card'; data: Card } // 後でCardDataに
  | { type: 'token'; data: TokenColor }

export const useDrag = () => {
  const [dragItem, setDragItem] = useState<DragItem | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const startDrag = (item: DragItem, x: number, y: number) => {
    setDragItem(item)
    setPosition({ x, y })
  }

  const moveDrag = (x: number, y: number) => {
    if (!dragItem) return
    setPosition({ x, y })
  }

  const endDrag = () => {
    setDragItem(null)
    setPosition({ x: 0, y: 0 })
  }

  return {
    dragItem,
    dragging: dragItem !== null,
    position,
    startDrag,
    moveDrag,
    endDrag
  }
}
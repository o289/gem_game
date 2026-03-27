import { useState } from "react"
import { Card } from "shared/types"

export const useCardSelection = () => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const selectCard = (card: Card) => {
    setSelectedCard(card)
    setShowDialog(true)
  }

  return {
    selectedCard,
    showDialog,
    selectCard,
    closeDialog: () => setShowDialog(false)
  }
}
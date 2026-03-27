// server/src/routes/game.ts
import { Router } from 'express'
import { roomManager } from '../room/RoomManager'

import { buyCardAndReturn, reserveCardAndReturn, takeSameTokensAndReturn, takeDifferentTokensAndReturn } from '../game/actions'

const router = Router()

router.get('/:roomId/game', (req, res) => {
  const { roomId } = req.params

  const gameState = roomManager.getGameState(roomId)

  res.json(gameState)
})

router.post('/:roomId/game/take-tokens', (req, res) => {
  const { roomId } = req.params
  const { playerId, tokens } = req.body

  let gameState = roomManager.getGameState(roomId)

  if (tokens.length === 2) {
    gameState = takeSameTokensAndReturn(gameState, {
      playerId,
      color: tokens[0]
    })
  }

  if (tokens.length === 3) {
    gameState = takeDifferentTokensAndReturn(gameState, {
      playerId,
      colors: tokens
    })
  }

  roomManager.setGameState(roomId, gameState)

  res.json(gameState)
})

router.post('/:roomId/game/buy-card', (req, res) => {
  const { roomId } = req.params
  const { playerId, cardId } = req.body

  let gameState = roomManager.getGameState(roomId)

  gameState = buyCardAndReturn(gameState, { playerId, cardId })

  roomManager.setGameState(roomId, gameState)

  res.json(gameState)
})

router.post('/:roomId/game/reserve-card', (req, res) => {
  const { roomId } = req.params
  const { playerId, cardId } = req.body

  let gameState = roomManager.getGameState(roomId)

  gameState = reserveCardAndReturn(gameState, { playerId, cardId })

  roomManager.setGameState(roomId, gameState)

  res.json(gameState)
})


export default router
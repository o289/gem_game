// src/components/MyPanel.tsx

import React, { useState } from 'react'

import { useDragContext } from '../context/DragContext'
import { useTokenContext } from '../context/TokenContext'
import { useGameContext } from '../context/GameContext'

import { CardData } from './Card'
import { Modal } from './ui/Modal'
import { socketClient } from '../socket/socketClient'
import { Card } from 'shared/types'


export const MyPanel: React.FC = () => {
  const { dragItem, endDrag, dragging } = useDragContext()
  const { addToken, canSelectToken, resetTokens, selectedTokens } = useTokenContext()

  const [showDialog, setShowDialog] = useState(false)
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [showTokenDialog, setShowTokenDialog] = useState(false)
  const [showOwnedTokensDialog, setShowOwnedTokensDialog] = useState(false)
  const [showReserved, setShowReserved] = useState(false)
  const [showBonus, setShowBonus] = useState(false)
  const [showPlayerInfo, setShowPlayerInfo] = useState(false)

  const { myPlayerId, isMyTurn, myPlayer, roomId } = useGameContext()
  
  const reservedCards = myPlayer?.reservedCards || []

  const handleDrop = () => {
    if (!dragItem) return

    console.log('dropped:', dragItem)

    // --- CARD ---
    if (dragItem.type === 'card') {
      setSelectedCard(dragItem.data)
      setShowDialog(true)
      endDrag()
      return
    }

    // --- TOKEN ---
    if (dragItem.type === 'token') {
      if (!canSelectToken(dragItem.data)) {
        endDrag()
        return
      }
      // Contextへ反映（これが本質）
      addToken(dragItem.data)

      // ContextのselectedTokensをベースに次状態を計算（ローカルstateは使わない）
      const next = [...selectedTokens, dragItem.data]

      // 2枚目
      if (next.length === 2) {
        const [first, second] = next

        // 同じ色 → 即ダイアログ
        if (first === second) {
          setShowTokenDialog(true)
        }
      }

      // 3枚目（異色3枚）
      if (next.length === 3) {
        setShowTokenDialog(true)
      }

      endDrag()
      return
    }
  }

  return (
    <>
      <div className="mb-2">
        

      </div>
      <div
        className={`fixed bottom-0 left-0 w-full z-50 p-2 bg-gray-800 flex gap-2 overflow-x-auto border-t border-white/10 min-h-[100px] pb-[env(safe-area-inset-bottom)] ${dragging ? 'border-blue-400 bg-gray-700' : 'border-gray-500'}`}
        onPointerUp={handleDrop}
      >
        <button
          className={`px-3 py-1 rounded mb-2 bg-yellow-500`}
          onClick={() => setShowReserved(prev => !prev)}
        >
          予約
        </button>

        <button
          className={`px-3 py-1 rounded mb-2 bg-blue-700`}
          onClick={() => setShowOwnedTokensDialog(true)}
        >
          トークン
        </button>

        <button
          className={`px-3 py-1 rounded mb-2 bg-green-700`}
          onClick={() => setShowBonus(true)}
        >
          ボーナス
        </button>
        <button
          className={`px-3 py-1 rounded mb-2 bg-purple-700`}
          onClick={() => setShowPlayerInfo(true)}
        >
          プレイヤー
        </button>
      </div>

      <Modal isOpen={showDialog && !!selectedCard} >
        <div className="flex flex-col gap-4">
          <div>カードアクション</div>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded ${isMyTurn ? 'bg-green-500' : 'bg-gray-500'}`}
              onClick={() => {
                socketClient.buyCard(roomId, myPlayerId, selectedCard.id)
                setShowDialog(false)
              }}
              disabled={!isMyTurn}
            >
              購入
            </button>
            <button
              className={`px-3 py-1 rounded ${isMyTurn ? 'bg-yellow-500' : 'bg-gray-500'}`}
              onClick={() => {
                socketClient.reserveCard(roomId, myPlayerId, selectedCard.id)
                setShowDialog(false)
              }}
              disabled={!isMyTurn}
            >
              予約
            </button>
            <button
              className="px-3 py-1 bg-gray-500 rounded"
              onClick={() => setShowDialog(false)}
            >
              やめる
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showTokenDialog} >
        <div className="flex flex-col gap-4">
          {isMyTurn && (
            <>
              <div>トークン取得</div>
              <div className="flex gap-2">
                {selectedTokens.map((t, i) => (
                  <div key={i} className="px-2 py-1 border">{t}</div>
                ))}
              </div>
              <button
                className={`px-3 py-1 rounded ${isMyTurn ? 'bg-blue-500' : 'bg-gray-500'}`}
                onClick={() => {
                  socketClient.takeTokens(roomId, myPlayerId, selectedTokens)
                  resetTokens()
                  setShowTokenDialog(false)
                }}
                disabled={selectedTokens.length === 0}
              >
                確定
              </button>
              <button
                className="px-3 py-1 bg-gray-500 rounded"
                onClick={() => {
                  resetTokens()
                  setShowTokenDialog(false)
                }}
              >
                やり直す
              </button>
            </>
          )}
        </div>
      </Modal>
      <Modal isOpen={showOwnedTokensDialog} onClose={() => setShowOwnedTokensDialog(false)}>
        <div className="flex flex-col gap-4">
          <div>所持トークン</div>
          <div className="flex gap-2">
            {Object.entries(myPlayer?.tokens || {}).map(([token, count]) => (
              <div key={token} className="px-2 py-1 border">
                <img
                  src={`/img/${token}.png`}
                  className="w-4 h-4"
                  draggable={false}
                />
                x{count as number}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    <Modal isOpen={showReserved} onClose={() => setShowReserved(false)}>
      <div className="flex gap-4">
        {reservedCards.map((card: Card) => (
          <div
            key={card.id}
            className="w-[100px] h-[140px] border border-yellow-400 flex items-center justify-center cursor-pointer hover:scale-110 transition"
            onClick={() => {
              setSelectedCard(card)
              setShowDialog(true)
              setShowReserved(false)
            }}
          >
            <CardData card={card} />
          </div>
        ))}
      </div>
    </Modal>
    <Modal isOpen={showBonus} onClose={() => setShowBonus(false)}>
      <div className="flex flex-col gap-4">
        <div>ボーナス</div>
        <div className="flex gap-2">
          {Object.entries(myPlayer?.bonuses || {}).map(([token, count]) => (
            <div key={token} className="px-2 py-1 border">
              <img
                  src={`/img/${token}.png`}
                  className="w-4 h-4"
                  draggable={false}
                />
                x{count as number}
            </div>
          ))}
        </div>
      </div>
    </Modal>
    <Modal isOpen={showPlayerInfo} onClose={() => setShowPlayerInfo(false)}>
      <div className="flex flex-col gap-4">
        <div>プレイヤー情報</div>
        <div>名前: {myPlayer?.name}</div>
        <div>スコア: {myPlayer?.point}</div>
      </div>
    </Modal>
    </>
  )
}
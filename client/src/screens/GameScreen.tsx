// src/screens/GameScreen.tsx

import React, { useEffect, useState } from 'react'

import { Board } from '../components/Board'
import { TokenArea } from '../components/TokenArea'
import { Modal } from '../components/ui/Modal'


import { api } from '../api/apiClient'
import { socketClient } from '../socket/socketClient'

import { useGameContext } from '../context/GameContext'
import { useTokenContext } from '../context/TokenContext'

import { CardData } from '../components/Card'

import { Card } from 'shared/types'
import { useAssets } from '../hooks/useAssets'
import { isGameError } from "shared/errors/errorCodes";
import { playSound } from 'src/util/sound'


type GameScreenProps = {
  roomId: string
}

export const GameScreen: React.FC<GameScreenProps> = ({roomId}) => {
  // ===== データ ===== 
  const { gameState, setGameState, myPlayerId, isMyTurn, myPlayer, actionState, setActionState } = useGameContext()
  const { resetTokens, selectedTokens } = useTokenContext()
  const assetsLoaded = useAssets()
  const decks = gameState?.decks
  const levels = [1, 2, 3] as const
  
  // ===== 状態 =====
  const [showMyInfo, setShowMyInfo] = useState<string | false>(false)
  const [showDeck, setShowDeck] = useState<boolean>(false)
  const [playerIndex, setPlayerIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showTurnModal, setShowTurnModal] = useState(false)
  const [prevTurn, setPrevTurn] = useState<number | null>(null)
  
  
  // ===== UI =====
  useEffect(() => {
    api.get(`/room/${roomId}/game`)
      .then(data => {
        console.log('decks:', data)
        setGameState(data)
      })
      .catch(err => {
        console.error('API error:', err)
      })
  }, [])

  useEffect(() => {
    socketClient.onGameStateUpdate((state) => {
      setGameState(state)
    })

    return () => {
      socketClient.offGameStateUpdate()
    }
  }, [roomId])

  useEffect(() => {
    if (gameState) {
      if (prevTurn !== null && gameState.turn !== prevTurn) {
        setShowTurnModal(true)

        setTimeout(() => {
          setShowTurnModal(false)
        }, 1000)
      }

      setPrevTurn(gameState.turn)
    }
  }, [gameState?.turn])

  useEffect(() => {
    socketClient.onActionError((err) => {
      
      if (!isGameError(err.code)) return;

      setError(err.message)

      // 自動クローズ
      setTimeout(() => {
        setError(null)
      }, 1500)
    })

    return () => {
      socketClient.offActionError()
    }
  }, [])


  if (!gameState || !assetsLoaded) return <div className='flex flex-col items-center justify-center min-h-dvh px-4 gap-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white'>Loading...</div>;


  return (
    <div 
      className="flex flex-col h-dvh w-full bg-gradient-to-br from-zinc-900 via-neutral-800 to-zinc-900 text-white select-none pb-[env(safe-area-inset-bottom)] overflow-hidden touch-none"
    >

      <div className="flex flex-col flex-1 bg-white/5 backdrop-blur-md p-2 relative">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-60" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:6px_6px]" />
        
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button
            className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center"
            onClick={() => {
              const index = gameState.players.findIndex(p => p.id === myPlayerId)
              setPlayerIndex(index >= 0 ? index : 0)
              setShowMyInfo(myPlayerId)
            }}
          >
            📖
          </button>
          <button
            className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center"
            onClick={() => {
              setShowDeck(true)
            }}
          >
            🃏
          </button>
        </div>


        
        {/* ボード */}
        <Board
          market={gameState.market}
          nobles={gameState.nobles}
        />

        {/* トークンエリア */}
        <TokenArea
          tokens={gameState.tokenPool}
        />

        {/* アクションモーダル */}
        <Modal isOpen={actionState.type === 'card_selected'}>
          {actionState.type === 'card_selected' && (
            <div className="flex flex-col gap-4">
              <div>カードアクション</div>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded ${isMyTurn ? 'bg-green-500' : 'bg-gray-500'}`}
                  onClick={() => {
                    setActionState({
                        type: "payment_selecting",
                        card: actionState.card,
                        source: actionState.source
                      })
                  }}
                  disabled={!isMyTurn}
                >
                  購入
                </button>
                {actionState.source === 'market' && (
                  <button
                    className={`px-3 py-1 rounded ${isMyTurn ? 'bg-yellow-500' : 'bg-gray-500'}`}
                    onClick={() => {
                      socketClient.reserveCard({type: "market", roomId, playerId: myPlayerId, cardId: actionState.card.id})
                      setActionState({ type: 'none' })
                    }}
                    disabled={!isMyTurn}
                  >
                    予約
                  </button>
                )}
                <button
                  className="px-3 py-1 bg-gray-500 rounded"
                  onClick={() => setActionState({ type: 'none' })}
                >
                  やめる
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* 購入画面 */}
        <Modal isOpen={actionState.type === 'payment_selecting'}>
          
          {actionState.type === 'payment_selecting' && (
            <div className="flex flex-col gap-4">
              <div className="text-lg font-bold">支払い選択</div>

              {/* カード表示 */}
              <div className="flex justify-center">
                <div className="w-[100px] h-[140px] border flex items-center justify-center">
                  <CardData card={actionState.card} />
                </div>
              </div>

              {/* 支払いUI */}
              <div className="flex flex-col gap-2">
                {Object.keys(myPlayer.tokens).map((color) => {
                  const owned = myPlayer.tokens[color as keyof typeof myPlayer.tokens]
                  const cost = actionState.card.cost[color as keyof typeof actionState.card.cost] ?? 0
                  const bonus = myPlayer.bonuses[color as keyof typeof myPlayer.bonuses] ?? 0
                  const required = Math.max(cost - bonus, 0)
                  const current = (actionState as any).payment?.[color] ?? 0
                  const remaining = Math.max(required - current, 0)

                  return (
                    <div key={color} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img src={`/img/${color}.png`} className="w-6 h-6" />
                        <span>x{owned}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={!isMyTurn || current <= 0}
                          className={`px-2 py-1 rounded ${current <= 0 || !isMyTurn ? 'bg-gray-400' : 'bg-gray-600'}`}
                          onClick={() => {
                            setActionState((prev: any) => {
                              const payment = prev.payment ?? {
                                emerald: 0,
                                diamond: 0,
                                sapphire: 0,
                                onyx: 0,
                                ruby: 0,
                                gold: 0,
                              }

                              if (payment[color] <= 0) return prev

                              return {
                                ...prev,
                                payment: {
                                  ...payment,
                                  [color]: payment[color] - 1,
                                },
                              }
                            })
                          }}
                        >
                          -
                        </button>

                        <div className="w-6 text-center">
                          {current}
                        </div>

                        <button
                          disabled={!isMyTurn || current >= owned || (color !== 'gold' && current >= required)}
                          className={`px-2 py-1 rounded ${!isMyTurn || current >= owned || (color !== 'gold' && current >= required) ? 'bg-gray-400' : 'bg-blue-600'}`}
                          onClick={() => {
                            setActionState((prev: any) => {
                              const payment = prev.payment ?? {
                                emerald: 0,
                                diamond: 0,
                                sapphire: 0,
                                onyx: 0,
                                ruby: 0,
                                gold: 0,
                              }

                              if (payment[color] >= owned) return prev
                              if (color !== 'gold' && payment[color] >= required) return prev

                              return {
                                ...prev,
                                payment: {
                                  ...payment,
                                  [color]: payment[color] + 1,
                                },
                              }
                            })
                          }}
                        >
                          +
                        </button>

                        <div className={`text-sm text-red-300 w-12 text-center ${color === 'gold' ? 'invisible' : ''}`}>
                          {remaining}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ボタン */}
              <div className="flex gap-2 justify-center">
                <button
                  className={`px-3 py-1 rounded ${isMyTurn ? 'bg-green-500' : 'bg-gray-500'}`}
                  onClick={() => {
                    socketClient.buyCard(
                      roomId,
                      myPlayerId,
                      actionState.card.id,
                      (actionState as any).payment
                    )
                    setActionState({ type: 'none' })
                  }}
                  disabled={!isMyTurn}
                >
                  購入
                </button>

                <button
                  className="px-3 py-1 bg-gray-500 rounded"
                  onClick={() => setActionState({ type: 'none' })}
                >
                  キャンセル
                </button>

                <button
                  className={`px-3 py-1 rounded ${isMyTurn ? 'bg-yellow-500' : 'bg-gray-500'}`}
                  onClick={() => {
                    socketClient.buyCard(roomId, myPlayerId, actionState.card.id)
                    setActionState({ type: 'none' })
                  }}
                  disabled={!isMyTurn}
                >
                  オート
                </button>
              </div>
            </div>
          )}
        </Modal>
        
        {/* トークン取得 */}
        <Modal isOpen={actionState.type === 'token_selecting'}>
          {actionState.type === 'token_selecting' && (
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
                      setActionState({ type: 'none' })
                    }}
                    disabled={selectedTokens.length === 0}
                  >
                    確定
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-500 rounded"
                    onClick={() => {
                      resetTokens()
                      setActionState({ type: 'none' })
                    }}
                  >
                    やり直す
                  </button>
                </>
              )}
            </div>
          )}
        </Modal>
        
        {/* プレイヤー情報 */}
        <Modal isOpen={!!showMyInfo} onClose={() => setShowMyInfo(false)}>
          <div className="gap-4">
            <div className="text-lg font-bold">プレイヤー情報</div>

            {/* プレイヤー切り替え */}
            <div className="flex items-center justify-between px-2">
              <button
                className="px-3 py-1 text-white/70"
                onClick={() => {
                  const newIndex = (playerIndex - 1 + gameState.players.length) % gameState.players.length
                  setPlayerIndex(newIndex)
                  setShowMyInfo(gameState.players[newIndex].id)
                }}
              >
                &lt;
              </button>

              <div className="font-bold text-blue-400">
                {gameState.players[playerIndex]?.name}
              </div>

              <button
                className="px-3 py-1 text-white/70"
                onClick={() => {
                  const newIndex = (playerIndex + 1) % gameState.players.length
                  setPlayerIndex(newIndex)
                  setShowMyInfo(gameState.players[newIndex].id)
                }}
              >
                &gt;
              </button>
            </div>

            {/* 表示対象プレイヤー */}
            {(() => {
              const targetPlayer =
                typeof showMyInfo === 'string'
                  ? gameState.players.find(p => p.id === showMyInfo)
                  : myPlayer

              if (!targetPlayer) return null

              return (
                <div className="flex flex-col gap-4">
                  <div>スコア: {targetPlayer.point}</div>

                  {/* ボーナス */}
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-sm text-yellow-300 mb-1">ボーナス</div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {Object.entries(targetPlayer.bonuses || {}).map(([token, count]) => (
                        <div
                          key={token}
                          className="flex-shrink-0 flex items-center gap-1 px-3 py-2 border rounded shadow-md shadow-black/30"
                        >
                          <img src={`/img/${token}.png`} className="w-5 h-5" draggable={false} />
                          <span>x{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* トークン */}
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-sm text-blue-300 mb-1">所持トークン</div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {Object.entries(targetPlayer.tokens || {}).map(([token, count]) => (
                        <div
                          key={token}
                          className="flex-shrink-0 flex items-center gap-1 px-3 py-2 border rounded shadow-md shadow-black/30"
                        >
                          <img src={`/img/${token}.png`} className="w-5 h-5" draggable={false} />
                          <span>x{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 予約カード（自分のみ操作可能） */}
                  {(
                    <div className="bg-white/5 rounded-lg p-2">
                      <div className="text-sm text-pink-300 mb-1">予約カード</div>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {targetPlayer.reservedCards.map((card: Card) => (
                          <div
                            key={card.id}
                            className={`w-[100px] h-[140px] flex-shrink-0 border border-yellow-400 flex items-center justify-center transition shadow-lg shadow-black/40 ${
                              targetPlayer.id === myPlayerId ? 'cursor-pointer hover:scale-110' : 'opacity-50 cursor-not-allowed'
                            }`}
                            onClick={() => {
                              if (targetPlayer.id !== myPlayerId) return
                              setActionState({ type: 'payment_selecting', card, source: 'reserved' })
                              setShowMyInfo(false)
                            }}
                          >
                            <CardData card={card} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </Modal>
        
        {/* 山札 */}
        <Modal isOpen={showDeck}  onClose={() => setShowDeck(false)}>
          <div className="flex gap-4 justify-center">
            {levels.map((level) => {
              if (!decks) return null
              
              const key = `level${level}` as keyof typeof decks
              const count = decks?.[key]?.length ?? 0

              return (
                <div
                  key={level}
                  onClick={() => {
                    if (!isMyTurn) return
                    playSound('card')
                    setActionState({ type: 'deck_reserve_confirm', level: key })
                  }}
                  className={`w-[100px] h-[140px] rounded-lg overflow-hidden relative flex items-center justify-center ${
                    isMyTurn
                      ? 'bg-gray-700 cursor-pointer'
                      : 'bg-gray-500 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <img
                    src={`/img/card_lv_${level}.png`}
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="relative text-lg font-bold">
                    {count}
                  </div>
                </div>
              )
            })}
          </div>
        </Modal>
        
        {/* 山札から予約 */}
        <Modal isOpen={actionState.type === 'deck_reserve_confirm'}>
          {actionState.type === 'deck_reserve_confirm' && (
            <div className="flex flex-col gap-4 items-center">
              <div>山札から予約しますか？</div>

              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded ${isMyTurn ? 'bg-yellow-500' : 'bg-gray-500'}`}
                  onClick={() => {
                    socketClient.reserveCard({
                      type: "deck",
                      roomId,
                      playerId: myPlayerId,
                      level: actionState.level
                    })
                    setActionState({ type: 'none' })
                    setShowDeck(false)
                  }}
                  disabled={!isMyTurn}
                >
                  予約する
                </button>

                <button
                  className="px-3 py-1 bg-gray-500 rounded"
                  onClick={() => setActionState({ type: 'none' })}
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </Modal>
        
        <Modal isOpen={showTurnModal}>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-lg text-gray-300">
              ターン: {gameState.turn}
            </div>
          </div>
        </Modal>

        <Modal isOpen={!!error}>
          <div className="flex flex-col items-center gap-4">
            <div className="text-red-400 text-lg font-bold">
              無効なアクション
            </div>
            <div className="text-center">
              {error}
            </div>
          </div>
        </Modal>

        {/* 勝利モーダル */}
        <Modal isOpen={gameState.roundEndTriggered === true}>
          <div className="flex flex-col items-center gap-4">
            <div className="text-2xl font-bold text-yellow-300">
              🎉 勝者
            </div>

            <div className="text-lg">
              {gameState.winnerName ?? "誰かが勝ちました"}
            </div>

            <button
              className="px-4 py-2 bg-blue-500 rounded"
              onClick={() => {
                if (!roomId) return
                socketClient.resetGame(roomId)
              }}
            >
              次のゲームへ
            </button>
          </div>
        </Modal>

      </div>
    </div>
  )
}
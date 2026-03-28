import { useState } from "react"
import { RoomPlayer } from "shared/types"
import { useGameConfig } from "src/context/GameConfigContext"
import { Modal } from '../components/ui/Modal'


type Props = {
    roomId: string
    roomPlayers: RoomPlayer[]
    playerId: string
    hostId: string
    isHost: boolean
    startGame: () => void
    handleLeaveRoom: () => void
}

export default function({ roomId, roomPlayers, playerId, hostId, isHost, startGame, handleLeaveRoom }: Props){
    const [copied, setCopied] = useState(false)
    const { config, setConfig } = useGameConfig()
    const winCondition = config.winCondition
    
    const [openMenu, setOpenMenu] = useState(false)
    const [showRule, setShowRule] = useState(false)
    
    const handleCopyRoomId = async () => {
        try {
        await navigator.clipboard.writeText(roomId)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
        } catch (err) {
        console.error("copy failed", err)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-dvh w-full px-4 gap-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
            <button
              className="absolute top-4 right-4 z-50 text-white text-2xl"
              onClick={() => setOpenMenu(!openMenu)}
            >
              ☰
            </button>
            {openMenu && (
              <div className="absolute top-14 right-4 bg-black/80 backdrop-blur border border-white/20 rounded-lg p-4 flex flex-col gap-2 z-50">
                <button
                  className="text-left hover:text-yellow-400"
                  onClick={() => {
                    setShowRule(true)
                    setOpenMenu(false)
                  }}
                >
                  ルールブック
                </button>
              </div>
            )}
            <div className="text-3xl font-bold tracking-wide bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            待機中...
            </div>

            <div
            className="w-full max-w-xs px-6 py-3 text-base rounded-xl bg-white/10 backdrop-blur border border-white/20 shadow-lg cursor-pointer hover:scale-105 transition-all"
            onClick={handleCopyRoomId}
            >
            <div className="text-sm text-gray-300">Room ID（タップでコピー）</div>
            <div className="text-xl font-semibold tracking-widest">{roomId}</div>
            {copied && <div className="text-xs text-green-400">コピーしました！</div>}
            </div>

            <div className="w-full max-w-xs px-6 py-4 text-base rounded-xl bg-white/10 backdrop-blur border border-white/20 shadow-lg flex flex-col gap-2">
            <div className="text-sm text-gray-300">プレイヤー</div>
            {roomPlayers.map((p) => (
                <div
                key={p.id}
                className="flex justify-between items-center px-2 py-1 rounded bg-white/5"
                >
                <span>{p.name}</span>
                {p.id === playerId && <span className="text-xs text-green-400">YOU</span>}
                {p.id === hostId && (
                    <span className="text-xs text-yellow-400">HOST</span>
                )}
                </div>
            ))}
            </div>

            {/* ルール設定 */}
            

            {isHost && (
            <>
                <div className="w-full max-w-xs px-6 py-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 shadow-lg flex flex-col gap-4">

                <div className="text-sm text-gray-300">ルール設定</div>

                {/* 勝利条件タイプ */}
                <div className="flex justify-between items-center">
                    <span>勝利条件</span>
                    <div className="flex items-center gap-2">
                    <button
                        onClick={() =>
                        setConfig({
                            ...config,
                            winCondition:
                            config.winCondition.type === "points"
                                ? { type: "turn_limit", maxTurns: 20 }
                                : { type: "points", target: 15 }
                        })
                        }
                    >
                        &lt;
                    </button>
                    <span className="text-sm">
                        {winCondition.type === "points" ? "ポイント" : "ターン"}
                    </span>
                    <button
                        onClick={() =>
                        setConfig({
                            ...config,
                            winCondition:
                            config.winCondition.type === "points"
                                ? { type: "turn_limit", maxTurns: 20 }
                                : { type: "points", target: 15 }
                        })
                        }
                    >
                        &gt;
                    </button>
                    </div>
                </div>

                {/* ポイント or ターン */}
                {winCondition.type === "points" ? (
                    <div className="flex justify-between items-center">
                    <span>ポイント</span>
                    <div className="flex items-center gap-2">
                        <button
                        onClick={() => {
                            const options = [10, 15, 20, 25, 30, 40]
                            const currentIndex = options.indexOf(winCondition.target)
                            const next = options[(currentIndex - 1 + options.length) % options.length]
                            setConfig({ ...config, winCondition: { type: "points", target: next } })
                        }}
                        >
                        &lt;
                        </button>
                        <span>{winCondition.target}</span>
                        <button
                        onClick={() => {
                            const options = [10, 15, 20, 25, 30, 40]
                            const currentIndex = options.indexOf(winCondition.target)
                            const next = options[(currentIndex + 1) % options.length]
                            setConfig({ ...config, winCondition: { type: "points", target: next } })
                        }}
                        >
                        &gt;
                        </button>
                    </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                    <span>ターン</span>
                    <div className="flex items-center gap-2">
                        <button
                        onClick={() => {
                            const options = [20, 25, 30, 35, 40]
                            const currentIndex = options.indexOf(winCondition.maxTurns)
                            const next = options[(currentIndex - 1 + options.length) % options.length]
                            setConfig({ ...config, winCondition: { type: "turn_limit", maxTurns: next } })
                        }}
                        >
                        &lt;
                        </button>
                        <span>{winCondition.maxTurns}</span>
                        <button
                        onClick={() => {
                            const options = [20, 25, 30, 35, 40]
                            const currentIndex = options.indexOf(winCondition.maxTurns)
                            const next = options[(currentIndex + 1) % options.length]
                            setConfig({ ...config, winCondition: { type: "turn_limit", maxTurns: next } })
                        }}
                        >
                        &gt;
                        </button>
                    </div>
                    </div>
                )}

                {/* デッキ枚数 */}
                <div className="flex justify-between items-center">
                    <span>カード枚数</span>
                    <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                        const options = [40, 50, 60, 70, 100]
                        const currentIndex = options.indexOf(config.deck.level1Count)
                        const next = options[(currentIndex - 1 + options.length) % options.length]
                        setConfig({ ...config, deck: { level1Count: next } })
                        }}
                    >
                        &lt;
                    </button>
                    <span>{config.deck.level1Count}</span>
                    <button
                        onClick={() => {
                        const options = [40, 50, 60, 70, 100]
                        const currentIndex = options.indexOf(config.deck.level1Count)
                        const next = options[(currentIndex + 1) % options.length]
                        setConfig({ ...config, deck: { level1Count: next } })
                        }}
                    >
                        &gt;
                    </button>
                    </div>
                </div>

                {/* ゴールド */}
                <div className="flex justify-between items-center">
                    <span>ゴールド</span>
                    <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                        const options = [3, 5, 7]
                        const currentIndex = options.indexOf(config.token.goldCount)
                        const next = options[(currentIndex - 1 + options.length) % options.length]
                        setConfig({ ...config, token: { goldCount: next } })
                        }}
                    >
                        &lt;
                    </button>
                    <span>{config.token.goldCount}</span>
                    <button
                        onClick={() => {
                        const options = [3, 5, 7]
                        const currentIndex = options.indexOf(config.token.goldCount)
                        const next = options[(currentIndex + 1) % options.length]
                        setConfig({ ...config, token: { goldCount: next } })
                        }}
                    >
                        &gt;
                    </button>
                    </div>
                </div>

                </div>

                <button
                    className="w-full max-w-xs px-6 py-3 text-base rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-105 transition-all shadow-lg"
                    onClick={startGame}
                >
                    ゲーム開始
                </button>
                </>
            )}

            <button
            className="w-full max-w-xs px-6 py-3 text-base rounded-lg font-semibold bg-gradient-to-r from-red-500 to-pink-600 hover:scale-105 transition-all shadow-lg"
            onClick={handleLeaveRoom}
            >
            ルーム退出
            </button>

            <Modal isOpen={showRule}>
              <div className="flex flex-col gap-4">
                <div className="text-lg font-bold text-white">ルール</div>
                <div className="text-sm text-gray-300 whitespace-pre-wrap">
                    {`    
                        ■ ゲーム概要
                        宝石トークンを集めて発展カードを購入し、
                        名声ポイントを獲得していくゲームです。

                        ■ 手番でできること（1つ選択）
                        ・異なる色のトークンを3つ取る
                        ・同じ色のトークンを2つ取る（4枚以上ある場合）
                        ・カードを予約してゴールドトークンを得る
                        ・カードを購入する

                        ■ カード
                        カードはポイントとボーナスを持ち、
                        ボーナスは次のカード購入時の割引になります。

                        ■ 貴族
                        条件を満たすと自動で訪問し、
                        3ポイント獲得できます。

                        ■ トークン制限
                        手番終了時、トークンは最大10枚までです。

                        ■ 勝利条件
                        規定ポイントに到達すると最終ラウンドへ。
                        最もポイントが高いプレイヤーが勝利します。
                    `}
                </div>
                <button
                  className="mt-2 w-full py-2 bg-white/10 border border-white/20 text-white rounded hover:bg-white/20 transition"
                  onClick={() => setShowRule(false)}
                >
                  閉じる
                </button>
              </div>
            </Modal>
        </div>
    )

    
}